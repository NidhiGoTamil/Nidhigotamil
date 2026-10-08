import {NextRequest,NextResponse} from "next/server";
import {adminDb} from "@/lib/supabase";
import {adminGuard,unauthorized} from "@/lib/admin-api";
import {offerSchema} from "@/lib/offer-schema";
export const dynamic="force-dynamic";
export async function GET(){if(!await adminGuard())return unauthorized();const {data,error}=await adminDb().from("offers").select("*").order("created_at",{ascending:false});return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({offers:data},{headers:{"Cache-Control":"no-store"}})}
export async function POST(req:NextRequest){if(!await adminGuard())return unauthorized();const parsed=offerSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid offer fields",details:parsed.error.flatten()},{status:400});const {data,error}=await adminDb().from("offers").insert(parsed.data).select("id").single();return error?NextResponse.json({error:error.message},{status:400}):NextResponse.json({ok:true,offer:data},{status:201})}
