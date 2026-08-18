module.exports = {
  ci: {
    collect: {
      // Assuming a standard Vite React build
      staticDistDir: './dist',
      // Start the local dev/preview server if necessary for complex routing or SSR
      // startServerCommand: 'npm run preview',
      
      // Targets the core dashboard routes requiring strict audits
      url: [
        'http://localhost:4000/',               // Landing / Auth
        'http://localhost:4000/dashboard',      // Main App Dashboard
        'http://localhost:4000/invoices'        // Core Data Grid
      ],
      // We run headlessly so it works smoothly in GitHub Actions
      chromePath: false,
      settings: {
        preset: 'desktop', // Adjust depending on target (mobile or desktop)
      }
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Strict blocking thresholds as required by Enterprise Quality Gates
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        // SEO is usually good to track as well, setting an initial baseline
        'categories:seo': ['warn', { minScore: 0.80 }],
        
        // Specific audits that MUST pass (WCAG compliance & Performance markers)
        'color-contrast': 'error',
        'button-name': 'error',
        'image-alt': 'error',
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
      }
    },
    upload: {
      // Use temporary public storage for PRs if you don't have an LHCI server setup
      target: 'temporary-public-storage',
    },
  },
};
