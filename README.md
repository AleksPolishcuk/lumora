# Lumora Monorepo MVP

Netflix-style streaming MVP with:
- `apps/frontend`: Next.js + CSS Modules (mobile-first)
- `apps/backend`: Express + MongoDB + TMDB integration
- `packages/shared`: shared TypeScript types

## Run locally

1. Install dependencies:
   - `npm install`
2. Configure backend env:
   - copy `apps/backend/.env.example` to `apps/backend/.env`
   - set `TMDB_API_KEY`, `MONGODB_URI`, JWT secrets
3. Start both apps:
   - `npm run dev`

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5001`

## Production build

1. Set `NODE_ENV=production` for the backend and point `CLIENT_URL` at your deployed frontend origin.
2. Copy `apps/frontend/.env.example` to `apps/frontend/.env.local` and set `NEXT_PUBLIC_API_URL` to your public API base (for example `https://api.example.com/api`).
3. Install and build the frontend: `npm install` then `npm run build -w apps/frontend`.
4. Run the backend (for example behind a process manager): `npm run start -w apps/backend`.
5. Serve the Next.js app (for example `npm run start -w apps/frontend` after build, or your platform’s static/SSR adapter).

## Implemented features

- Auth: register/login/logout/refresh/me
- Catalog: featured, discover, search, detail, related
- Filters: title, year, genre, country, language, rating, sort, pagination
- User private data: favorites, watch later, ratings 1-5
- Subscription status: `free | premium`
- Frontend pages: home, movies, series, cartoons, favorites, search, detail, watch, auth
- Mobile-first layout, burger menu, CSS variable tokens, icon sprite
- Loading/empty/error states for browse/search/favorites + retry links
