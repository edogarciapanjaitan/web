import { redirect } from "next/navigation";

/**
 * Root page — redirects to dashboard.
 * The middleware will handle redirecting to /login if unauthenticated.
 */
export default function Home() {
  redirect("/dashboard");
}
