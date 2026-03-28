const express = require("express");
const { protect } = require("../middleware/auth");
const {
  toggleFavorite,
  getFavorites,
  toggleWatchLater,
  getWatchLater,
  rateContent,
  getRatings,
  getSubscription,
  subscribe
} = require("../controllers/user.controller");

const router = express.Router();

router.use(protect);

router.post("/favorites/:contentId", toggleFavorite);
router.get("/favorites", getFavorites);
router.post("/watch-later/:contentId", toggleWatchLater);
router.get("/watch-later", getWatchLater);
router.post("/ratings/:contentId", rateContent);
router.get("/ratings", getRatings);
router.get("/subscription", getSubscription);
router.post("/subscribe", subscribe);

module.exports = router;
