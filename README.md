# Layer Up

Layer Up is a weather-aware outfit planner and wardrobe assistant built with React, TypeScript, Vite, and shadcn/ui. It helps users build a digital closet, save favorite locations, and get outfit suggestions that respond to real weather, season, and personal style preferences.

## Overview

The app is designed around one core idea: your outfit should match the weather, your wardrobe, and your vibe. Users create an account, complete a quick onboarding flow, add items to their closet, and then receive recommendations from a lightweight algorithm that weighs:

- current and forecasted temperature
- rain, wind, and UV conditions
- seasonality
- personal temperature sensitivity
- saved aesthetics and style preferences
- article wear history and recent outfit choices

This project is intentionally frontend-first and local-first. It stores user data in browser storage rather than a separate backend, making it easy to prototype, demo, and iterate quickly.

## Key Features

### 1. Authentication and onboarding
- Create an account with email + password
- Log in and stay signed in through browser session storage
- Complete onboarding to set:
  - saved locations (up to 3)
  - temperature sensitivity
  - style preferences / aesthetics
  - personal notes about comfort

### 2. Weather-aware dashboard
- Search and save locations with Open-Meteo geocoding
- Fetch live current conditions and upcoming weather trends
- Switch between saved locations quickly
- Override temperature manually if needed for planning

### 3. Wardrobe management
- Add clothing items with metadata such as:
  - category (top, bottom, dress, outerwear, shoes, accessories)
  - season tags
  - warmth rating
  - color and material notes
  - occasion tags
  - aesthetic tags
- Upload and store item photos locally via IndexedDB
- Review wardrobe items and manage wear history

### 4. Smart outfit recommendations
The recommendation engine scores wardrobe pieces based on:

- fit with the current season
- warmth proximity to target conditions
- weather hazards like rain, wind, or snow
- personal aesthetic alignment
- whether an item has been recently worn

This produces a curated list of recommended tops, bottoms, outerwear, shoes, and accessories for the day.

### 5. OOTD logging and saved looks
- Save generated looks to a personal outfit library
- Log an Outfit of the Day (OOTD) with a photo and notes
- Capture comfort rating and whether the outfit would be worn again
- Browse saved outfit history by date and weather context

### 6. Settings and export
- Manage saved locations and user preferences
- Export saved wardrobe and outfit data for backup or migration

## Tech Stack

- React 19
- Vite
- TypeScript
- React Router
- Tailwind CSS
- shadcn/ui component system
- Open-Meteo APIs for geocoding and weather data
- IndexedDB via idb-keyval for image storage
- localStorage for profile and app data

## Architecture Overview

The project is organized around a small set of focused modules:

- src/App.tsx: route structure and protected app shell
- src/contexts/AuthContext.tsx: authentication and profile state
- src/db/storage.ts: browser persistence utilities
- src/lib/weather.ts: geocoding and Open-Meteo weather fetching
- src/lib/recommendations.ts: outfit ranking logic
- src/components/app/: UI pages for auth, dashboard, wardrobe, weather, OOTD, and settings
- src/types/index.ts: shared TypeScript models

## Application Flow

1. User signs up or logs in.
2. The onboarding flow collects location, comfort preferences, and favorite aesthetics.
3. The wardrobe page lets the user add and manage items.
4. The dashboard loads the active location and weather.
5. The recommendation engine combines weather context with wardrobe metadata.
6. The user can save looks and track what they actually wore in the OOTD log.

## Data Model

Core entities include:

- UserProfile: email, onboarding state, saved locations, aesthetics, and sensitivity settings
- WardrobeItem: item type, season tags, warmth rating, photo reference, and wear history
- SavedOutfit: saved recommendation result with weather and aesthetic metadata
- OOTDLog: personal outfit diary entry with image, comfort, notes, and weather snapshot

## Local Storage Model

This project intentionally avoids a backend server. Instead, it persists different kinds of data in browser storage:

- user accounts and sessions: localStorage
- profile preferences and wardrobe/outfit records: localStorage
- item images: IndexedDB
- weather fetch caching: localStorage

This makes the app ideal for demos and iterative design work, but it also means data is device/browser-local rather than synced across users.

## Project Structure

```text
layer-up/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── app/
│   │   └── ui/
│   ├── contexts/
│   ├── db/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── main.tsx
├── public/
├── docs/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── components.json
├── eslint.config.js
├── README.md
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, typically:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev       # start the Vite dev server
npm run build     # generate the production bundle
npm run preview   # preview the built app locally
npm run lint      # run ESLint
npm run typecheck # run TypeScript without emitting files
npm run format    # format TypeScript/TSX files with Prettier
```

## Notable Implementation Details

### Weather integration
The app uses Open-Meteo endpoints for both geocoding and weather forecasting. Weather responses are cached in localStorage for 30 minutes to reduce repeat network requests.

### Recommendation logic
The recommendation engine translates temperature into a target warmth level and then adjusts it based on user sensitivity (`hot`, `average`, or `cold`). It also boosts matches for:

- current season
- wardrobe item warmth rating
- saved aesthetic tags
- rainy/snowy weather handling
- items not worn recently

### Media handling
Wardrobe images and OOTD photos are stored in IndexedDB using generated IDs, which keeps image data outside localStorage and reduces storage-size issues.


## Future Improvements

Potential enhancements for this project include:

- real authentication backend with database persistence
- user profile syncing across devices
- richer recommendation model with outfit scoring explanations
- drag-and-drop wardrobe organization
- calendar-based outfit history and trend analytics
- export/import improvements and backup restore flow