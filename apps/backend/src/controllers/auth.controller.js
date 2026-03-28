const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");

function buildAuthResponse(user) {
  const accessToken = signAccessToken({ id: user._id.toString(), email: user.email });
  const refreshToken = signRefreshToken({ id: user._id.toString(), email: user.email });
  return { accessToken, refreshToken };
}

async function register(req, res, next) {
  try {
    const { name, email, password, plan } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });
    const hash = await bcrypt.hash(password, 10);
    const safePlan = plan === "premium" ? "premium" : "free";
    const user = await User.create({
      name,
      email,
      password: hash,
      subscription: { plan: safePlan, isActive: true, startedAt: new Date() }
    });
    const tokens = buildAuthResponse(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, subscription: user.subscription },
      ...tokens
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });
    const tokens = buildAuthResponse(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    return res.json({ user: { id: user._id, name: user.name, email: user.email }, ...tokens });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token is required" });
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const accessToken = signAccessToken({ id: user._id.toString(), email: user.email });
    return res.json({ accessToken });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken");
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    return res.json({ message: "Logged out" });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, refresh, me, logout };
