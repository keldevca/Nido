import { withAuth } from "next-auth/middleware";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default withAuth({
  pages: {
    signIn: `${basePath}/login`,
  },
});

export const config = {
  matcher: ["/courses/:path*", "/taches/:path*"],
};
