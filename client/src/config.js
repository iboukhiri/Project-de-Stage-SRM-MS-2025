const config = {
  // If using local development (localhost), use localhost:5002
  // Otherwise when tunneling, use the specific backend tunnel URL
  API_URL: process.env.REACT_APP_API_URL || 
           (window.location.hostname === 'localhost' 
              ? 'http://localhost:5002' 
              : 'https://ending-obesity-runtime-accommodations.trycloudflare.com')
};

export default config; 