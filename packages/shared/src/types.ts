export type ContentType = "movie" | "series" | "cartoon";

export interface ContentItem {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
}

export interface UserState {
  favorite: boolean;
  watchLater: boolean;
  rating: number | null;
}
