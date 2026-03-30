"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import styles from "./FilterBlock.module.css";
import { FilterSelect, type FilterSelectOption } from "./FilterSelect";

interface Genre {
  id: number;
  name: string;
}

interface Country {
  iso_3166_1: string;
  english_name: string;
}

const YEAR_MIN = 1920;
const RATING_MIN = 0;
const RATING_MAX = 10;
const RATING_STEP = 0.5;

const LANGUAGE_FILTER_OPTIONS: FilterSelectOption[] = [
  { value: "", label: "Any language" },
  { value: "en", label: "English" },
  { value: "uk", label: "Ukrainian" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" }
];

function SearchIcon() {
  return (
    <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type FormState = {
  search: string;
  yearFrom: string;
  yearTo: string;
  genre: string;
  country: string;
  ratingFrom: string;
  ratingTo: string;
  language: string;
};

function parseNum(s: string, fallback: number) {
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

function parseRating(s: string, fallback: number) {
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(RATING_MAX, Math.max(RATING_MIN, n));
}

export function FilterBlock() {
  const router = useRouter();
  const params = useSearchParams();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const yearMax = useMemo(() => new Date().getFullYear(), []);

  const [form, setForm] = useState<FormState>({
    search: "",
    yearFrom: "",
    yearTo: "",
    genre: "",
    country: "",
    ratingFrom: "",
    ratingTo: "",
    language: ""
  });

  useEffect(() => {
    api<{ genres: Genre[]; countries: Country[] }>("/content/filters/meta")
      .then((data) => {
        const deduped = Array.from(new Map((data.genres || []).map((g) => [g.id, g])).values());
        setGenres(deduped);
        setCountries(data.countries || []);
      })
      .catch(() => {
        setGenres([]);
        setCountries([]);
      });
  }, []);

  useEffect(() => {
    const legacyYear = params.get("year");
    const yf = params.get("yearFrom");
    const yt = params.get("yearTo");
    const useLegacy = Boolean(legacyYear && !yf && !yt);
    setForm({
      search: params.get("search") || "",
      yearFrom: yf || (useLegacy ? legacyYear : "") || "",
      yearTo: yt || (useLegacy ? legacyYear : "") || "",
      genre: params.get("genre") || "",
      country: params.get("country") || "",
      ratingFrom: params.get("ratingFrom") || "",
      ratingTo: params.get("ratingTo") || "",
      language: params.get("language") || ""
    });
  }, [params]);

  const baseParams = useCallback(() => new URLSearchParams(params.toString()), [params]);

  /** Title search: uses TMDB search path; discover filters are cleared from URL. */
  const applyTitleSearch = () => {
    const next = baseParams();
    ["year", "yearFrom", "yearTo", "genre", "country", "ratingFrom", "ratingTo", "language", "sortBy"].forEach((k) =>
      next.delete(k)
    );
    const q = form.search.trim();
    if (q) next.set("search", q);
    else next.delete("search");
    next.delete("page");
    router.push(`?${next.toString()}`);
  };

  /** Discover filters: clears title search (backend uses one mode at a time). */
  const applyDiscoverFilters = () => {
    const next = baseParams();
    next.delete("search");
    next.delete("year");

    const yLo = Math.min(yearFromNum, yearToNum);
    const yHi = Math.max(yearFromNum, yearToNum);
    if (yLo > YEAR_MIN || yHi < yearMax) {
      next.set("yearFrom", String(yLo));
      next.set("yearTo", String(yHi));
    } else {
      next.delete("yearFrom");
      next.delete("yearTo");
    }

    const rLo = Math.min(ratingFromNum, ratingToNum);
    const rHi = Math.max(ratingFromNum, ratingToNum);
    if (rLo > RATING_MIN || rHi < RATING_MAX) {
      next.set("ratingFrom", String(rLo));
      next.set("ratingTo", String(rHi));
    } else {
      next.delete("ratingFrom");
      next.delete("ratingTo");
    }

    (["genre", "country", "language"] as const).forEach((k) => {
      const v = form[k];
      if (v) next.set(k, v);
      else next.delete(k);
    });
    next.delete("sortBy");

    next.delete("page");
    router.push(`?${next.toString()}`);
  };

  const resetAll = () => {
    setForm({
      search: "",
      yearFrom: "",
      yearTo: "",
      genre: "",
      country: "",
      ratingFrom: "",
      ratingTo: "",
      language: ""
    });
    router.push("?");
  };

  const genreOptions = useMemo(
    () => [...genres].sort((a, b) => a.name.localeCompare(b.name)),
    [genres]
  );
  const countryOptions = useMemo(
    () => [...countries].sort((a, b) => a.english_name.localeCompare(b.english_name)),
    [countries]
  );

  const genreSelectOptions = useMemo<FilterSelectOption[]>(
    () => [
      { value: "", label: "All genres" },
      ...genreOptions.map((g) => ({ value: String(g.id), label: g.name }))
    ],
    [genreOptions]
  );

  const countrySelectOptions = useMemo<FilterSelectOption[]>(
    () => [
      { value: "", label: "All countries" },
      ...countryOptions.map((c) => ({ value: c.iso_3166_1, label: c.english_name }))
    ],
    [countryOptions]
  );

  const yearFromNum = form.yearFrom === "" ? YEAR_MIN : parseNum(form.yearFrom, YEAR_MIN);
  const yearToNum = form.yearTo === "" ? yearMax : parseNum(form.yearTo, yearMax);
  const ratingFromNum = form.ratingFrom === "" ? RATING_MIN : parseRating(form.ratingFrom, RATING_MIN);
  const ratingToNum = form.ratingTo === "" ? RATING_MAX : parseRating(form.ratingTo, RATING_MAX);

  const setYearFrom = (v: number) => {
    const capped = Math.min(v, yearToNum);
    setForm((prev) => ({ ...prev, yearFrom: String(capped) }));
  };
  const setYearTo = (v: number) => {
    const capped = Math.max(v, yearFromNum);
    setForm((prev) => ({ ...prev, yearTo: String(capped) }));
  };

  const setRatingFrom = (v: number) => {
    const rounded = Math.round(v / RATING_STEP) * RATING_STEP;
    const capped = Math.min(rounded, ratingToNum);
    setForm((prev) => ({ ...prev, ratingFrom: String(capped) }));
  };
  const setRatingTo = (v: number) => {
    const rounded = Math.round(v / RATING_STEP) * RATING_STEP;
    const capped = Math.max(rounded, ratingFromNum);
    setForm((prev) => ({ ...prev, ratingTo: String(capped) }));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Search</h2>
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search by title…"
          value={form.search}
          onChange={(e) => setForm((prev) => ({ ...prev, search: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyTitleSearch();
          }}
          aria-label="Search by title"
        />
        <button type="button" className={styles.searchBtn} onClick={applyTitleSearch} aria-label="Search">
          <SearchIcon />
        </button>
      </div>

      <button
        type="button"
        className={styles.allFiltersBtn}
        onClick={() => setAdvancedOpen((v) => !v)}
        aria-expanded={advancedOpen}
        aria-controls="filter-advanced-panel"
      >
        <span>All filters</span>
        <ChevronIcon open={advancedOpen} />
      </button>

      <div
        id="filter-advanced-panel"
        className={`${styles.advancedShell} ${advancedOpen ? styles.advancedOpen : ""}`}
        aria-hidden={!advancedOpen}
      >
        <div className={styles.advancedInner}>
          <div className={styles.columns}>
            <section className={styles.col}>
              <h3 className={styles.colTitle}>Release year</h3>
              <div className={styles.rangeRow}>
                <span className={styles.rangeValue}>{yearFromNum}</span>
                <div className={styles.dualRange}>
                  <input
                    type="range"
                    min={YEAR_MIN}
                    max={yearMax}
                    value={yearFromNum}
                    onChange={(e) => setYearFrom(Number(e.target.value))}
                    className={styles.rangeMin}
                    aria-label="Year from"
                  />
                  <input
                    type="range"
                    min={YEAR_MIN}
                    max={yearMax}
                    value={yearToNum}
                    onChange={(e) => setYearTo(Number(e.target.value))}
                    className={styles.rangeMax}
                    aria-label="Year to"
                  />
                </div>
                <span className={styles.rangeValue}>{yearToNum}</span>
              </div>

              <h3 className={styles.colTitle}>IMDb-style rating</h3>
              <div className={styles.rangeRow}>
                <span className={styles.rangeValue}>{ratingFromNum.toFixed(1)}</span>
                <div className={styles.dualRange}>
                  <input
                    type="range"
                    min={RATING_MIN}
                    max={RATING_MAX}
                    step={RATING_STEP}
                    value={ratingFromNum}
                    onChange={(e) => setRatingFrom(Number(e.target.value))}
                    className={styles.rangeMin}
                    aria-label="Minimum rating"
                  />
                  <input
                    type="range"
                    min={RATING_MIN}
                    max={RATING_MAX}
                    step={RATING_STEP}
                    value={ratingToNum}
                    onChange={(e) => setRatingTo(Number(e.target.value))}
                    className={styles.rangeMax}
                    aria-label="Maximum rating"
                  />
                </div>
                <span className={styles.rangeValue}>{ratingToNum.toFixed(1)}</span>
              </div>
            </section>

            <section className={styles.col}>
              <label className={styles.colTitle} htmlFor="filter-genre">
                Genre
              </label>
              <FilterSelect
                id="filter-genre"
                value={form.genre}
                onChange={(genre) => setForm((prev) => ({ ...prev, genre }))}
                options={genreSelectOptions}
                aria-label="Genre"
              />

              <label className={styles.colTitle} htmlFor="filter-country">
                Country
              </label>
              <FilterSelect
                id="filter-country"
                value={form.country}
                onChange={(country) => setForm((prev) => ({ ...prev, country }))}
                options={countrySelectOptions}
                aria-label="Country"
              />

              <label className={styles.colTitle} htmlFor="filter-lang">
                Language
              </label>
              <FilterSelect
                id="filter-lang"
                value={form.language}
                onChange={(language) => setForm((prev) => ({ ...prev, language }))}
                options={LANGUAGE_FILTER_OPTIONS}
                aria-label="Language"
              />
            </section>
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button type="button" className={styles.btnPrimary} onClick={applyDiscoverFilters}>
            Search
          </button>
          <button type="button" className={styles.btnGhost} onClick={resetAll}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export function FilterBlockWithSuspense() {
  return (
    <Suspense fallback={<div className={styles.suspenseFallback} aria-hidden />}>
      <FilterBlock />
    </Suspense>
  );
}
