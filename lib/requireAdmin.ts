import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function requireAdmin() {

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Only allow specific admin email(s)
  const admins = [
    "hadekunleadeniyi27@gmail.com",
    "ayodimejitaiwo12@gmail.com"
  ];

  if (!admins.includes(user.email ?? "")) {
    redirect("/");
  }

  return user;
}