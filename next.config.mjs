/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent browsers from guessing MIME types
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only allow framing from the same origin
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Disable legacy XSS auditor (CSP is the modern replacement)
          { key: "X-XSS-Protection", value: "0" },
          // Control referrer information sent to other origins
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser feature access
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Enable DNS prefetching for performance
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Force HTTPS for 2 years (only effective on HTTPS connections)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
