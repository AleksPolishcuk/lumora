const env = require("../config/env");

async function tmdbFetch(path, query = {}) {
  if (!env.tmdbApiKey) {
    throw Object.assign(new Error("TMDB API key is missing"), { status: 500 });
  }
  const params = new URLSearchParams({ api_key: env.tmdbApiKey, ...query });
  const url = `${env.tmdbBaseUrl}${path}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw Object.assign(new Error("TMDB request failed"), { status: response.status });
  }
  return response.json();
}

function mapType(type) {
  if (type === "movie" || type === "cartoon") return "movie";
  if (type === "series") return "tv";
  return "multi";
}

function cleanQuery(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

async function discoverContent(filters = {}) {
  const type = mapType(filters.type);
  const page = Math.min(Math.max(Number(filters.page || 1), 1), 500);

  if (filters.search) {
    const searchPath = type === "tv" ? "/search/tv" : type === "movie" ? "/search/movie" : "/search/multi";
    return tmdbFetch(searchPath, cleanQuery({ query: filters.search, page }));
  }

  const path = type === "tv" ? "/discover/tv" : "/discover/movie";
  const query = {
    page,
    sort_by: filters.sortBy || "popularity.desc",
    with_genres: filters.genre,
    "vote_average.gte": filters.ratingFrom,
    "vote_average.lte": filters.ratingTo,
    primary_release_year: filters.year,
    "primary_release_date.gte": filters.yearFrom ? `${filters.yearFrom}-01-01` : undefined,
    "primary_release_date.lte": filters.yearTo ? `${filters.yearTo}-12-31` : undefined,
    with_original_language: filters.language,
    with_origin_country: filters.country
  };

  if (filters.type === "cartoon") {
    query.with_genres = query.with_genres ? `${query.with_genres},16` : "16";
  }

  return tmdbFetch(path, cleanQuery(query));
}

module.exports = { tmdbFetch, discoverContent, mapType };
