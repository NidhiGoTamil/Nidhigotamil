import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, ShieldCheck } from "lucide-react";
import { getCategories, getSettings } from "@/lib/data";
import HomeFooter from "@/components/HomeFooter";

export const revalidate = 0;

// Only the homepage presentation changes. The saved banner, icons, categories,
// labels and the rest of the public/admin application remain data-driven.
export default async function Home() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-3 pt-3 sm:px-6 sm:pt-6">
        <section
          aria-label="NidhiGo Tamil website banner"
          className="overflow-hidden rounded-[20px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-forest-100 shadow-premium sm:rounded-[24px]"
        >
          {settings.banner_url ? (
            <img src={settings.banner_url} alt="NidhiGo Tamil website banner" className="block h-auto w-full object-contain" />
          ) : (
            <div className="relative flex min-h-[155px] flex-col justify-center px-6 py-7 sm:min-h-[240px] sm:px-12 sm:py-10">
              <div className="relative z-10 max-w-2xl">
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-forest-600 sm:text-xs">NidhiGo Tamil</p>
                <h1 className="text-2xl font-black leading-tight tracking-tight text-forest-900 sm:text-5xl">{settings.headline}</h1>
                <p className="mt-2 text-xs font-medium text-forest-800 sm:mt-4 sm:text-lg">{settings.subheadline}</p>
              </div>
            </div>
          )}
        </section>

        <section className="pt-6 sm:pt-9" id="services" aria-labelledby="services-title">
          <div className="mx-auto mb-4 max-w-xl text-center sm:mb-6">
            <h2 id="services-title" className="text-2xl font-black tracking-tight text-[#102741] sm:text-3xl">
              Our <span className="text-forest-500">Services</span>
            </h2>
            <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-forest-500" />
            <p className="mt-2 text-xs text-slate-600 sm:text-sm">Explore financial services in six categories.</p>
          </div>

          {/* Exactly two columns on phones and desktops: 3 pairs of category cards. */}
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-4" aria-label="Financial product categories">
            {categories.map((category: any) => (
              <Link
                href={`/category/${category.slug}`}
                key={category.slug}
                className={`group relative flex min-h-[158px] flex-col items-center justify-start rounded-[19px] border border-forest-700/10 bg-gradient-to-br px-2.5 pb-6 pt-4 text-center shadow-[0_6px_22px_rgba(7,88,63,.055)] transition-all duration-200 hover:-translate-y-0.5 hover:border-forest-500/25 hover:shadow-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 sm:min-h-[150px] sm:flex-row sm:justify-start sm:gap-4 sm:rounded-[22px] sm:px-5 sm:py-5 sm:text-left ${category.accent || "from-emerald-50 to-teal-50"}`}
              >
                <div className="mb-2 grid h-16 w-16 shrink-0 place-items-center rounded-[16px] bg-white/80 p-1.5 shadow-sm sm:mb-0 sm:h-20 sm:w-20">
                  {category.icon_url ? (
                    <img src={category.icon_url} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[37px]" aria-hidden="true">{category.emoji}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-extrabold leading-5 text-[#102741] sm:text-lg">{category.title}</h3>
                  <p className="mt-1 text-[10px] leading-[15px] text-slate-600 sm:text-xs sm:leading-5">{category.description}</p>
                </div>
                <span className="absolute bottom-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-full bg-forest-600 text-white transition-transform group-hover:translate-x-0.5 sm:static sm:h-9 sm:w-9 sm:shrink-0" aria-hidden="true">
                  <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-label="Financial information highlights" className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-[17px] border border-emerald-100/80 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-3 py-3 text-[11px] font-semibold text-forest-800 sm:mt-6 sm:gap-x-9 sm:py-4 sm:text-xs">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={17} className="text-forest-600"/> Product Information</span>
          <span className="inline-flex items-center gap-1.5"><Compass size={17} className="text-forest-600"/> Six Categories</span>
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={17} className="text-forest-600"/> Provider Links</span>
        </section>

      </main>
      <HomeFooter settings={settings}/>
    </>
  );
}
