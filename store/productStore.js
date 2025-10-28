"use client";

import { create } from "zustand";
import axiosInstance from "@/lib/axiosInstance";

// ✅ Helper: safely parse JSON from localStorage
const getLocal = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const useProductStore = create((set, get) => ({
  // ====== STATE ======
  products: getLocal("cachedProducts", []),
  reportsPagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {
    optimized: null,
    active: null,
    analyzed: null,
    score_min: null,
    score_max: null
  },
  storeInfo: getLocal("storeInfo", { name: "", isConnected: false }),
  accessToken: getLocal("accessToken", ""),
  email: getLocal("email", ""),
  isLoading: false,
  isAnalyzing: false,      // For bulk analyze
  isResolving: false,     // For bulk resolve
  isProcessingSingle: {   // For single product operations
    analyzing: new Set(),
    resolving: new Set()
  },
  toast: null,

  // ====== TOAST ======
  showToast: (message, type = "info") => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 4000);
  },

  // ====== FETCH PRODUCTS ======
  // ====== UPDATE FILTERS ======
  updateFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  // ====== RESET FILTERS ======
  resetFilters: () => {
    set({
      filters: {
        optimized: null,
        active: null,
        analyzed: null,
        score_min: null,
        score_max: null
      }
    });
  },



// ====== CONNECT STORE ======
connectStore: async ({ storeName, accessToken, email }) => {
  try {
    set({ isLoading: true });

    // ✅ Prepare connection info
    const info = {
      name: storeName,
      email,
      isConnected: true,
    };

    // ✅ Save store data in Zustand + localStorage
    set({
      storeInfo: info,
      accessToken,
      email,
    });

    localStorage.setItem("storeInfo", JSON.stringify(info));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("email", email);

    // ✅ Initial product fetch (no filters)
    const response = await axiosInstance.post("fetch-products/", {
      storeName,
      accessToken,
      email,
    });

    const productsData = response.data.products || [];
    const paginationData = {
      currentPage: response.data.page || 1,
      totalPages: response.data.total_pages || 1,
    };

    // ✅ Update Zustand state
    set({
      products: productsData,
      reportsPagination: paginationData,
    });

    localStorage.setItem(
      "cachedProducts",
      JSON.stringify({
        products: productsData,
        ...paginationData,
      })
    );

    get().showToast("Store connected successfully", "success");
  } catch (error) {
    console.error("connectStore error:", error);
    get().showToast("Failed to connect to store.", "error");
  } finally {
    set({ isLoading: false });
  }
},


// ====== FETCH PRODUCTS ======
fetchProductsForReports: async (page = 1, afterAnalysis = false, filters = {}) => {
  try {
    let { storeInfo, accessToken, email } = get();

    // ✅ Attempt auto-restore if credentials missing
    if (!storeInfo?.name || !accessToken || !email) {
      const savedInfo = JSON.parse(localStorage.getItem("storeInfo") || "{}");
      const savedAccessToken = localStorage.getItem("accessToken");
      const savedEmail = localStorage.getItem("email");

      if (savedInfo?.name && savedAccessToken && savedEmail) {
        set({
          storeInfo: savedInfo,
          accessToken: savedAccessToken,
          email: savedEmail,
        });
        storeInfo = savedInfo;
        accessToken = savedAccessToken;
        email = savedEmail;
        console.log("🔄 Restored store credentials from localStorage");
      } else {
        console.warn("⚠️ Missing store credentials — skipping fetch");
        return;
      }
    }

    set({ isLoading: true });

    const pageNumber = page && !isNaN(page) ? Number(page) : 1;

    // ✅ Resolve storeName correctly
    const storeName =
      typeof storeInfo?.name === "object"
        ? storeInfo?.name?.storeName
        : storeInfo?.name;

    // ✅ Build clean payload (only include active filters)
    const payload = {
      storeName,
      accessToken,
      email,
      page: pageNumber,
      ...(filters?.active !== undefined && { active: filters.active }),
      ...(filters?.optimized !== undefined && { optimized: filters.optimized }),
      ...(filters?.analyzed !== undefined && { analyzed: filters.analyzed }),
      ...(filters?.score_min !== undefined && { score_min: filters.score_min }),
      ...(filters?.score_max !== undefined && { score_max: filters.score_max }),
    };

    const response = await axiosInstance.post("fetch-products/", payload);

    const productsData = response.data.products || [];
    const paginationData = {
      currentPage: response.data.page || 1,
      totalPages: response.data.total_pages || 1,
    };

    set({
      products: productsData,
      reportsPagination: paginationData,
    });

    localStorage.setItem(
      "cachedProducts",
      JSON.stringify({
        products: productsData,
        ...paginationData,
      })
    );

    // if (afterAnalysis) {
    //   get().showToast("Products updated after analysis.", "success");
    // }
  } catch (error) {
    console.error("fetchProducts error:", error);
    get().showToast("Failed to fetch products. Please try again.", "error");
  } finally {
    set({ isLoading: false });
  }
},


  // ====== ANALYZE PRODUCTS ======
  analyzeProducts: async (productIds) => {
    const { storeInfo, showToast } = get();
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email") || '';

    if (!storeInfo?.name || !accessToken) {
      showToast("Access token missing. Please reconnect your store.", "error");
      return;
    }

    const isSingle = Array.isArray(productIds) ? productIds.length === 1 : true;
    const productIdList = Array.isArray(productIds) ? productIds : [productIds];

    set({ isAnalyzing: true });
    try {
      const response = await axiosInstance.post("analyze-single-multiple-products/", {
        product_ids: productIdList,
        storeName: storeInfo.name,
        accessToken,
      });

      // Refresh the products list after analysis 
      await get().fetchProductsForReports(1, true);

      showToast(
        response.data.message || 
        (isSingle 
          ? `Analyzed 1 product` 
          : `Analyzed ${productIdList.length} products`), 
        "success"
      );
      
      return response.data;
    } catch (error) {
      console.error("analyzeProducts error:", error);
      const errorMessage = error.response?.data?.error || "Failed to analyze products.";
      showToast(errorMessage, "error");
      throw error;
    } finally {
      if (isSingle) {
        const updatedAnalyzing = new Set(isProcessingSingle.analyzing);
        productIdList.forEach(id => updatedAnalyzing.delete(id));
        set({ isProcessingSingle: { ...isProcessingSingle, analyzing: updatedAnalyzing } });
      } else {
        set({ isAnalyzing: false });
      }
    }
  },

  // ====== ANALYZE ALL ======
  analyzeAll: async () => {
    const { storeInfo, showToast } = get();
    const accessToken = localStorage.getItem("accessToken");

    if (!storeInfo.name || !accessToken) {
      showToast("Access token missing. Please reconnect your store.", "error");
      return;
    }

    set({ isAnalyzing: true });
    try {
      const response = await axiosInstance.post("analyze-products/", {
        storeName: storeInfo.name,
        accessToken,
      });
      showToast(response.data.message || "Product analysis started.", "success");
      // Refresh the products list after analysis
      await get().fetchProductsForReports(1, true, {});
    } catch (error) {
      console.error("analyzeAll error:", error);
      showToast("Failed to analyze products.", "error");
    } finally {
      set({ isAnalyzing: false });
    }
  },

  // ====== RESOLVE ALL ======
  resolveAll: async () => {
    const { storeInfo, showToast } = get();
    const accessToken = localStorage.getItem("accessToken");

    if (!storeInfo.name || !accessToken) {
      showToast("Missing store credentials.", "error");
      return;
    }
          
    set({ isResolving: true });
    try {
      const response = await axiosInstance.post("resolve-product-issues/", {
        storeName: storeInfo.name,
        accessToken,
      });
      showToast(response.data.message || "Resolved all product issues.", "success");
      await fetchProducts(storeInfo.name, accessToken);
    } catch (error) {
      console.error("resolveAll error:", error);
      showToast("Failed to resolve issues.", "error");
    } finally {
      set({ isResolving: false });
    }
  },

// ====== ANALYZE SEO OPPORTUNITIES ======
analyzeSEOOpportunities: async (productId) => {
  const { storeInfo, showToast } = get();
  const accessToken = localStorage.getItem("accessToken");
  
  // Create a unique key for this request
  const requestKey = `seo_analysis_${productId}`;
  
  // Check if there's an ongoing request for this product
  if (window[requestKey]) {
    return window[requestKey];
  }

  if (!storeInfo.name || !accessToken) {
    showToast("Missing store credentials. Please reconnect your store.", "error");
    return null;
  }

  try {
    // Store the promise to prevent duplicate requests
    window[requestKey] = axiosInstance.post("write-blogs-and-articles/", {
      product_id: productId,
      // storeName: storeInfo.name,
      // accessToken,
    }).then(response => {
      showToast("SEO insights generated successfully!", "success");
      return response.data;
    }).finally(() => {
      // Clean up the stored promise when done
      delete window[requestKey];
    });

    return await window[requestKey];
  } catch (error) {
    console.error("analyzeSEOOpportunities error:", error);
    const message =
      error.response?.data?.error ||
      "Failed to analyze SEO opportunities. Please try again.";
    showToast(message, "error");
    throw error;
  }
},


  // ====== RESOLVE PRODUCTS ======
  resolveProducts: async (productIds) => {
    const { products, storeInfo, fetchProductsForReports, showToast } = get();
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");

    if (!productIds || productIds.length === 0 || !storeInfo.name || !accessToken) {
      showToast("Missing products or credentials.", "error");
      return;
    }

    // Get product names for confirmation message
    const productNames = products
      .filter(p => productIds.includes(p.id))
      .map(p => `"${p["Product Name"]}"`);

    const isSingle = productIds.length === 1;
    // const confirmMessage = isSingle 
    //   ? `Resolve issues for ${productNames[0]}?`
    //   : `Resolve issues for ${productIds.length} selected products?\n\n${productNames.join('\n')}`;

    // if (!window.confirm(confirmMessage)) {
    //   return;
    // }

    set({ isResolving: true });
    try {
      const response = await axiosInstance.post("resolve-single-product-issues/", {
        product_ids: Array.isArray(productIds) ? productIds : [productIds],
        storeName: storeInfo.name,
        accessToken,
      });

      // Refresh the products list after resolving
      await get().fetchProductsForReports(storeInfo.name, accessToken, 1, email, true);
      
      showToast(
        response.data.message || 
        (isSingle 
          ? `Resolved ${productNames[0]}` 
          : `Resolved ${productIds.length} products`), 
        "success"
      );
      
      return response.data;
    } catch (error) {
      console.error("resolveProducts error:", error);
      const errorMessage = error.response?.data?.error || "Failed to resolve product issues.";
      showToast(errorMessage, "error");
      
      // Reset loading states on error
      if (isSingle) {
        const updatedResolving = new Set(isProcessingSingle.resolving);
        productIdList.forEach(id => updatedResolving.delete(id));
        set({ isProcessingSingle: { ...isProcessingSingle, resolving: updatedResolving } });
      } else {
        set({ isResolving: false });
      }
      
      throw error;
    } finally {
      set({ isResolving: false });
    }
  },

  // ====== HANDLE PRODUCT SUGGESTION ======
  handleProductSuggestion: async (productName, action) => {
    try {
      set({ isLoading: true });
      const response = await axiosInstance.post("approve-reject-product-suggestions/", {
        action,
        product_name: productName
      });
      
      get().showToast(response.data.message || `Product ${action}ed successfully`, "success");
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error(`Error ${action}ing product:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${action} product`;
      get().showToast(errorMessage, "error");
      return { success: false, message: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  // ====== DISCONNECT ======
  disconnect: () => {
    localStorage.removeItem("cachedProducts");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("storeInfo");
    localStorage.removeItem("email");
    set({
      products: [],
      storeInfo: { name: "", isConnected: false },
    });
    get().showToast("Disconnected and cleared cache.", "info");
  },

  // ====== AUTO RECONNECT ======
reconnect: async (auto = false) => {
  const storedInfo = localStorage.getItem("storeInfo");
  const accessToken = localStorage.getItem("accessToken");
  const email = localStorage.getItem("email");

  let storeInfo = null;
  try {
    storeInfo = storedInfo ? JSON.parse(storedInfo) : null;
  } catch {
    console.warn("⚠️ Invalid storeInfo in localStorage, clearing it.");
    localStorage.removeItem("storeInfo");
  }

  if (storeInfo?.name && accessToken) {
    if (!auto) set({ isLoading: true });

    // ✅ Rehydrate state before fetching
    set({
      storeInfo,
      accessToken,
      email,
    });

    try {
      await get().fetchProductsForReports(1, false, {});
      if (!auto) {
        get().showToast("Store reconnected successfully", "success");
      }
    } catch (error) {
      console.error("Reconnect error:", error);
      if (!auto) {
        get().showToast("Failed to reconnect to store", "error");
      }
    } finally {
      if (!auto) set({ isLoading: false });
    }
  }
},
}));

// Auto-reconnect on app load (if session stored)
if (typeof window !== "undefined") {
  const storeInfo = localStorage.getItem("storeInfo");
  const accessToken = localStorage.getItem("accessToken");
  if (storeInfo && accessToken) {
    // silently reconnect in background
    useProductStore.getState().reconnect(true);
  }
}


