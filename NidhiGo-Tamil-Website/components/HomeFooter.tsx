import Link from "next/link";
import { Instagram, Youtube, Send } from "lucide-react";

type HomeSettings = {
  logo_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  telegram_url: string | null;
  x_url: string | null;
};

export default function HomeFooter({ settings }: { settings: HomeSettings }) {
  // Never add placeholder social-media links that lead nowhere.
  const socialLinks = [
    {label:"YouTube",url:settings.youtube_url,Icon:Youtube,color:"bg-red-600"},
    {label:"Instagram",url:settings.instagram_url,Icon:Instagram,color:"bg-pink-600"},
    {label:"Telegram",url:settings.telegram_url,Icon:Send,color:"bg-sky-600"}
  ];
  const links=[
    {href:"/",label:"Home"},
    {href:"/about",label:"About"},
    {href:"/terms",label:"Terms & Conditions"},
    {href:"/privacy",label:"Privacy"}
  ];

  return <footer className="mt-5 border-t border-emerald-900/15 bg-[#062d35] text-white sm:mt-8" aria-label="NidhiGo Tamil website footer">
    <div className="mx-auto max-w-6xl px-4 pb-3 pt-5 sm:px-7 sm:pb-4 sm:pt-6">
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-[1.15fr_1.15fr_0.8fr] sm:items-start sm:gap-8">
        <div className="col-span-2 sm:col-span-1">
          <Link href="/" className="inline-block text-xl font-black tracking-tight text-white sm:text-2xl" aria-label="NidhiGo Tamil home">NidhiGo Tamil</Link>
          <p className="mt-1.5 max-w-sm text-[11px] leading-5 text-emerald-50/85 sm:text-xs">Explore Financial Products and Information in One Place.</p>
          <p className="mt-1 max-w-sm text-[10px] leading-4 text-emerald-100/65 sm:text-[11px]">Independent information and affiliate website. Not a bank or lender.</p>
        </div>
        <nav aria-label="Footer quick links">
          <h2 className="text-xs font-bold text-white sm:text-sm">Quick Links</h2>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
            {links.map(l=><Link key={l.href} href={l.href} className="text-[11px] leading-4 text-emerald-50/85 transition hover:text-white sm:text-xs">{l.label}</Link>)}
          </div>
        </nav>
        <div>
          <h2 className="text-xs font-bold text-white sm:text-sm">Follow Us</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {socialLinks.map(({label,url,Icon,color})=>url&&/^https:\/\//i.test(url)
              ?<a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={`grid h-9 w-9 place-items-center rounded-full text-white transition hover:-translate-y-0.5 ${color}`}><Icon size={19}/></a>
              :<span key={label} aria-label={label+" link not configured"} title={label+" link not configured"} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white/50"><Icon size={19}/></span>)}
          </div>
        </div>
      </div>
      <p className="mt-4 border-t border-white/15 pt-3 text-center text-[10px] text-emerald-50/70 sm:text-xs">© {new Date().getFullYear()} NidhiGo Tamil. All rights reserved.</p>
    </div>
  </footer>;
}
