import { redirect } from "next/navigation";

/**
 * Root route — redirect to login.
 * Middleware will forward authenticated users to /system or /org/[slug].
 */
export default function Home() {
  redirect("/login");
}
