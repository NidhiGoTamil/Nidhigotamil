import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasPublicSupabase,hasServerSupabase } from "./config";
export function adminDb(){
  if(!hasServerSupabase) throw new Error("Supabase server credentials not configured");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function publicDb(){
  if(!hasPublicSupabase) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false}});
}
export async function authDb(){
  if(!hasPublicSupabase) return null;
  const cookieStore=await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{
    cookies:{
      getAll(){return cookieStore.getAll()},
      setAll(toSet: Array<{
        name: string;
        value: string;
        options?: {
          path?: string;
          domain?: string;
          maxAge?: number;
          expires?: Date;
          httpOnly?: boolean;
          secure?: boolean;
          sameSite?: boolean | "lax" | "strict" | "none";
          priority?: "low" | "medium" | "high";
        };
      }>){
        try{
          toSet.forEach(({name,value,options})=>cookieStore.set(name,value,options));
        }catch{
          /* Server Components cannot set cookies; login API/client will refresh */
        }
      }
    }
  });
}
export async function requireAdmin(){
  const supabase=await authDb();
  if(!supabase||!hasServerSupabase) return null;
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user) return null;
  const {data:membership,error:membershipError}=await adminDb().from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
  return membershipError||!membership?null:user;
}
