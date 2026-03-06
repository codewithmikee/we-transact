import { redirect } from "next/navigation";

/**
 * /dashboard is a legacy route. Redirect to /login;
 * middleware will send authenticated users to the right place.
 */
export default function DashboardRedirect() {
  redirect("/login");
}
