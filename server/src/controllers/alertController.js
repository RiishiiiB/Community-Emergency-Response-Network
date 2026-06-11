import { Alert } from "../models/Alert.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMapsUrl(location = {}) {
  if (typeof location.lat !== "number" || typeof location.lng !== "number") {
    return location.mapsUrl;
  }

  return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
}

async function populateAlert(alert) {
  return alert.populate([
    { path: "citizen", select: "name email phone role guardians" },
    { path: "assignedResponder", select: "name email phone role" },
    { path: "timeline.actor", select: "name role" }
  ]);
}

function emitAlert(req, event, alert) {
  const io = req.app.get("io");

  if (!io) return;

  io.to("alerts:all").emit(event, { alert });
}

export const getAlerts = asyncHandler(async (req, res) => {
  const { status = "all", search = "" } = req.query;
  const filter = {};

  if (status !== "all") {
    filter.status = status;
  }

  if (search.trim()) {
    const safeSearch = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [
      { title: safeSearch },
      { description: safeSearch },
      { "location.address": safeSearch }
    ];
  }

  const alerts = await Alert.find(filter)
    .populate("citizen", "name email phone role guardians")
    .populate("assignedResponder", "name email phone role")
    .populate("timeline.actor", "name role")
    .sort({ status: 1, createdAt: -1 })
    .limit(100);

  res.json({ alerts });
});

export const getStats = asyncHandler(async (req, res) => {
  const [active, acknowledged, resolved, total] = await Promise.all([
    Alert.countDocuments({ status: "active" }),
    Alert.countDocuments({ status: "acknowledged" }),
    Alert.countDocuments({ status: "resolved" }),
    Alert.countDocuments({})
  ]);

  res.json({
    stats: {
      active,
      acknowledged,
      resolved,
      total
    }
  });
});

export const createAlert = asyncHandler(async (req, res) => {
  const {
    title = "Emergency SOS",
    type = "other",
    severity = "critical",
    description = "",
    location = {}
  } = req.body;

  const alert = await Alert.create({
    citizen: req.user._id,
    title,
    type,
    severity,
    description,
    location: {
      ...location,
      mapsUrl: buildMapsUrl(location)
    },
    contact: {
      name: req.user.name,
      phone: req.user.phone
    },
    timeline: [
      {
        status: "active",
        action: "creator",
        message: `${req.user.name} created the SOS as citizen`,
        actor: req.user._id
      }
    ]
  });

  const populatedAlert = await populateAlert(alert);
  emitAlert(req, "alert:new", populatedAlert);

  res.status(201).json({ alert: populatedAlert });
});

export const acknowledgeAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findOneAndUpdate(
    {
      _id: req.params.id,
      status: { $ne: "resolved" },
      $or: [{ assignedResponder: { $exists: false } }, { assignedResponder: null }]
    },
    {
      $set: {
        status: "acknowledged",
        assignedResponder: req.user._id
      },
      $push: {
        timeline: {
          status: "acknowledged",
          action: "acknowledger",
          message: `${req.user.name} acknowledged the alert as responder`,
          actor: req.user._id
        }
      }
    },
    { new: true, runValidators: true }
  );

  if (!alert) {
    const existingAlert = await Alert.findById(req.params.id);

    if (!existingAlert) {
      throw new AppError("Alert not found", 404);
    }

    if (existingAlert.status === "resolved") {
      throw new AppError("Resolved alerts cannot be acknowledged", 400);
    }

    throw new AppError("This alert has already been assigned to a responder", 409);
  }

  const populatedAlert = await populateAlert(alert);
  emitAlert(req, "alert:update", populatedAlert);

  res.json({ alert: populatedAlert });
});

export const resolveAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) {
    throw new AppError("Alert not found", 404);
  }

  if (alert.status === "resolved") {
    throw new AppError("Alert is already resolved", 400);
  }

  const note = req.body.note?.trim();

  alert.status = "resolved";
  alert.resolvedAt = new Date();
  alert.timeline.push({
    status: "resolved",
    action: "resolver",
    message: note || `${req.user.name} resolved the alert as responder`,
    actor: req.user._id
  });

  await alert.save();
  const populatedAlert = await populateAlert(alert);
  emitAlert(req, "alert:update", populatedAlert);

  res.json({ alert: populatedAlert });
});
