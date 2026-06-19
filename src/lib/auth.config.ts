import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminRoute =
        pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

      if (!isAdminRoute) return true;

      if (!auth?.user) return false;
      return auth.user.role === "ADMIN";
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "ADMIN";
      }
      return session;
    },
  },
};
