// /store/gscStore.js
import { create } from 'zustand';
import axiosInstance from '@/lib/axiosInstance';

export const useGSCStore = create((set, get) => ({
  websiteUrl: '',
  isConnected: false,
  isLoading: false,
  metrics: null,
  issues: [],
  toast: null,

  // --- Toast Notification ---
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 4000);
  },

  // --- Normalize Issue Data (shared helper) ---
  normalizeIssues: (rawIssues) => {
    if (!rawIssues) return [];

    // Case 1: Already resolved data (has Issue + Solution)
    if (Array.isArray(rawIssues) && (rawIssues[0]?.Issue || rawIssues[0]?.issue)) {
      return rawIssues.map(item => ({
        Issue: item.Issue || item.issue,
        Solution: item.Solution || item.solution,
        severity: item.severity || 
          (item.Issue?.toLowerCase().includes('poor') || item.issue?.toLowerCase().includes('poor') ? 'high' : 'medium')
      }));
    }

    // Case 2: website_issues [{ inp: "...", pagespeedscore: "...", ... }]
    if (Array.isArray(rawIssues) && rawIssues.length > 0 && !rawIssues[0].Issue) {
      const data = rawIssues[0]; // backend sends one object inside array
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
  connectWebsite: async (websiteUrl) => {
    if (!websiteUrl) {
      get().showToast('Please enter a valid Website URL', 'error');
      return;
    }

    set({ isLoading: true });

    try {
      const [queryRes, vitalsRes, issuesRes] = await Promise.all([
        axiosInstance.get(`gsc-queries/?url=${encodeURIComponent(websiteUrl)}`),
        axiosInstance.get(`core-web-vitals/?url=${encodeURIComponent(websiteUrl)}`),
        axiosInstance.get(`website-issues/?url=${encodeURIComponent(websiteUrl)}`)
      ]);

      // Normalize the issues data
      const normalizedIssues = get().normalizeIssues(issuesRes.data?.website_issues);

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
      get().showToast('Failed to connect or load data', 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  // --- Resolve Issues ---
  // Resolve a single issue
  resolveSingleIssue: async (issueText) => {
    const { websiteUrl, issues } = get();
    if (!websiteUrl) {
      get().showToast('Please connect a website first', 'error');
      return false;
    }

    // Set loading state for this specific issue
    set(state => ({
      issues: state.issues.map(issue => 
        issue.Issue === issueText 
          ? { ...issue, isResolving: true }
          : issue
      )
    }));

    try {
      const res = await axiosInstance.post('resolve-single-website-issue/', {
        website_url: websiteUrl,
        issue: issueText
      });

      if (res.data.success) {
        // Update the issue with its solution
        const solution = res.data.issues_and_solutions?.[0]?.Solution;
        
        // If we have a solution, update the issue, otherwise remove it
        if (solution) {
          set(state => ({
            issues: state.issues.map(issue => 
              issue.Issue === issueText
                ? { ...issue, Solution: solution, isResolving: false }
                : issue
            )
          }));
        } else {
          // If no solution, remove the issue
          set(state => ({
            issues: state.issues.filter(issue => issue.Issue !== issueText)
          }));
        }
        
        get().showToast('Issue resolved successfully', 'success');
        return true;
      } else {
        // Reset loading state on error
        set(state => ({
          issues: state.issues.map(issue => 
            issue.Issue === issueText   
              ? { ...issue, isResolving: false }
              : issue
          )
        }));
        get().showToast(`${res.data.message || 'Failed to resolve issue'}`, 'error');
        return false;
      }
    } catch (err) {
      console.error('Error resolving issue:', err);
      // Reset loading state on error
      set(state => ({
        issues: state.issues.map(issue => 
          issue.Issue === issueText 
            ? { ...issue, isResolving: false }
            : issue
        )
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
      // Clear any individual resolving states
      issues: get().issues.map(issue => ({
        ...issue,
        isResolving: false
      }))
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
        get().showToast(`${res.data.message || 'Failed to resolve issues'}`, 'error');
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
      issues: [],
      toast: null,
    });
  },
}));
