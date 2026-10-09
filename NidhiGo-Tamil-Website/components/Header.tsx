"use client";
import Link from "next/link";
import {useState} from "react";
import {usePathname,useRouter} from "next/navigation";
import {createBrowserClient} from "@supabase/ssr";
import {Menu,X,Info,FileText,ShieldCheck,Mail,LogOut} from "lucide-react";
export default function Header({logoUrl}:{logoUrl?:string}){
 const [open,setOpen]=useState(false);
 const [signingOut,setSigningOut]=useState(false);
 const [signOutError,setSignOutError]=useState("");
 const pathname=usePathname();
 const router=useRouter();
 const adminMenu=pathname.startsWith("/admin");
 const loginPage=pathname==="/admin/login";
 async function signOut(){
  if(signingOut)return;
  setSigningOut(true);setSignOutError("");
  try{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
   const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw Error("Sign out is not configured");
   const {error}=await createBrowserClient(url,key).auth.signOut();
   if(error)throw error;
   setOpen(false);
   router.push("/admin/login");
   router.refresh();
  }catch(e){setSignOutError(e instanceof Error?e.message:"Sign out failed");}
  finally{setSigningOut(false)}
 }
 const links=[{href:"/apply",label:"Contact & Enquiries",icon:Mail},{href:"/about",label:"About Website",icon:Info},{href:"/disclaimer",label:"Disclaimer",icon:FileText},{href:"/terms",label:"Terms & Conditions",icon:ShieldCheck}];
 return <header className="sticky top-0 z-50 border-b border-forest-700/10 bg-white/95 backdrop-blur-xl">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
   <Link href="/" className="flex items-center gap-3" onClick={()=>setOpen(false)}>
    {logoUrl?<img src={logoUrl} alt="NidhiGo Tamil" className="h-12 max-w-52 object-contain sm:h-14 sm:max-w-60"/>:<><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-700 text-2xl font-bold text-white">N</div><div><div className="text-lg font-extrabold tracking-tight text-forest-900">NidhiGo Tamil</div><div className="text-[10px] text-forest-700">Smart Financial Choices</div></div></>}
   </Link>
   <div className="relative">
    {!loginPage&&<button type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label={adminMenu?"Open admin menu":"Open website menu"} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-forest-700/10 bg-forest-50 text-forest-800">{open?<X size={24}/>:<Menu size={24}/>}</button>}
    {open&&!loginPage&&<><button type="button" className="fixed inset-0 z-[-1] cursor-default" onClick={()=>setOpen(false)} aria-label="Close menu"/><nav className="absolute right-0 top-[calc(100%+12px)] w-64 rounded-3xl border border-forest-700/10 bg-white p-3 shadow-premium" aria-label={adminMenu?"Admin menu":"Main menu"}>
     {adminMenu?<>
       <button type="button" disabled={signingOut} onClick={()=>{void signOut()}} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-forest-800 transition hover:bg-forest-50 disabled:opacity-50"><LogOut size={18}/>{signingOut?"Signing Out...":"Sign Out"}</button>
       {signOutError&&<p role="alert" className="px-3 pb-2 text-xs text-red-700">{signOutError}</p>}
     </>:links.map((l,i)=><Link key={l.href} href={l.href} onClick={()=>setOpen(false)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold transition hover:bg-forest-50 ${i===0?"mb-1 bg-forest-50 text-forest-800 hover:bg-forest-100":"text-slate-700"}`}><l.icon size={18}/>{l.label}</Link>)}
    </nav></>}
   </div>
  </div>
 </header>
}
