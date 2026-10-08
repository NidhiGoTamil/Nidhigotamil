import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {adminDb} from "@/lib/supabase";
import {adminGuard,unauthorized} from "@/lib/admin-api";
const safeUrl=z.union([z.literal(""),z.string().url().startsWith("https://")]);
const schema=z.object({logo_url:safeUrl,banner_url:safeUrl,headline:z.string().trim().min(3).max(160),subheadline:z.string().trim().max(160),youtube_url:safeUrl,instagram_url:safeUrl,telegram_url:safeUrl,x_url:safeUrl});
export async function GET(){if(!await adminGuard())return unauthorized();const {data,error}=await adminDb().from("site_settings").select("*").eq("id",1).single();return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({settings:data});}
export async function PUT(request:NextRequest){if(!await adminGuard())return unauthorized();const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid website settings"},{status:400});const {error}=await adminDb().from("site_settings").update(parsed.data).eq("id",1);return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({ok:true});}
