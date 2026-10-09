import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleHelp, Compass, Handshake, Lightbulb, Mail, ShieldCheck, TrendingUp } from "lucide-react";
import { getCategories, getSettings } from "@/lib/data";
import HomeFooter from "@/components/HomeFooter";

export const revalidate = 0;

/**
 * Approved home layout: existing logo, uploaded hero banner and six categories
 * remain data-driven. No application form or auto-published offers on homepage.
 */
export default async function Home() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-3 pt-3 sm:px-6 sm:pt-6">
        <section
          aria-label="NidhiGo Tamil website banner"
          className="relative overflow-hidden rounded-[20px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-forest-100 shadow-premium sm:rounded-[28px]"
        >
          {settings.banner_url ? (
            <img
              src={settings.banner_url}
              alt="NidhiGo Tamil website banner"
              className="block h-auto w-full object-contain"
            />
          ) : (
            <div className="relative flex min-h-[170px] flex-col justify-center gap-2 px-6 py-7 sm:min-h-[265px] sm:px-12 sm:py-12">
              <div className="pointer-events-none absolute -bottom-8 right-6 select-none text-[125px] opacity-10 sm:right-16 sm:text-[180px]" aria-hidden="true">🏦</div>
              <div className="relative z-10 max-w-2xl">
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-forest-600 sm:text-xs">NidhiGo Tamil</p>
                <h1 className="text-2xl font-black leading-tight tracking-tight text-forest-900 sm:text-5xl">{settings.headline}</h1>
                <p className="mt-2 text-xs font-medium text-forest-800 sm:mt-4 sm:text-lg">{settings.subheadline}</p>
              </div>
            </div>
          )}
        </section>

        <section className="pt-7 sm:pt-11" id="services" aria-labelledby="services-title">
          <div className="mx-auto mb-5 max-w-xl text-center sm:mb-7">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-forest-600">Explore</p>
            <h2 id="services-title" className="mt-1 text-2xl font-black tracking-tight text-[#102741] sm:text-4xl">
              Our <span className="text-forest-500">Services</span>
            </h2>
            <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-forest-500" />
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Explore financial product information in six categories.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4" aria-label="Financial product categories">
            {categories.map((category: any) => (
              <Link
                href={`/category/${category.slug}`}
                key={category.slug}
                className={`group relative flex min-h-[122px] items-center gap-4 overflow-hidden rounded-[22px] border border-forest-700/5 bg-gradient-to-br px-4 py-4 shadow-[0_8px_25px_rgba(7,88,63,.05)] transition duration-200 hover:-translate-y-1 hover:border-forest-500/20 hover:shadow-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 sm:min-h-[145px] sm:gap-5 sm:p-5 ${category.accent || "from-emerald-50 to-teal-50"}`}
              >
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/70 p-2 shadow-sm sm:h-24 sm:w-24">
                  {category.icon_url ? (
                    <img src={category.icon_url} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-5xl" aria-hidden="true">{category.emoji}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-[#102741] sm:text-xl">{category.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{category.description}</p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest-600 text-white shadow-md transition-transform group-hover:translate-x-1 sm:h-10 sm:w-10" aria-hidden="true">
                  <ArrowRight size={18} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="options-title" className="mt-6 grid items-center gap-4 rounded-[23px] border border-emerald-100/70 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-5 sm:mt-7 sm:grid-cols-[1.35fr_1fr] sm:p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-amber-500 shadow-sm"><Lightbulb size={31}/></span>
            <div>
              <h2 id="options-title" className="text-base font-black text-[#102741] sm:text-xl">Explore Financial Options</h2>
              <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-sm">Browse product information and review provider terms before applying.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-emerald-900/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:text-left">
              <ShieldCheck className="shrink-0 text-forest-600" size={23}/>
              <span className="text-[10px] font-bold leading-tight text-[#102741] sm:text-xs">Product Information</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:text-left">
              <Compass className="shrink-0 text-forest-600" size={23}/>
              <span className="text-[10px] font-bold leading-tight text-[#102741] sm:text-xs">Six Categories</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:text-left">
              <CheckCircle2 className="shrink-0 text-forest-600" size={23}/>
              <span className="text-[10px] font-bold leading-tight text-[#102741] sm:text-xs">Provider Links</span>
            </div>
          </div>
        </section>

        <section aria-labelledby="about-title" className="mt-4 grid gap-5 overflow-hidden rounded-[23px] border border-emerald-950/5 bg-white p-5 shadow-[0_10px_38px_rgba(18,58,44,.06)] sm:mt-5 sm:grid-cols-[1.5fr_0.7fr] sm:items-center sm:p-7">
          <div>
            <h2 id="about-title" className="text-2xl font-black tracking-tight text-[#102741] sm:text-3xl">
              About <span className="text-forest-500">NidhiGo Tamil</span>
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              NidhiGo Tamil helps visitors explore information about loans, bank accounts, credit cards, demat accounts, insurance and investment products. Our goal is to provide simple product overviews, required documents, tutorial links and convenient links to third-party providers.
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              We are an independent information and affiliate marketing website, not a bank or lender. Provider offers and eligibility may change without notice.
            </p>
            <Link href="/about" className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-forest-800">
              Know More <ArrowRight size={17}/>
            </Link>
          </div>
          <div className="relative grid min-h-[155px] place-items-center rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 sm:min-h-[220px]" aria-hidden="true">
            <span className="absolute left-4 top-5 rounded-2xl bg-white p-3 text-forest-600 shadow-md"><TrendingUp size={30}/></span>
            <span className="grid h-28 w-28 place-items-center rounded-full border border-emerald-200 bg-white text-6xl shadow-lg sm:h-36 sm:w-36">📊</span>
            <span className="absolute bottom-5 right-4 rounded-2xl bg-white p-3 text-forest-600 shadow-md"><Handshake size={30}/></span>
          </div>
        </section>

        <section aria-labelledby="help-title" className="mt-4 flex flex-col gap-4 rounded-[23px] border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 p-5 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-blue-700 shadow-sm"><CircleHelp size={30}/></span>
            <div>
              <h2 id="help-title" className="text-lg font-black text-[#102741] sm:text-xl">Need Help?</h2>
              <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-sm">
                Select a category to explore product details and application enquiry options.
              </p>
            </div>
          </div>
          <Link href="#services" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#104e89] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0b3764]">
            <Mail size={17}/> Browse &amp; Enquire <ArrowRight size={18}/>
          </Link>
        </section>
      </main>
      <HomeFooter settings={settings}/>
    </>
  );
}
