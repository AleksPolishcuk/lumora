# Frontend

## Commands
- `npm run dev`
- `npm run build`
- `npm run start`

## Notes
- Uses CSS Modules + global token variables in `src/styles/tokens.css`
- Mobile-first responsive behavior (320/375, 768, 1440)
- Uses backend API from `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5001/api`)
- Includes loading skeletons and empty/error/retry states in key pages
- Browse filters are URL-driven: title, year, genre, country, language, rating, sort
