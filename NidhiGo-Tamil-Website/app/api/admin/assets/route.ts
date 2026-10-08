import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {adminGuard,unauthorized} from "@/lib/admin-api";
import {adminDb} from "@/lib/supabase";
export const runtime="nodejs";
const types:Record<string,string>={"image/png":"png","image/jpeg":"jpg","image/webp":"webp"};
export async function POST(request:NextRequest){
 if(!await adminGuard())return unauthorized();
 try{const data=await request.formData();const file=data.get("file");if(!(file instanceof File))return NextResponse.json({error:"Select a picture"},{status:400});
 if(!types[file.type]||file.size>5*1024*1024||file.size<50)return NextResponse.json({error:"PNG, JPG or WebP only (max 5 MB)"},{status:400});
 const bytes=await file.arrayBuffer();const header=new Uint8Array(bytes.slice(0,12));const png=header[0]===137&&header[1]===80&&header[2]===78&&header[3]===71;const jpg=header[0]===255&&header[1]===216;const webp=String.fromCharCode(...header.slice(0,4))==="RIFF"&&String.fromCharCode(...header.slice(8,12))==="WEBP";
 if(!(file.type==="image/png"&&png||file.type==="image/jpeg"&&jpg||file.type==="image/webp"&&webp))return NextResponse.json({error:"Invalid image file"},{status:400});
 const path=`assets/${randomUUID()}.${types[file.type]}`;const db=adminDb();const {error}=await db.storage.from("nidhigo-public").upload(path,bytes,{contentType:file.type,upsert:false});if(error)throw error;
 const {data:link}=db.storage.from("nidhigo-public").getPublicUrl(path);return NextResponse.json({url:link.publicUrl});
 }catch(e){console.error("Asset upload error",e);return NextResponse.json({error:"Upload failed"},{status:500})}
}
