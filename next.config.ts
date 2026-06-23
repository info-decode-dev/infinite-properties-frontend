import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  sassOptions: {
    includePaths: [path.join(process.cwd(), "styles")],
    silenceDeprecations: ["legacy-js-api"],
    quietDeps: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
