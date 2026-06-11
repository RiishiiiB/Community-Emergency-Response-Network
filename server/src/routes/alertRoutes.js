import { Router } from "express";
import {
  acknowledgeAlert,
  createAlert,
  getAlerts,
  getStats,
  resolveAlert
} from "../controllers/alertController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getAlerts);
router.get("/stats", getStats);
router.post("/", createAlert);
router.patch("/:id/acknowledge", acknowledgeAlert);
router.patch("/:id/resolve", resolveAlert);

export default router;
