const User = require("../models/User");

function toggleNumberInArray(arr, value) {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

async function toggleFavorite(req, res, next) {
  try {
    const tmdbId = Number(req.params.contentId);
    const user = await User.findById(req.user.id);
    user.favorites = toggleNumberInArray(user.favorites, tmdbId);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    next(err);
  }
}

async function getFavorites(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("favorites");
    res.json({ favorites: user.favorites || [] });
  } catch (err) {
    next(err);
  }
}

async function toggleWatchLater(req, res, next) {
  try {
    const tmdbId = Number(req.params.contentId);
    const user = await User.findById(req.user.id);
    user.watchLater = toggleNumberInArray(user.watchLater, tmdbId);
    await user.save();
    res.json({ watchLater: user.watchLater });
  } catch (err) {
    next(err);
  }
}

async function getWatchLater(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("watchLater");
    res.json({ watchLater: user.watchLater || [] });
  } catch (err) {
    next(err);
  }
}

async function rateContent(req, res, next) {
  try {
    const tmdbId = Number(req.params.contentId);
    const rating = Number(req.body.rating);
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    const user = await User.findById(req.user.id);
    const current = user.ratings.find((item) => item.tmdbId === tmdbId);
    if (current) current.value = rating;
    else user.ratings.push({ tmdbId, value: rating });
    await user.save();
    return res.json({ ratings: user.ratings });
  } catch (err) {
    return next(err);
  }
}

async function getSubscription(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("subscription");
    res.json({ subscription: user.subscription });
  } catch (err) {
    next(err);
  }
}

async function getRatings(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("ratings");
    res.json({ ratings: user.ratings || [] });
  } catch (err) {
    next(err);
  }
}

async function subscribe(req, res, next) {
  try {
    const { plan } = req.body;
    if (!["free", "premium"].includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }
    const user = await User.findById(req.user.id);
    user.subscription = { plan, isActive: true, startedAt: new Date() };
    await user.save();
    return res.json({ subscription: user.subscription });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  toggleFavorite,
  getFavorites,
  toggleWatchLater,
  getWatchLater,
  rateContent,
  getRatings,
  getSubscription,
  subscribe
};
