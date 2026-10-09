import Link from "next/link";
import { Instagram, Send, Youtube } from "lucide-react";

type HomeSettings = {
  logo_url: string | null;
  youtube_url: string | null;
  telegram_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
};

export default function HomeFooter({ settings }: { settings: HomeSettings }) {
  const socials = [
    { label: "YouTube", url: settings.youtube_url, Icon: Youtube, color: "bg-red-600" },
    { label: "Instagram", url: settings.instagram_url, Icon: Instagram, color: "bg-pink-600" },
    { label: "Telegram", url: settings.telegram_url, Icon: Send, color: "bg-sky-500" },
    { label: "X", url: settings.x_url, Icon: null, color: "bg-slate-600" }
  ];
  const links = [
    { href: "/", text: "Home" },
    { href: "/about", text: "About Website" },
    { href: "/terms", text: "Terms & Conditions" }
  ];

  return (
    <footer className="mt-6 border-t border-[#15444b] bg-gradient-to-br from-[#062b34] via-[#052932] to-[#052229] text-white sm:mt-9" aria-label="NidhiGo Tamil homepage footer">
      <div className="mx-auto max-w-6xl px-5 pb-4 pt-6 sm:px-8 sm:pb-5 sm:pt-8">
        <div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-[1.4fr_0.9fr_1fr] sm:gap-8">
          <div className="col-span-2 sm:col-span-1 sm:border-r sm:border-white/15 sm:pr-7">
            <Link href="/" aria-label="NidhiGo Tamil homepage" className="inline-flex items-center">
              {settings.logo_url
                ? <span className="rounded-xl bg-white px-3 py-1.5"><img src={settings.logo_url} alt="NidhiGo Tamil" className="h-10 max-w-40 object-contain" /></span>
                : <span className="text-xl font-black tracking-tight">Nidhi<span className="text-emerald-400">Go</span> Tamil</span>}
            </Link>
            <p className="mt-2 max-w-sm text-xs leading-5 text-emerald-50/80">
              Explore financial products and information in one place.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-emerald-100/65">
              Independent information and affiliate website. Not a bank or lender.
            </p>
          </div>

          <div className="sm:border-r sm:border-white/15 sm:pr-5">
            <h2 className="text-sm font-extrabold text-white">Quick Links</h2>
            <nav className="mt-3 grid gap-2" aria-label="Footer quick links">
              {links.map(item =>
                <Link key={item.href} href={item.href} className="w-fit text-xs leading-5 text-emerald-50/85 hover:text-emerald-300 sm:text-sm">{item.text}</Link>
              )}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-white">Follow Us</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {socials.map(({label,url,Icon,color}) =>
                url && url.startsWith("https://")
                  ? <a key={label} href={url} aria-label={label} target="_blank" rel="noopener noreferrer" className={`grid h-9 w-9 place-items-center rounded-full text-white transition hover:-translate-y-0.5 ${color}`}>
                    {Icon ? <Icon size={18} /> : <span className="font-bold">𝕏</span>}
                  </a>
                  : <span key={label} aria-label={label+" link not configured"} title={label+" link not configured"} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white/30">
                    {Icon ? <Icon size={17} /> : <span className="font-bold">𝕏</span>}
                  </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 border-t border-white/15 pt-3 text-center text-[11px] leading-5 text-emerald-50/65">
          © {new Date().getFullYear()} NidhiGo Tamil. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
