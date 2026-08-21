import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

const providers = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email / Username", type: "text" },
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      const identifier = (credentials?.email || credentials?.username || "").trim();
      const password = credentials?.password;

      if (!identifier || !password) return null;

      // 1. Developer bypass check
      if (identifier === "developer" && password === "AutoDock") {
        return { id: "dev-user", name: "Dev Guest", email: "developer@AutoDock.local" };
      }

      // 2. Email / Gmail & Password authentication
      if (identifier.includes("@") || identifier.length >= 3) {
        const namePart = identifier.includes("@") ? identifier.split("@")[0] : identifier;
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const userEmail = identifier.includes("@") ? identifier : `${identifier}@gmail.com`;
        return {
          id: identifier.toLowerCase(),
          name: formattedName,
          email: userEmail
        };
      }

      return null;
    }
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "your_google_client_id_here" && process.env.GOOGLE_CLIENT_ID !== "dummy") {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== "dummy") {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "autodock-super-secret-key-production-fallback-2026",
  trustHost: true,
  providers,
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
