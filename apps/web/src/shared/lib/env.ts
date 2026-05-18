export const env = {
  PUBLIC_API_BASE_URL: import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1",
  PUBLIC_USE_MOCKS: import.meta.env.PUBLIC_USE_MOCKS === "true",
  PUBLIC_SITE_URL: import.meta.env.PUBLIC_SITE_URL || "https://yampislabs.github.io/referendum2030",
};
