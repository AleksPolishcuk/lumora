const express = require("express");
const {
  listContent,
  featured,
  search,
  getById,
  related,
  filtersMeta
} = require("../controllers/content.controller");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", optionalAuth, listContent);
router.get("/featured", optionalAuth, featured);
router.get("/search", optionalAuth, search);
router.get("/filters/meta", filtersMeta);
router.get("/:id", optionalAuth, getById);
router.get("/:id/related", optionalAuth, related);

module.exports = router;
