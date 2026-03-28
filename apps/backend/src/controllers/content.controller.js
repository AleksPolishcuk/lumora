const { discoverContent, tmdbFetch } = require("../services/tmdb.service");
const User = require("../models/User");

function normalizeFilters(query) {
  return {
    type: query.type,
    search: query.search,
    genre: query.genre,
    ratingFrom: query.ratingFrom,
    ratingTo: query.ratingTo,
    year: query.year,
    yearFrom: query.yearFrom,
    yearTo: query.yearTo,
    language: query.language,
    country: query.country,
    sortBy: query.sortBy,
    page: Number(query.page || 1)
  };
}

function withPagination(data, page) {
  return {
    page,
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0,
    items: data.results || []
  };
}

async function listContent(req, res, next) {
  try {
    const filters = normalizeFilters(req.query);
    const data = await discoverContent(filters);
    return res.json(withPagination(data, filters.page));
  } catch (err) {
    return next(err);
  }
}

async function featured(req, res, next) {
  try {
    const data = await tmdbFetch("/trending/all/week");
    return res.json({ items: data.results || [] });
  } catch (err) {
    return next(err);
  }
}

async function search(req, res, next) {
  try {
    const q = req.query.q || "";
    const page = Number(req.query.page || 1);
    const data = await tmdbFetch("/search/multi", { query: q, page });
    return res.json(withPagination(data, page));
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = req.params.id;
    const type = req.query.type === "tv" ? "tv" : "movie";
    const data = await tmdbFetch(`/${type}/${id}`, { append_to_response: "credits,images,videos,recommendations" });
    let userState = null;
    if (req.user) {
      const user = await User.findById(req.user.id);
      userState = {
        favorite: user.favorites.includes(Number(id)),
        watchLater: user.watchLater.includes(Number(id)),
        rating: user.ratings.find((x) => x.tmdbId === Number(id))?.value || null
      };
    }
    return res.json({ item: data, userState });
  } catch (err) {
    return next(err);
  }
}

async function related(req, res, next) {
  try {
    const id = req.params.id;
    const type = req.query.type === "tv" ? "tv" : "movie";
    const data = await tmdbFetch(`/${type}/${id}/recommendations`);
    return res.json({ items: data.results || [] });
  } catch (err) {
    return next(err);
  }
}

async function filtersMeta(req, res, next) {
  try {
    const movieGenres = await tmdbFetch("/genre/movie/list");
    const tvGenres = await tmdbFetch("/genre/tv/list");
    const countries = await tmdbFetch("/configuration/countries");
    return res.json({
      genres: [...(movieGenres.genres || []), ...(tvGenres.genres || [])],
      countries: countries || [],
      sortOptions: [
        "popularity.desc",
        "vote_average.desc",
        "primary_release_date.desc",
        "primary_release_date.asc"
      ]
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listContent, featured, search, getById, related, filtersMeta };
