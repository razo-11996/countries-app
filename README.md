# Countries App

Angular 21 app using the public Countries GraphQL API (Apollo Angular + GraphQL Codegen).

### Features

- Countries list with search + continent filter
- Country detail page with map (Leaflet / OSM tiles) + current weather (Open‑Meteo)
- Light/dark mode

### Setup

```bash
npm install
npm run codegen
npm start
```

Open `http://localhost:4200/`.

### Useful scripts

- `npm run codegen`: generate `src/app/graphql/generated.ts` from `src/app/graphql/operations/**/*.graphql`
- `npm run codegen:watch`: watch mode for codegen
- `npm test`: unit tests
- `npm run build`: production build (outputs to `dist/`)

### Config

- Environment values live in `src/environments/environment*.ts`.
- `env.example` is documentation-only (do not put secrets in the frontend bundle).
