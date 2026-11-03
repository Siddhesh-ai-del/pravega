import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auth-heavy internal tool: every page reads the session cookie at request
  // time. Cache Components is designed for prefetchable static shells; the
  // supported alternative for fully-dynamic apps is disabling it
  // (docs: "caching-without-cache-components").
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
