/** @type {import('next').NextConfig} */
const securityHeaders=[
 {key:"X-Content-Type-Options",value:"nosniff"},
 {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
 {key:"X-Frame-Options",value:"DENY"},
 {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(), payment=()"},
 {key:"Strict-Transport-Security",value:"max-age=31536000; includeSubDomains"},
 {key:"Content-Security-Policy",value:[
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // Next.js generates inline hydration scripts; CSP nonces require a separate full rollout.
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "upgrade-insecure-requests"
 ].join("; ")}
];

const nextConfig={
 reactStrictMode:true,
 poweredByHeader:false,
 productionBrowserSourceMaps:false,
 compress:true,
 async headers(){
  if(process.env.NODE_ENV!=="production")return [];
  return [
   {source:"/:path*",headers:securityHeaders},
   {source:"/admin/:path*",headers:[{key:"Cache-Control",value:"no-store, max-age=0"}]},
   {source:"/api/admin/:path*",headers:[{key:"Cache-Control",value:"no-store, max-age=0"}]}
  ];
 }
};
export default nextConfig;
