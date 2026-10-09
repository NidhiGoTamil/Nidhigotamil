import Link from "next/link";
import { ArrowUpRight, Instagram, Send, Youtube } from "lucide-react";

type HomeSettings = {
  logo_url: string | null;
  youtube_url: string | null;
  telegram_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
};

export default function HomeFooter({ settings }: { settings: HomeSettings }) {
  const socialLinks = [
    { label: "YouTube", url: settings.youtube_url, Icon: Youtube, color: "bg-red-600" },
    { label: "Instagram", url: settings.instagram_url, Icon: Instagram, color: "bg-pink-600" },
    { label: "Telegram", url: settings.telegram_url, Icon: Send, color: "bg-sky-500" },
    { label: "X", url: settings.x_url, Icon: null, color: "bg-slate-700" }
  ];
  const quickLinks = [
    { href: "/", text: "Home" },
    { href: "/about", text: "About Website" },
    { href: "/disclaimer", text: "Disclaimer" },
    { href: "/terms", text: "Terms & Conditions" },
    { href: "/terms", text: "Terms & Privacy" }
  ];

  return (
    <footer className="relative mt-10 overflow-hidden bg-[#06262d] text-white sm:mt-14" aria-label="NidhiGo Tamil website footer">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5 pb-7 pt-10 sm:px-8 sm:pt-12">
        <div className="grid gap-10 md:grid-cols-[1.25fr_0.9fr_1fr] md:gap-8">
          <div className="md:border-r md:border-white/15 md:pr-8">
            <Link href="/" aria-label="NidhiGo Tamil homepage" className="inline-flex items-center gap-3">
              {settings.logo_url
                ? <span className="inline-flex rounded-xl bg-white p-2"><img src={settings.logo_url} alt="NidhiGo Tamil" className="h-14 max-w-52 object-contain" /></span>
                : <span className="text-2xl font-black tracking-tight text-white">Nidhi<span className="text-emerald-400">Go</span> <span className="text-lg font-bold tracking-widest">TAMIL</span></span>}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-emerald-50/85">
              Explore information about loans, bank accounts, credit cards, demat accounts, insurance and investment products.
            </p>
            <p className="mt-3 max-w-xs text-xs leading-6 text-emerald-100/70">
              Independent information and affiliate website. Not a bank or lender.
            </p>
          </div>
          <div className="md:border-r md:border-white/15 md:pr-8">
            <h2 className="text-base font-extrabold">Quick Links</h2>
            <nav aria-label="Footer navigation" className="mt-4 grid gap-3">
              {quickLinks.map((item, i) =>
                <Link key={item.href + i} href={item.href} className="w-fit text-sm text-emerald-50/85 transition hover:text-emerald-300">{item.text}</Link>
              )}
            </nav>
          </div>
          <div>
            <h2 className="text-base font-extrabold">Follow Us</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map(({label,url,Icon,color}) => url && url.startsWith("https://")
                ? <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={`grid h-12 w-12 place-items-center rounded-full text-white transition hover:-translate-y-1 ${color}`}>
                    {Icon ? <Icon size={23} /> : <span className="text-lg font-bold">𝕏</span>}
                  </a>
                : <span key={label} aria-label={label + " link not configured"} title={label + " link not configured"} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10 text-white/40">
                    {Icon ? <Icon size={22} /> : <span className="text-lg font-bold">𝕏</span>}
                  </span>
              )}
            </div>
            <Link href="/disclaimer" className="mt-6 inline-flex items-center gap-2 text-xs text-emerald-100/75 hover:text-white">
              Read our financial information disclaimer <ArrowUpRight size={15}/>
            </Link>
          </div>
        </div>
        <div className="mt-10 border-t border-white/20 pt-5 text-center text-xs leading-6 text-emerald-50/65">
          © {new Date().getFullYear()} NidhiGo Tamil. All rights reserved. Financial products are subject to provider terms.
        </div>
      </div>
    </footer>
  );
}
