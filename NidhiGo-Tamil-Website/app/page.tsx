import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories, getSettings } from "@/lib/data";

export const revalidate = 0;

// Homepage intentionally stops immediately after the six category tiles.
// Applications and provider links remain available on product detail pages.
export default async function Home() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  return (
    <main className="mx-auto w-full max-w-6xl px-3 pb-7 pt-3 sm:px-6 sm:pb-10 sm:pt-6">
      <section
        aria-label="NidhiGo Tamil website banner"
        className="relative overflow-hidden rounded-[22px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-forest-100 shadow-premium sm:rounded-[28px]"
      >
        {settings.banner_url ? (
          <img
            src={settings.banner_url}
            alt="NidhiGo Tamil website banner"
            className="block h-auto w-full object-contain"
          />
        ) : (
          <div className="relative flex min-h-[145px] flex-col justify-center gap-2 px-5 py-6 sm:min-h-[210px] sm:px-11 sm:py-9">
            <div className="pointer-events-none absolute -right-4 bottom-0 select-none text-[100px] opacity-10 sm:right-10 sm:text-[170px]" aria-hidden="true">🏛️</div>
            <div className="relative z-10 max-w-2xl">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest-600 sm:text-xs">NidhiGo Tamil</p>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-forest-900 sm:text-5xl">{settings.headline}</h1>
              <p className="mt-2 text-xs font-medium text-forest-800 sm:mt-3 sm:text-lg">{settings.subheadline}</p>
            </div>
          </div>
        )}
      </section>

      <div className="mb-4 mt-7 text-center sm:mb-6 sm:mt-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-forest-500">Explore</p>
        <h2 className="mt-1 text-xl font-black text-forest-900 sm:text-3xl">Our Services</h2>
      </div>
      <section aria-label="Financial product categories" className="mx-auto grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
        {categories.map((category: any) => (
          <Link
            href={`/category/${category.slug}`}
            key={category.slug}
            className={`group relative flex min-h-[146px] flex-col items-center justify-center rounded-[22px] border border-forest-700/5 bg-gradient-to-br p-3 text-center shadow-[0_9px_24px_rgba(7,88,63,.05)] transition hover:-translate-y-1 hover:shadow-premium sm:min-h-[175px] sm:rounded-3xl sm:p-4 ${category.accent || "from-emerald-50 to-teal-50"}`}
          >
            <div className="mb-2 grid h-14 w-14 place-items-center rounded-2xl bg-white/75 shadow-sm sm:mb-3 sm:h-20 sm:w-20">
              {category.icon_url ? (
                <img src={category.icon_url} alt="" className="h-full w-full object-contain p-1.5" />
              ) : (
                <span className="text-4xl" aria-hidden="true">{category.emoji}</span>
              )}
            </div>
            <h3 className="text-sm font-extrabold text-forest-900 sm:text-base">{category.title}</h3>
            <p className="mt-1 px-1 text-[11px] leading-snug text-forest-800/70">{category.description}</p>
            <ArrowRight size={15} className="absolute bottom-2 right-2 text-forest-700/70 transition-transform group-hover:translate-x-1 sm:bottom-3 sm:right-3" aria-hidden="true" />
          </Link>
        ))}
      </section>
    </main>
  );
}
