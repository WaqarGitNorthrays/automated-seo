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
  storeInfo: getLocal("storeInfo", { name: "", isConnected: false }),
  isLoading: false,
  isAnalyzing: false,
  isResolving: false,
  toast: null,

  // ====== TOAST ======
  showToast: (message, type = "info") => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 4000);
  },

  // ====== FETCH PRODUCTS ======
  fetchProducts: async (storeName, accessToken, email, afterAnalysis = false) => {
    try {
      set({ isLoading: true });
      const response = await axiosInstance.post("fetch-products/", {
        storeName,
        accessToken,
        email,
      });
      const productsData = response.data.products || [];
      set({ products: productsData });
      localStorage.setItem("cachedProducts", JSON.stringify(productsData));

      if (afterAnalysis)
        get().showToast("Products updated after analysis.", "success");
    } catch (error) {
      console.error("fetchProducts error:", error);
      get().showToast("Failed to fetch products. Please try again.", "error");
    } finally {
      set({ isLoading: false });
    }
  },

  // ====== CONNECT STORE ======
  connectStore: async ({ storeName, accessToken, email }) => {
    try {
      set({ isLoading: true });

      const response = await axiosInstance.post("fetch-products/", {
        storeName,
        accessToken,
        email,  // Include email in the API call
      });

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if(email) localStorage.setItem("email", email);

      const productsData = response.data.products || [];
      const info = { 
        name: storeName, 
        email,  // Store email in the store info
        isConnected: true 
      };

      set({
        products: productsData,
        storeInfo: info,
      });

      localStorage.setItem("cachedProducts", JSON.stringify(productsData));
      localStorage.setItem("storeInfo", JSON.stringify(info));

      get().showToast(
        response.data.message || "Store connected successfully",
        "success"
      );
    } catch (error) {
      console.error("connectStore error:", error);
      get().showToast("Failed to connect to store.", "error");
    } finally {
      set({ isLoading: false });
    }
  },

  // ====== ANALYZE PRODUCTS ======
  analyzeProducts: async (productIds) => {
    const { storeInfo, fetchProducts, showToast } = get();
    const accessToken = localStorage.getItem("accessToken");

    if (!storeInfo.name || !accessToken) {
      showToast("Access token missing. Please reconnect your store.", "error");
      return;
    }

    const isSingle = Array.isArray(productIds) ? productIds.length === 1 : true;
    const productIdList = Array.isArray(productIds) ? productIds : [productIds];

    // set({ isAnalyzing: true });
    try {
      const response = await axiosInstance.post("analyze-single-multiple-products/", {
        product_ids: productIdList,
        storeName: storeInfo.name,
        accessToken,
      });

      await fetchProducts(storeInfo.name, accessToken, true);
      
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
      // set({ isAnalyzing: false });
    }
  },

  // ====== ANALYZE ALL ======
  analyzeAll: async () => {
    const { storeInfo, analyzeProducts, showToast } = get();
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
      await fetchProducts(storeInfo.name, accessToken, true);
    } catch (error) {
      console.error("analyzeAll error:", error);
      showToast("Failed to analyze products.", "error");
    } finally {
      set({ isAnalyzing: false });
    }
  },

  // ====== RESOLVE ALL ======
  resolveAll: async () => {
    const { storeInfo, fetchProducts, showToast } = get();
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

  if (!storeInfo.name || !accessToken) {
    showToast("Missing store credentials. Please reconnect your store.", "error");
    return null;
  }

  try {
    const response = await axiosInstance.post("write-blogs-and-articles/", {
      product_id: productId,
      storeName: storeInfo.name,
      accessToken,
    });

    showToast("SEO insights generated successfully!", "success");
    return response.data;
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
    const { products, storeInfo, fetchProducts, showToast } = get();
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


      await fetchProducts(storeInfo.name, accessToken, email);
      
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
    const storeInfo = getLocal("storeInfo", null);
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");

    if (storeInfo?.name && accessToken) {
      if (!auto) set({ isLoading: true });
      try {
        await get().fetchProducts(
          storeInfo.name,
          accessToken,
          email,
          false
        );
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


