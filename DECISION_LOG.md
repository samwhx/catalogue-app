# 🧠 Engineering Decision Log & Architecture Summary

## 📌 Overview

This document outlines the thought process, architectural decisions, and implementation journey for the **Atlas Gastro Bar Catalogue Frontend**. It is intended to demonstrate the engineering approach taken to build a resilient, production-ready application.

---

## 1. 🏗️ Architectural Decisions

### Why Nuxt.js 4 & Vue 3?

- **Decision**: Adopted Nuxt 4 (latest stable) with Vue 3 Composition API.
- **Reasoning**:
  - **Structure**: Nuxt provides strong conventions (file-based routing, auto-imports) which speeds up development and ensures consistency.
  - **Performance**: Built-in optimizations for code-splitting and asset handling.
  - **Deployment**: Configured `nitro.preset: 'cloudflare-pages'` for optimized edge deployment.

### Why Pinia(Store) for State Management?

- **Decision**: Centralized state in specific stores (`cart`, `catalog`, `location`, `auth`).
- **Alternative Considered**: `useState` composable or Prop Drilling.
- **Reasoning**:
  - **Complexity**: The cart state is needed globally (Header, Drawer, Product Modal).
  - **Persistence**: Pinia makes it easy to hydrate state from LocalStorage (essential for the offline-first approach).

### Why Tailwind CSS?

- **Decision**: Utility-first CSS framework.
- **Reasoning**:
  - **Speed**: Rapid prototyping without context-switching between HTML and CSS files.
  - **Consistency**: Enforces a design system through configuration colors/spacing (e.g., `bg-brand-beige`).
  - **Performance**: PostCSS purges unused styles, resulting in a tiny production bundle size.
  - **Responsiveness**: Built-in breakpoints (`md:`, `lg:`) make mobile-first design trivial.

### Client-Side vs. Server-Side Rendering (SSR)

- **Decision**: Hybrid approach. Static shell via SSR, but heavy interactive components (Cart, Modals) are `<ClientOnly>`.
- **Reasoning**:
  - **Advantages**: Search Engine Optimization. (Assuming this product needs marketing/high ranking in search results.)
  - **Hydration Mismatches**: Elements relying on `window` size (mobile detection) or `localStorage` (cart persistence) often cause hydration errors if rendered on the server.
  - **UX**: Rendering the critical LCP (Largest Contentful Paint) content like the Skeleton Loader immediately via SSR, then hydrating interactivity.

---

## 2. 🛡️ Resilience & "What If It Breaks?" Strategy

A key focus was considering various potential failure points.

### 🔴 Scenario: The API is Down or Slow

- **Solution**: Implemented a robust **Caching Layer** in `catalogStore`.
- **Mechanism**:
  1.  Check `localStorage` for cached data first.
  2.  If found, render immediately (stale-while-revalidate).
  3.  Fetch fresh data in the background.
  4.  If fetch fails, keep showing cached data and display a non-intrusive "Offline" indicator.
  5.  If no cache exists, show a dedicated **Skeleton Loader** (not just a spinner) to reduce perceived wait time.

### 🔴 Scenario: Product Images are Broken (404)

- **Solution**: Defensive Image Component.
- **Mechanism**:
  - Used a standard `<img>` tag but listened for the `@error` event.
  - On error, a reactive state toggles visibility, revealing a pre-rendered **SVG Placeholder** positioned absolutely behind the image.
  - **Result**: No "broken image" icons; the UI maintains visual consistency.

### 🔴 Scenario: User is Offline

- **Solution**: "Offline-First" mindset.
- **Mechanism**:
  - The entire catalog is cached upon first load.
  - The app remains functional (browsing, adding to cart) even without a network connection, utilizing the local store.

---

## 3. 🧩 Component Architecture

### Atomic Design Principles

- **Atoms**: `TheHeader`, `SectionItem` (Simple, functional)
- **Molecules**: `CatalogItem` (Card with image, price, options), `CartDrawer` (Complex state interaction)
- **Organisms**: `CatalogDisplay` (Manages layout, scroll-spy, and data injection)

### 📱 Mobile-First & Responsive Design

- **Touch-Friendly UI**: All interactive elements (buttons, inputs) meet the **44px** minimum touch target size (WCAG requirement).
- **Adaptive Layouts**:
  - **Sidebar Navigation**: Transforms from a vertical sticky sidebar (Desktop) to a horizontal scrollable strip (Mobile) to save vertical screen space.
  - **Cart Drawer**: Full-screen width on mobile (max-width: 100%) vs. slide-over on desktop (max-width: 450px).
- **Sticky Elements**: The header remains accessible, ensuring navigation and cart access are always one tap away.

### Key Components

- **`SkeletonLoader.vue`**: Critical for Perceived Performance. Instead of a generic spinner, it mimics the layout of the menu (Sidebar + Grid), minimizing Cumulative Layout Shift (CLS).
- **`CartDrawer.vue`**: Uses `Teleport` to render outside the main DOM tree, ensuring it overlays correctly regardless of z-index contexts.
- **`DateTimeModal.vue`**: Implements business logic to prevent selecting past times, filtering slots based on the "Now" timestamp + buffer time.

---

## 4. 📦 Feature Deep Dive

### 📍 Location & Fulfillment

- **Context**: Users need to switch between Delivery and Pickup, which changes the context of their order.
- **Implementation**:
  - **Toggle Logic**: Simple tab switch updates `locationStore`.
  - **Distance Calculation**: When "Delivery" is selected, we simulate a search (OneMap style) and calculate the distance from the store using the **Haversine Formula**.
  - **Validation**: Delivery requires a valid address; Pickup locks the location to the store address.

### 📅 Date & Time Selection

- **Context**: Ordering food requires precise timing.
- **Implementation**:
  - **Dynamic Slots**: Generates the next 7 days dynamically, using 10:00 AM to 9:00 PM operating hours.
  - **Smart Filtering**: If "Today" is selected, past time slots are filtered out (with a 30-minute buffer for prep time).
  - **Sticky Time UX**: Auto-selects the first available slot to reduce clicks. When switching dates, the app attempts to keep the selected time. If invalid (e.g., past time), it auto-selects the first available slot.

### 🛒 Cart & Order Management

- **Context**: The core e-commerce experience.
- **Implementation**:
  - **Slide-Over Drawer**: Persistent access to cart without leaving the menu.
  - **State Management**: `cartStore` handles adding (with options), updating quantities, and removing items.
  - **Unique IDs**: Cart items are identified by a composite ID (`itemId` + `options` + `instructions`) to allow the same burger with different toppings to exist separately.
  - **Editing**: Clicking "Edit" re-opens the product modal with the saved state populated.

### 🍔 Menu & Product Customization

- **Context**: Displaying a rich hierarchy of data.
- **Implementation**:
  - **Scroll Spy**: Sidebar navigation highlights the active section based on viewport position.
  - **Product Modal**: Handles:
    - **Required Options**: "Add to Cart" is disabled until requirements are met.
    - **Price Calculation**: Base price + Option prices update in real-time.
    - **Special Instructions**: Text area for user notes.

### 🔐 Authentication (Mock)

- **Context**: User identification for orders.
- **Implementation**:
  - **Modal**: Tabbed interface for Login/Signup.
  - **Social Login**: Mock buttons for Google/Facebook/Apple.
  - **Mobile vs. Email**: Toggle for login method.
  - **State**: `authStore` tracks `isAuthenticated` and user profile.

---

## 5. ⚡ Optimization Strategies

### ✅ Implemented Optimizations

1.  **Skeleton Loading**: Replaced generic spinners with skeleton screens that match the actual layout.
    - **Benefit**: Reduces Perceived Latency and Cumulative Layout Shift (CLS).
2.  **LocalStorage Caching**: Implemented a "Stale-While-Revalidate" strategy using `localStorage`.
    - **Benefit**: Instant load for returning users; offline capability.
3.  **Component Hydration**: Used `<ClientOnly>` for heavy interactive components (Cart, Modals).
    - **Benefit**: Reduces Time to Interactive (TTI) for the main content shell; prevents hydration mismatches.
4.  **Image Placeholders**: SVG placeholders are rendered immediately while images load.
    - **Benefit**: Prevents layout shifts and provides visual continuity.
5.  **Tailwind Purging**: Standard Tailwind usage ensures unused CSS is stripped during build.
    - **Benefit**: Minimal CSS bundle size.

### 🚀 Future Optimizations

1.  **PWA (Progressive Web App)**: Implement Service Workers for advanced offline caching (assets + API).
2.  **Server-Side Caching (Redis)**: Move caching to the Nuxt server layer (`useAsyncData` + Redis) for shared caching across users.
3.  **Image Optimization**: Use Nuxt Image (`@nuxt/image`) for automatic resizing, format conversion (WebP/AVIF), and lazy loading.
4.  **Image CDN (CloudFront/Cloudinary)**: Serve product images via a CDN to ensure low-latency delivery and edge caching, preventing the "pop-in" effect even further.
5.  **Virtualization**: If the menu grows to hundreds of items, implement virtualization for the product list to reduce DOM node count when scrolling.

---

## 6. 💡 Reflections & Trade-offs

- **Trade-off**: I chose **Client-Side Fetching** in `onMounted` to implement an **additional caching layer** using `localStorage`. While the server/API already caches data, this client-side layer ensures **offline capability** and **zero-latency** navigation for returning users.
- **Evolution**: I started with raw Tailwind classes for velocity, but refactored common UI elements into **Base Components** (`BaseButton`, `BaseModal`) to enforce consistency and prepare for scaling by making common components modular.
- **GraphQL vs. Structured REST**: The reference site used many small GraphQL queries, which can lead to "waterfall" fetching issues. I chose a **single, well-structured REST response** (Catalog > Sections > Items > Options) that is cached entirely. This approach reduces network round-trips and simplifies offline logic, trading some initial payload size for simpler data management and instant subsequent navigation.
- **Velocity vs. Testing**: I prioritized **feature completeness and UI/UX polish** over automated testing for this MVP. In a production environment, adding Unit Tests (Vitest) for business logic and E2E Tests (Playwright) for critical flows would be a mandatory pre-requisite for deployment.

---

## 7. 🔮 Future Roadmap

To evolve this MVP into a full-scale e-commerce platform, the following features could be added:

### 👤 User & Account Management

- **Real Authentication**: Replace mock auth with a secure backend authentication if required.
- **User Profile**: Allow users to manage saved addresses and payment methods.
- **Bookmarks/Favorites**: "Save for later" functionality for menu items.

### 📦 Order Lifecycle

- **Cart Persistence**: Sync cart state with the backend database so it persists across devices.
- **Order History**: View past orders and re-order with one click.
- **Real-time Order Tracking**: WebSocket integration to show order status (Preparing -> Ready -> On the way).

### 💳 Checkout & Support

- **Payment Integration**: Stripe or local payment gateway integration for secure checkout. (Should be implemented in backend)
- **Reviews & Ratings**: Allow verified purchasers to rate items. (Needs further thought because of potential bad reviews.)
- **Customer Support**: Intercom or custom chat widget for real-time assistance/Or email-based support.

### 🧪 Quality Assurance & Accessibility

- **Automated Testing**: Implemented **Vitest** setup with critical unit tests for `cartStore` business logic.
- **Future Work**: Expand unit test coverage to all stores and add Playwright for E2E critical flows (checkout).
- **Accessibility Audit**: Ensure WCAG 2.1 AA compliance (color contrast for color blindness, focus management in modals, and screen reader announcements).

---

## 8. 🏁 Conclusion

This project wasn't just about "making it work only"; it was about "**reliability**, **scalability** and **future-prooofing**". By prioritizing error handling, caching, and user feedback (loaders/placeholders), it is ready for real-world usage, although some of the additional optimizations should be implemented if time permits.
