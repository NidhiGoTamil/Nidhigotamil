"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Instagram,Youtube,Send} from "lucide-react";
export default function SiteFooter({settings}:{settings:any}){
 const pathname=usePathname();
 if(pathname==="/"||pathname.startsWith("/admin"))return null;
 const socials=[{url:settings.youtube_url,Icon:Youtube,label:"YouTube",color:"text-red-600"},{url:settings.telegram_url,Icon:Send,label:"Telegram",color:"text-sky-600"},{url:settings.instagram_url,Icon:Instagram,label:"Instagram",color:"text-pink-600"},{url:settings.x_url,Icon:null,label:"X",color:"text-slate-950"}];
 return <footer className="mt-14 border-t border-forest-800/10 bg-white px-4 py-8 text-center">
  <h2 className="text-sm font-bold tracking-wider text-forest-800">FOLLOW US ON</h2><div className="mt-4 flex justify-center gap-3">
  {socials.map(({url,Icon,label,color})=>url&&/^https:\/\//.test(url)?<a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={`grid h-12 w-12 place-items-center rounded-2xl border border-gray-100 bg-white shadow-sm ${color}`}>{Icon?<Icon size={23}/>:<b className="text-lg">𝕏</b>}</a>:<span key={label} title={`${label} link will be added later`} className={`grid h-12 w-12 place-items-center rounded-2xl border border-gray-100 bg-gray-50 opacity-40 ${color}`}>{Icon?<Icon size={23}/>:<b className="text-lg">𝕏</b>}</span>)}
  </div><div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-500"><Link href="/about">About</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/terms">Terms & Conditions</Link></div>
  <p className="mt-4 text-xs text-slate-400">© {new Date().getFullYear()} NidhiGo Tamil • Information only • Financial products are subject to provider eligibility and terms.</p>
 </footer>;
}
