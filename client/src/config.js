const config = {
  // If using local development (localhost), use localhost:5003
  // In production, use relative path which will resolve to the same domain
  API_URL: process.env.REACT_APP_API_URL || 
           (window.location.hostname === 'localhost' 
              ? 'http://localhost:5003' 
              : '')  // Empty string means it will use relative URLs (same domain)
};

export default config; 