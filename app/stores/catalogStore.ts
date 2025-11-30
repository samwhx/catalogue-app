import { defineStore } from "pinia";
import type { Catalog, CatalogMetadata } from "~/types/catalogue";
import { catalogApi } from "~/utils/apiClient";

interface CatalogState {
  // Current catalog data
  currentCatalog: Catalog | null;
  currentCatalogIdentifier: string | null;

  // Catalog list (metadata)
  catalogList: CatalogMetadata[];

  // Loading states
  isLoadingCatalog: boolean;
  isLoadingList: boolean;

  // Error states
  catalogError: Error | null;
  listError: Error | null;

  // Cache metadata
  cacheTimestamp: number | null;
  isStale: boolean;
}

export const useCatalogStore = defineStore("catalog", {
  state: (): CatalogState => ({
    currentCatalog: null,
    currentCatalogIdentifier: null,
    catalogList: [],
    isLoadingCatalog: false,
    isLoadingList: false,
    catalogError: null,
    listError: null,
    cacheTimestamp: null,
    isStale: false,
  }),

  getters: {
    hasCurrentCatalog: (state) => state.currentCatalog !== null,

    hasCatalogList: (state) => state.catalogList.length > 0,

    isCatalogLoading: (state) => state.isLoadingCatalog,

    isListLoading: (state) => state.isLoadingList,

    getCatalogError: (state) => state.catalogError,

    getListError: (state) => state.listError,

    // Check if cached data is stale (> 1 hour)
    isCacheStale: (state) => {
      if (!state.cacheTimestamp) return false;
      const cacheAge = Date.now() - state.cacheTimestamp;
      return cacheAge > 60 * 60 * 1000; // 1 hour
    },
  },

  actions: {
    /**
     * Fetch a single catalog by identifier
     * Handles caching, offline support, and error states
     */
    async fetchCatalog(identifier: string, forceRefresh = false) {
      // Don't fetch if we already have this catalog and not forcing refresh
      if (
        !forceRefresh &&
        this.currentCatalogIdentifier === identifier &&
        this.currentCatalog &&
        !this.isCacheStale
      ) {
        return this.currentCatalog;
      }

      this.isLoadingCatalog = true;
      this.catalogError = null;
      this.currentCatalogIdentifier = identifier;


      try {
        // Check localStorage cache first (if not forcing refresh)
        if (!forceRefresh) {
          const cached = this.getCachedCatalog(identifier);
          if (cached) {
            this.currentCatalog = cached;
            this.cacheTimestamp = Date.now();
            this.isStale = this.isCacheStale;
            // Still fetch in background to update cache
            this.fetchCatalogFromAPI(identifier).catch(() => {
              // Silent fail - we have cached data
            });
            this.isLoadingCatalog = false;
            return cached;
          }
        }

        // Fetch from API
        const catalog = await this.fetchCatalogFromAPI(identifier);
        this.currentCatalog = catalog;
        this.cacheTimestamp = Date.now();
        this.isStale = false;
        this.saveCatalogToCache(identifier, catalog);

        return catalog;
      } catch (error) {
        console.error(`[CatalogStore] Error:`, error);
        this.catalogError = error as Error;

        // Try to use cache as fallback
        const cached = this.getCachedCatalog(identifier);
        if (cached) {
          this.currentCatalog = cached;
          this.isStale = true;
        }

        throw error;
      } finally {
        this.isLoadingCatalog = false;
      }
    },

    /**
     * Internal: Fetch catalog from API
     * Uses standardized API client for consistent error handling
     */
    async fetchCatalogFromAPI(identifier: string): Promise<Catalog> {
      return catalogApi.getCatalog(identifier);
    },

    /**
     * Fetch list of catalogs (metadata only)
     */
    async fetchCatalogList(forceRefresh = false) {
      if (!forceRefresh && this.hasCatalogList && !this.isCacheStale) {
        return this.catalogList;
      }

      this.isLoadingList = true;
      this.listError = null;

      try {
        const list = await catalogApi.getCatalogList();

        this.catalogList = list;
        return list;
      } catch (error) {
        this.listError = error as Error;
        throw error;
      } finally {
        this.isLoadingList = false;
      }
    },

    /**
     * Clear current catalog (useful for cleanup)
     */
    clearCurrentCatalog() {
      this.currentCatalog = null;
      this.currentCatalogIdentifier = null;
      this.catalogError = null;
    },

    /**
     * Cache management helpers
     */
    saveCatalogToCache(identifier: string, catalog: Catalog) {
      if (import.meta.client) {
        const cacheData = {
          data: catalog,
          timestamp: Date.now(),
          identifier,
        };
        localStorage.setItem("catalogue_cache", JSON.stringify(cacheData));
      }
    },

    getCachedCatalog(identifier: string): Catalog | null {
      if (!import.meta.client) return null;

      const cached = localStorage.getItem("catalogue_cache");
      if (!cached) return null;

      try {
        const { data, timestamp, identifier: cachedId } = JSON.parse(cached);

        // Check if cache is valid
        if (cachedId !== identifier) return null;

        const cacheAge = Date.now() - timestamp;
        if (cacheAge > 60 * 60 * 1000) return null; // 1 hour TTL

        return data;
      } catch {
        return null;
      }
    },

    /**
     * Clear cache
     */
    clearCache() {
      if (import.meta.client) {
        localStorage.removeItem("catalogue_cache");
      }
      this.cacheTimestamp = null;
    },
  },
});
