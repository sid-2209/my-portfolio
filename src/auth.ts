import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check against environment variables for admin credentials
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) {
          console.error("❌ [AUTH] Admin credentials not configured in environment variables");
          return null;
        }

        // Verify email matches
        if (credentials.email !== adminEmail) {
          return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          adminPasswordHash
        );

        if (!isValidPassword) {
          return null;
        }

        // Return user object on successful authentication
        return {
          id: "admin",
          email: adminEmail,
          name: "Admin"
        };
      }
    })
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdminPanel = nextUrl.pathname.startsWith('/admin');
      const isOnLoginPage = nextUrl.pathname === '/admin/login';

      if (isOnAdminPanel && !isOnLoginPage) {
        if (!isLoggedIn) return false;
        return true;
      }

      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL('/admin', nextUrl));
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});
