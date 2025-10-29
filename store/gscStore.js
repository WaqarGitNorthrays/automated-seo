// /store/gscStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from "react-toastify";

export const useGSCStore = create(
  persist(
    (set, get) => ({
      websiteUrl: '',
      isConnected: false,
      isLoading: false,
      metrics: null,
      performanceMetrics: null,
      issues: [],
      toast: null,

      // --- Toast Notification ---

        showToast: (message, type = "info") => {
          if (type === "success") toast.success(message);
          else if (type === "error") toast.error(message);
          else toast(message);
        },
      // --- Normalize Issue Data (shared helper) ---
      normalizeIssues: (rawIssues) => {
        if (!rawIssues) return [];

        if (Array.isArray(rawIssues) && (rawIssues[0]?.Issue || rawIssues[0]?.issue)) {
          return rawIssues.map((item) => ({
            Issue: item.Issue || item.issue,
            Solution: item.Solution || item.solution,
            severity:
              item.severity ||
              (item.Issue?.toLowerCase().includes('poor') ||
              item.issue?.toLowerCase().includes('poor')
                ? 'high'
                : 'medium'),
          }));
        }

        if (Array.isArray(rawIssues) && rawIssues.length > 0 && !rawIssues[0].Issue) {
          const data = rawIssues[0];
          return Object.entries(data).map(([key, value]) => ({
            Issue: `${key}: ${value}`,
            severity:
              value.toLowerCase().includes('poor') ||
              value.toLowerCase().includes('unspecified')
                ? 'high'
                : value.toLowerCase().includes('needs improvement')
                ? 'medium'
                : 'low',
          }));
        }

        return [];
      },

      // --- Connect Website ---
      // Fetch website performance data
      fetchWebsitePerformance: async (websiteUrl) => {
        try {
          const response = await axiosInstance.get(`complete-website-performance/?url=${encodeURIComponent(websiteUrl)}`);
          if (response.data?.success) {
            set({ performanceMetrics: response.data.summary });
          }
          return response.data?.summary || null;
        } catch (error) {
          console.error('Error fetching website performance:', error);
          return null;
        }
      },

      connectWebsite: async (credentials) => {
        const { websiteUrl, apiKey, credentials: credsFile } = credentials || {};

        // ✅ Check all three fields
        if (!websiteUrl || !apiKey || !credsFile) {
          get().showToast('Please fill all required fields', 'error');
          console.log('Missing fields:', { websiteUrl, apiKey, credsFile });
          return;
        }

        set({ isLoading: true });

        try {
          const formData = new FormData();
          formData.append('url', websiteUrl);
          formData.append('api_key', apiKey);
          formData.append('credentials', credsFile);

          const [queryRes, vitalsRes, issuesRes] = await Promise.all([
            axiosInstance.post('gsc-queries/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
            axiosInstance.post('core-web-vitals/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
            axiosInstance.post('website-issues/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
          ]);

          const normalizedIssues = get().normalizeIssues(issuesRes.data?.website_issues);

          await get().fetchWebsitePerformance(websiteUrl);

          set({
            metrics: {
              queries: queryRes.data?.metrics || [],
              coreWebVitals: vitalsRes.data?.core_web_vitals?.[0] || {},
              indexed: vitalsRes.data?.indexed_pages?.length || 0,
              notIndexed: vitalsRes.data?.not_indexed_pages?.length || 0,
            },
            issues: normalizedIssues,
            isConnected: true,
            websiteUrl,
          });

          get().showToast('Successfully connected and data loaded', 'success');
        } catch (err) {
          console.error('Connection Error:', err);
          const message =
            err?.response?.data?.error ||
            err?.response?.data?.detail ||
            err?.message ||
            'Failed to connect or load data';
          get().showToast(message, 'error');
        } finally {
          set({ isLoading: false });
        }
      },


      // --- Resolve Issues (same as before) ---
      resolveSingleIssue: async (issueText) => {
        const { websiteUrl, issues } = get();
        if (!websiteUrl) {
          get().showToast('Please connect a website first', 'error');
          return false;
        }

        set((state) => ({
          issues: state.issues.map((issue) =>
            issue.Issue === issueText ? { ...issue, isResolving: true } : issue
          ),
        }));

        try {
          const res = await axiosInstance.post('resolve-single-website-issue/', {
            website_url: websiteUrl,
            issue: issueText,
          });

          if (res.data.success) {
            const solution = res.data.issues_and_solutions?.[0]?.Solution;
            if (solution) {
              set((state) => ({
                issues: state.issues.map((issue) =>
                  issue.Issue === issueText
                    ? { ...issue, Solution: solution, isResolving: false }
                    : issue
                ),
              }));
            } else {
              set((state) => ({
                issues: state.issues.filter((issue) => issue.Issue !== issueText),
              }));
            }
            get().showToast('Issue resolved successfully', 'success');
            return true;
          } else {
            set((state) => ({
              issues: state.issues.map((issue) =>
                issue.Issue === issueText ? { ...issue, isResolving: false } : issue
              ),
            }));
            get().showToast(res.data.message || 'Failed to resolve issue', 'error');
            return false;
          }
        } catch (err) {
          console.error('Error resolving issue:', err);
          set((state) => ({
            issues: state.issues.map((issue) =>
              issue.Issue === issueText ? { ...issue, isResolving: false } : issue
            ),
          }));
          get().showToast('Error while resolving issue', 'error');
          return false;
        }
      },

      resolveIssues: async () => {
        const websiteUrl = get().websiteUrl;
        if (!websiteUrl) {
          get().showToast('Please connect a website first', 'error');
          return;
        }

        set({
          isLoading: true,
          issues: get().issues.map((issue) => ({ ...issue, isResolving: false })),
        });

        try {
          const res = await axiosInstance.get(
            `resolve-website-issues/?url=${encodeURIComponent(websiteUrl)}`
          );

          if (res.data.success) {
            const normalizedIssues = get().normalizeIssues(res.data.issues_and_solutions);
            set({ issues: normalizedIssues });
            get().showToast('Issues resolved successfully', 'success');
          } else {
            get().showToast(res.data.message || 'Failed to resolve issues', 'error');
          }
        } catch (err) {
          console.error('Error resolving issues:', err);
          get().showToast('Error while resolving issues', 'error');
        } finally {
          set({ isLoading: false });
        }
      },

      // --- Disconnect Website ---
      disconnect: () => {
        set({
          websiteUrl: '',
          isConnected: false,
          metrics: null,
          performanceMetrics: null,
          issues: [],
          isLoading: false,
        });
      },
    }),
    {
      name: 'gsc-storage', // 👈 key for localStorage
      partialize: (state) => ({
        websiteUrl: state.websiteUrl,
        isConnected: state.isConnected,
        metrics: state.metrics,
        issues: state.issues,
      }),
    }
  )
);
