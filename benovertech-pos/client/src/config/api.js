/**
 * API Configuration
 * Dynamically determines API base URL based on environment
 */

const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '' // Use relative URL in production (same origin)
  : 'http://localhost:5000'; // Local development

export default API_BASE_URL;
