import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

// Export the handler for API routes
export { handler as GET, handler as POST };

// Export the `auth` function for server components
export const auth = async () => {
  try {
    // Use getServerSession directly with your authOptions
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
};

export default auth;
