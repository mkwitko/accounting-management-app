import { defineConfig } from "orval";
import { config } from "dotenv";

config();

export default defineConfig({
  api: {
    input: `${process.env.EXPO_PUBLIC_BACKEND}/docs/json`, // Your OpenAPI spec URL
    output: {
      baseUrl: process.env.EXPO_PUBLIC_BACKEND, // Your API base URL
      clean: true,
      target: "./src/http/generated/api.ts", // Target for generated API code
      client: "react-query",
      httpClient: "axios", // Use Axios as the HTTP client
      mode: "tags-split", // Use tag splitting mode
      override: {
        mutator: {
          path: "src/lib/api.ts", // Path to your Axios instance
          name: "customInstance", // Ensure this matches the exported name
        },
      },
    },
  },
});
