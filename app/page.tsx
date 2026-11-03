import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "student") redirect("/student");
  if (session.role === "officer") redirect("/officer");
  redirect("/recruiter");
}
