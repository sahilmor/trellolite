import { SupabaseClient } from "@supabase/supabase-js";

export async function syncUser(
  supabase: SupabaseClient,
  user: any
) {

  const { error } = await supabase
    .from("users")
    .upsert({
      id: user.id,
      name: user.fullName || user.firstName,
      email: user.emailAddresses?.[0]?.emailAddress,
      image_url: user.imageUrl
    });

  if (error) throw error;
}