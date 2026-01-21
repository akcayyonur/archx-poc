export const environment = {
  production: true,
  apiUrl: "/api",  // Use relative URL since nginx handles the proxy
  trendUrl: "/trend"  // Use nginx proxy to avoid CORS issues
}; 