# Coffee Chasers Frontend

Expo + TypeScript mobile app scaffold for a cafe review platform.

## Stack

- Expo (React Native)
- TypeScript
- React Navigation (bottom tabs)
- Mapbox SDK (`@rnmapbox/maps`)

## Implemented Structure

- `App.tsx`: root app shell and navigation container.
- `src/navigation/RootNavigator.tsx`: `Map` and `Settings` tabs.
- `src/screens/MapScreen.tsx`: loads cafes from API and renders markers on Mapbox.
- `src/screens/SettingsScreen.tsx`: shows environment configuration and wired routes.
- `src/api/client.ts`: shared API client and error handling.
- `src/api/cafes.ts`: cafes API module.
- `src/api/users.ts`: users API module.
- `src/api/reviews.ts`: reviews API module.
- `src/types/api.ts`: API contracts and payload types.
- `src/config/env.ts`: environment helpers.

## Environment

Create `.env` from `.env.example` and set values:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token
```

Notes:

- Routes are currently unauthenticated.
- API client points to your provided resource groups: `/cafes`, `/users`, `/reviews`.

## Run

```bash
npm install
npm run start
```

## API Coverage

Supported in current scaffold:

- Cafes: `GET /cafes/`, `GET /cafes/{id}`, `POST /cafes/`, `PUT /cafes/{id}`, `DELETE /cafes/{id}`
- Users: `GET /users/`, `GET /users/{id}`, `POST /users/`, `PUT /users/{id}`, `DELETE /users/{id}`
- Reviews: `POST /reviews/`, `GET /reviews/{id}`, `PUT /reviews/{id}`, `DELETE /reviews/{id}`, `GET /reviews/customer/{user_id}`

## Next Suggested Build Step

Add a dedicated cafe details screen and review creation flow that calls `POST /reviews/`.
