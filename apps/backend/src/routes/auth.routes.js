const express = require("express");
const { body } = require("express-validator");
const { register, login, refresh, me, logout } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  body("name").isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  register
);
router.post("/login", body("email").isEmail(), login);
router.post("/refresh", refresh);
router.get("/me", protect, me);
router.post("/logout", protect, logout);

module.exports = router;
