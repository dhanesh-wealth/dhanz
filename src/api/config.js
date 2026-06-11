/**
 * API base URL.
 * - Production: same-origin "/api" when Express serves dist + API together
 * - Local dev: Vite proxies "/api" to localhost:3001
 * - Split deploy: set VITE_API_URL to your API server URL
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
