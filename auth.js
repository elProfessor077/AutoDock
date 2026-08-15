import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "dummy",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "dummy",
    }),
    Credentials({
      name: "Developer Bypass",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === "developer" && credentials?.password === "AutoDock") {
          return { id: "dev-user", name: "Dev Guest", email: "developer@AutoDock.local" };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = request.nextUrl.pathname.startsWith("/signin");
      const isApi = request.nextUrl.pathname.startsWith("/api/");

      // Allow access to auth routes & API routes always
      if (isAuthPage || isApi) return true;

      // Block everything else if not logged in
      return isLoggedIn;
    },
  },
});
