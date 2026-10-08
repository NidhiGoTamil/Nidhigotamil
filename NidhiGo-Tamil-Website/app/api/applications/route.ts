import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {adminDb} from "@/lib/supabase";
import {hasServerSupabase,CATEGORY_ORDER} from "@/lib/config";
export const runtime="nodejs";
const schema=z.object({full_name:z.string().trim().min(2).max(120),email:z.string().trim().email().max(254),phone:z.string().trim().regex(/^[0-9+\-\s()]{10,20}$/),category:z.enum(CATEGORY_ORDER),offer_slug:z.string().max(150).optional().nullable(),purpose:z.string().trim().max(200).default(""),message:z.string().trim().max(1000).default(""),consent:z.literal(true),honeypot:z.string().optional()});
export async function POST(request:NextRequest){
 try{if(!hasServerSupabase)return NextResponse.json({error:"Applications are not active until database setup is completed."},{status:503});
  const raw=await request.json();const parsed=schema.safeParse(raw);if(!parsed.success)return NextResponse.json({error:"Please check the required fields and your consent."},{status:400});
  const v=parsed.data;if(v.honeypot)return NextResponse.json({ok:true},{status:200});
  const phone=v.phone.replace(/[^0-9]/g,"");if(phone.length<10||phone.length>15)return NextResponse.json({error:"Invalid phone number."},{status:400});
  const db=adminDb();
  const since=new Date(Date.now()-10*60*1000).toISOString();
  const {count, error:checkError}=await db.from("applications").select("id",{count:"exact",head:true}).eq("phone",phone).gte("created_at",since);
  if(checkError)throw checkError;
  if((count||0)>=3)return NextResponse.json({error:"Too many enquiries from this number. Please try later."},{status:429});
  let offerId:string|null=null,offerTitle:string|null=null;
  if(v.offer_slug){const {data:target,error:offerError}=await db.from("offers").select("id,title,category,published").eq("slug",v.offer_slug).maybeSingle();
   if(offerError||!target||!target.published||target.category!==v.category)return NextResponse.json({error:"Invalid product selection"},{status:400});
   offerId=target.id;offerTitle=target.title;
  }
  const {error}=await db.from("applications").insert({full_name:v.full_name,email:v.email,phone,category:v.category,offer_id:offerId,offer_title:offerTitle,purpose:v.purpose,message:v.message,consent_at:new Date().toISOString()});
  if(error)throw error;
  return NextResponse.json({ok:true},{status:201});
 }catch(e){console.error("Submit application failed",e);return NextResponse.json({error:"Unable to save the application. Please try again later."},{status:500})}
}
