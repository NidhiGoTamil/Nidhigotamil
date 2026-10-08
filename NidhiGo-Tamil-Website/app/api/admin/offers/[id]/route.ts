import {NextRequest,NextResponse} from "next/server";
import {adminDb} from "@/lib/supabase";
import {adminGuard,unauthorized} from "@/lib/admin-api";
import {offerSchema} from "@/lib/offer-schema";
import {z} from "zod";
export async function PUT(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!await adminGuard())return unauthorized();const {id}=await params;if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"Invalid offer id"},{status:400});
 const parsed=offerSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid offer fields",details:parsed.error.flatten()},{status:400});
 const {error}=await adminDb().from("offers").update({...parsed.data,updated_at:new Date().toISOString()}).eq("id",id);return error?NextResponse.json({error:error.message},{status:400}):NextResponse.json({ok:true});
}
export async function DELETE(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!await adminGuard())return unauthorized();const {id}=await params;if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"Invalid offer id"},{status:400});
 const {error}=await adminDb().from("offers").update({published:false,updated_at:new Date().toISOString()}).eq("id",id);return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({ok:true});
}
