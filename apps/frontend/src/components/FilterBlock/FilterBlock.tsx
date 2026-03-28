"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import styles from "./FilterBlock.module.css";

interface Genre {
  id: number;
  name: string;
}

interface Country {
  iso_3166_1: string;
  english_name: string;
}

export function FilterBlock() {
  const router = useRouter();
  const params = useSearchParams();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [sortOptions, setSortOptions] = useState<string[]>([]);
  const [form, setForm] = useState({
    search: "",
    year: "",
    genre: "",
    country: "",
    ratingFrom: "",
    sortBy: "popularity.desc",
    language: ""
  });

  useEffect(() => {
    api<{ genres: Genre[]; countries: Country[]; sortOptions: string[] }>("/content/filters/meta")
      .then((data) => {
        const deduped = Array.from(new Map((data.genres || []).map((g) => [g.id, g])).values());
        setGenres(deduped);
        setCountries(data.countries || []);
        setSortOptions(data.sortOptions || []);
      })
      .catch(() => {
        setGenres([]);
        setCountries([]);
        setSortOptions([]);
      });
  }, []);

  useEffect(() => {
    setForm({
      search: params.get("search") || "",
      year: params.get("year") || "",
      genre: params.get("genre") || "",
      country: params.get("country") || "",
      ratingFrom: params.get("ratingFrom") || "",
      sortBy: params.get("sortBy") || "popularity.desc",
      language: params.get("language") || ""
    });
  }, [params]);

  const apply = () => {
    const next = new URLSearchParams(params.toString());
    const updates: Record<string, string> = {
      search: form.search,
      year: form.year,
      genre: form.genre,
      country: form.country,
      ratingFrom: form.ratingFrom,
      sortBy: form.sortBy,
      language: form.language
    };
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete("page");
    router.push(`?${next.toString()}`);
  };

  const reset = () => {
    setForm({
      search: "",
      year: "",
      genre: "",
      country: "",
      ratingFrom: "",
      sortBy: "popularity.desc",
      language: ""
    });
    router.push("?");
  };

  const genreOptions = useMemo(() => genres.sort((a, b) => a.name.localeCompare(b.name)), [genres]);
  const countryOptions = useMemo(
    () => countries.sort((a, b) => a.english_name.localeCompare(b.english_name)),
    [countries]
  );
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - 1979 }, (_, i) => String(current - i));
  }, []);
  const ratingOptions = useMemo(() => ["1", "2", "3", "4", "5", "6", "7", "8", "9"], []);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3>Filters</h3>
      </div>
      <div className={styles.grid}>
        <input
          placeholder="Title"
          value={form.search}
          onChange={(e) => setForm((prev) => ({ ...prev, search: e.target.value }))}
        />
        <select
          value={form.year}
          onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
        >
          <option value="">Year</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          value={form.genre}
          onChange={(e) => setForm((prev) => ({ ...prev, genre: e.target.value }))}
        >
          <option value="">Genre</option>
          {genreOptions.map((genre) => (
            <option key={genre.id} value={String(genre.id)}>
              {genre.name}
            </option>
          ))}
        </select>
        <select
          value={form.country}
          onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
        >
          <option value="">Country</option>
          {countryOptions.map((country) => (
            <option key={country.iso_3166_1} value={country.iso_3166_1}>
              {country.english_name}
            </option>
          ))}
        </select>
        <select
          value={form.ratingFrom}
          onChange={(e) => setForm((prev) => ({ ...prev, ratingFrom: e.target.value }))}
        >
          <option value="">Rating from</option>
          {ratingOptions.map((rating) => (
            <option key={rating} value={rating}>{rating}+</option>
          ))}
        </select>
        <select
          value={form.sortBy}
          onChange={(e) => setForm((prev) => ({ ...prev, sortBy: e.target.value }))}
        >
          {(sortOptions.length ? sortOptions : ["popularity.desc", "vote_average.desc", "primary_release_date.desc"]).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select
          value={form.language}
          onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
        >
          <option value="">Language</option>
          <option value="en">English</option>
          <option value="uk">Ukrainian</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
          <option value="de">German</option>
        </select>
      </div>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={apply}>Apply filters</button>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

/** Required when FilterBlock is rendered from a Server Component (e.g. browse pages): useSearchParams must be under Suspense for `next build` / prerender. */
export function FilterBlockWithSuspense() {
  return (
    <Suspense fallback={<div className={styles.suspenseFallback} aria-hidden />}>
      <FilterBlock />
    </Suspense>
  );
}
