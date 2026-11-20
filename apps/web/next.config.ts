import type { NextConfig } from "next";
const config:NextConfig={output:"standalone",transpilePackages:["@polyglot/ui","@polyglot/content-engine","@polyglot/shared-utils","@polyglot/shared-types","@polyglot/learning-engine"],poweredByHeader:false,async headers(){return [{source:"/:path*",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"Permissions-Policy",value:"camera=(), microphone=(self), geolocation=()"},{key:"X-Frame-Options",value:"DENY"}]}]}};
export default config;
