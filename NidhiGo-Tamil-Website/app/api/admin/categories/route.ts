import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {adminDb} from "@/lib/supabase";
import {adminGuard,unauthorized} from "@/lib/admin-api";
import {CATEGORY_ORDER} from "@/lib/config";
const schema=z.object({slug:z.enum(CATEGORY_ORDER),icon_url:z.union([z.literal(""),z.string().url().startsWith("https://")])});
export async function PUT(req:NextRequest){if(!await adminGuard())return unauthorized();const p=schema.safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"Invalid category settings"},{status:400});const {error}=await adminDb().from("categories").update({icon_url:p.data.icon_url||null}).eq("slug",p.data.slug);return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({ok:true});}
