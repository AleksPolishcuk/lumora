const { discoverContent, tmdbFetch } = require("../services/tmdb.service");
const User = require("../models/User");
const TMDB_PAGE_SIZE = 20;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizePerPage(raw) {
  const n = Number(raw || TMDB_PAGE_SIZE);
  return clamp(Number.isFinite(n) ? Math.round(n) : TMDB_PAGE_SIZE, 1, 50);
}

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
    page: Number(query.page || 1),
    perPage: normalizePerPage(query.perPage)
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

async function fetchPagedTmdb({ page, perPage, fetchPage }) {
  const safePage = clamp(Number(page || 1), 1, 500);
  const safePerPage = normalizePerPage(perPage);

  if (safePerPage === TMDB_PAGE_SIZE) {
    const direct = await fetchPage(safePage);
    return {
      page: safePage,
      total_pages: direct.total_pages || 1,
      total_results: direct.total_results || 0,
      results: direct.results || []
    };
  }

  const startIndex = (safePage - 1) * safePerPage;
  const tmdbPage = clamp(Math.floor(startIndex / TMDB_PAGE_SIZE) + 1, 1, 500);
  const offset = startIndex % TMDB_PAGE_SIZE;

  const first = await fetchPage(tmdbPage);
  const firstResults = first.results || [];
  const needFromSecond = offset + safePerPage > firstResults.length;
  const canFetchSecond = tmdbPage < 500;
  const second = needFromSecond && canFetchSecond ? await fetchPage(tmdbPage + 1) : null;
  const secondResults = second?.results || [];
  const merged = [...firstResults, ...secondResults];
  const sliced = merged.slice(offset, offset + safePerPage);

  return {
    page: safePage,
    total_pages: Math.max(1, Math.ceil((first.total_results || 0) / safePerPage)),
    total_results: first.total_results || 0,
    results: sliced
  };
}

async function listContent(req, res, next) {
  try {
    const filters = normalizeFilters(req.query);
    const data = await fetchPagedTmdb({
      page: filters.page,
      perPage: filters.perPage,
      fetchPage: (tmdbPage) => discoverContent({ ...filters, page: tmdbPage })
    });
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
    const perPage = normalizePerPage(req.query.perPage);
    const data = await fetchPagedTmdb({
      page,
      perPage,
      fetchPage: (tmdbPage) => tmdbFetch("/search/multi", { query: q, page: tmdbPage })
    });
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
