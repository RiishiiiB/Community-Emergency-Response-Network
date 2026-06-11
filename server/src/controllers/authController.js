import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/token.js";

const allowedRoles = new Set(["citizen", "responder", "admin"]);

function sendSession(res, user, statusCode = 200) {
  const token = signToken(user._id);
  res.status(statusCode).json({
    token,
    user: user.toSafeProfile()
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = "citizen", guardians = [] } = req.body;

  if (!allowedRoles.has(role)) {
    throw new AppError("Invalid account role", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    guardians
  });

  sendSession(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  sendSession(res, user);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeProfile() });
});
