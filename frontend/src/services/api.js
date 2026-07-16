const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

/**
 * Send a request to the backend API.
 *
 * @param {string} endpoint API endpoint beginning with "/".
 * @param {RequestInit} options Fetch request options.
 * @returns {Promise<any>} Parsed backend response.
 */
export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      message: "The server returned an invalid response.",
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

export { API_BASE_URL };