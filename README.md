# Atlas Gastro Bar - Catalogue Frontend

A production-ready frontend application for displaying a restaurant catalogue, managing a cart, and handling order settings (location, date/time). Built with **Nuxt.js 4**, **Vue 3**, **TypeScript**, **Pinia**, and **Tailwind CSS**.

🔗 **Live Demo:** [https://catalogue-app.pages.dev/](https://catalogue-app.pages.dev/)

It may take a few retries as the backend server needs to be warmed up. After that, caching will kick in.

## 🚀 Features

- **Catalogue Display**: Renders a hierarchical menu (Sections → Items → Options).
- **Interactive Cart**: Slide-over cart with add/edit/remove functionality.
- **Product Customization**: Modal for selecting options and adding special instructions.
- **Location & Fulfillment**: Delivery vs. Pickup toggle with real-time distance calculation (using Haversine formula).
- **Date & Time Selection**: Smart scheduling that filters out past times and ensures valid delivery slots.
- **Authentication UI**: Mock login/signup modal with social login buttons.
- **Resilient Architecture**:
  - **Skeleton Loading**: Prevents layout shift and provides immediate visual feedback.
  - **Offline Support**: Caches catalog data to LocalStorage for offline access.
  - **Error Handling**: Graceful degradation for API failures or network issues.
  - **Defensive Programming**: Handles missing images, broken links, and partial data without crashing.

## 🛠 Tech Stack

- **Framework**: Nuxt.js 4.2.1
- **UI Library**: Vue 3.5.25
- **State Management**: Pinia 3.0.4
- **Styling**: Tailwind CSS 3.4.0 (via `@nuxtjs/tailwindcss`)
- **Language**: TypeScript
- **API Integration**: Custom `apiClient` with `fetch`
- **Icons**: SVG Icons (No external icon font dependency)

## 📂 Project Structure

```
app/
├── components/          # UI Components
│   ├── base/            # Reusable Atoms
│   │   ├── BaseButton.vue
│   │   └── BaseModal.vue
│   ├── AuthModal.vue    # Login/Signup
│   ├── CartDrawer.vue   # Slide-over cart
│   ├── CatalogDisplay.vue # Main layout
│   ├── DateTimeModal.vue # Date/Time picker
│   ├── ProductModal.vue # Item customization
│   ├── SkeletonLoader.vue # Loading state
│   └── ...
├── pages/
│   └── index.vue        # Main entry point
├── stores/              # Pinia Stores
│   ├── authStore.ts     # Authentication state
│   ├── cartStore.ts     # Cart management
│   ├── catalogStore.ts  # Data fetching & caching
│   └── locationStore.ts # Location & fulfillment logic
├── types/               # TypeScript Interfaces
└── utils/               # Helper functions
    └── apiClient.ts     # Standardized API client
nuxt.config.ts           # Configuration (srcDir: 'app/')
tailwind.config.js       # Tailwind configuration
```

## 🏗 Architectural Decisions

For a deep dive into the engineering choices, trade-offs, and resilience strategies, please read the **[Engineering Decision Log & Architecture Summary](./DECISION_LOG.md)**.

For persistant system context (AI use and new developer references), see:

- **[System Patterns](./docs/project-context/systemPatterns.md)**: Core philosophies and code patterns.
- **[Tech Context](./docs/project-context/techContext.md)**: Inventory of frameworks and libraries used.

### 1. **Pinia for State Management**

We chose Pinia over `useState` or props drilling because the app handles complex global state:

- **Cart State**: Needs to be accessible from the header, product modals, and the drawer itself.
- **Catalog Data**: Shared across components; caching logic is centralized here.
- **Location/Context**: Fulfillment settings affect the entire user journey.

### 2. **Client-Side Rendering (CSR) for Interactive Elements**

While Nuxt supports SSR, we used `<ClientOnly>` for heavy interactive components like the **CartDrawer** and **Modals**.

- **Reason**: Prevents Hydration Mismatches (HTML on server != HTML on client due to local storage or window size).
- **Benefit**: Smoother initial load for the static shell, with interactive bits popping in safely.

### 3. **Smart Caching Strategy**

- **Logic**: `catalogStore` checks LocalStorage before hitting the API.
- **TTL**: Cache expires after 1 hour (`isCacheStale` check).
- **Offline First**: If the network fails, it serves stale data from the cache instead of an error screen.

### 4. **Defensive UI Design**

- **Images**: If a product image fails to load (`@error`), we immediately swap it for a branded SVG placeholder.
- **Skeleton Loader**: Instead of a spinner, we show a skeleton layout that matches the final content structure, reducing perceived latency.
- **Empty States**: specific UI for empty cart, empty sections, or missing catalog data.

## 🧪 "What If It Breaks?" Scenarios

| Scenario          | Handling                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| **API Down**      | App serves cached data if available. If not, shows a user-friendly error with a "Retry" button. |
| **Slow Network**  | **SkeletonLoader** appears immediately. Interactive elements remain responsive.                 |
| **Broken Images** | `v-show` hides the broken `<img>` tag, revealing a pre-rendered SVG placeholder behind it.      |
| **Invalid Time**  | **DateTimeModal** filters out past times based on the user's current device time.               |
| **Empty Catalog** | Displays a "Menu unavailable" state instead of a blank screen.                                  |

## 🔌 API & Data

The application consumes data from a REST API (`https://catalogue-service.fly.dev`).

- **`GET /catalogs`**: Fetches a list of available catalogs.
- **`GET /catalogs/:identifier`**: Fetches a specific catalog with full hierarchy (Sections → Items → Options).

The app is configured to load the `atlas-kitchen-2024` catalog by default.

## 🚀 Setup & Run

### Prerequisites

- **Node.js 20.19.0+** (Required for Nuxt 4)

### Installation

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`

## 🔮 Future Improvements

1.  **Real Authentication**: Replace mock `authStore` with Firebase or Supabase.
2.  **Checkout Integration**: Connect the "Checkout" button to a payment gateway (Stripe).
3.  **PWA Support**: Add a manifest and Service Worker for "Add to Home Screen" capability.
4.  **Unit Testing**: Add Vitest for store logic and component testing.

---

**Author**: Samuel Wang
