import Link from "next/link";
import {CheckCircle2,Compass,ShieldCheck} from "lucide-react";
import {getCategories,getSettings} from "@/lib/data";
import HomeFooter from "@/components/HomeFooter";

export const revalidate=0;

const themeByCategory:Record<string,{card:string,accent:string,chips:string[]}>={
 "loan":{card:"from-emerald-50 via-teal-50 to-green-100 border-emerald-200",accent:"text-emerald-950",chips:["Personal Loan","Home Loan","Business Loan"]},
 "bank-account":{card:"from-sky-50 via-cyan-50 to-blue-100 border-sky-200",accent:"text-sky-950",chips:["Savings","Current","Digital"]},
 "credit-card":{card:"from-violet-50 via-purple-50 to-fuchsia-100 border-violet-200",accent:"text-violet-950",chips:["Cashback","Rewards","Offers"]},
 "demat-account":{card:"from-emerald-50 via-lime-50 to-teal-100 border-teal-200",accent:"text-teal-950",chips:["Stocks","Trading","Demat"]},
 "insurance":{card:"from-orange-50 via-rose-50 to-pink-100 border-rose-200",accent:"text-rose-950",chips:["Life","Health","Vehicle"]},
 "investment":{card:"from-amber-50 via-yellow-50 to-orange-100 border-amber-200",accent:"text-amber-950",chips:["Mutual Funds","SIP","Investing"]}
};

export default async function Home(){
 const [categories,settings]=await Promise.all([getCategories(),getSettings()]);
 return <>
  <main className="mx-auto w-full max-w-6xl px-3 pt-3 sm:px-6 sm:pt-5">
   <section aria-label="NidhiGo Tamil website banner" className="overflow-hidden rounded-[20px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-forest-100 shadow-[0_8px_25px_rgba(8,68,48,0.09)] sm:rounded-[24px]">
    {settings.banner_url
     ?<img src={settings.banner_url} alt="NidhiGo Tamil website banner" className="block h-auto w-full object-contain" loading="eager" fetchPriority="high" decoding="async"/>
     :<div className="flex min-h-[155px] flex-col justify-center px-6 py-7 sm:min-h-[240px] sm:px-12 sm:py-10">
       <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-forest-600">NidhiGo Tamil</p>
       <h1 className="text-3xl font-black leading-tight tracking-tight text-forest-900 sm:text-5xl">{settings.headline}</h1>
       <p className="mt-2 text-base font-semibold text-forest-800 sm:mt-4 sm:text-xl">{settings.subheadline}</p>
      </div>}
   </section>

   <section className="pt-6 sm:pt-9" id="services" aria-labelledby="services-title">
    <div className="mx-auto mb-5 max-w-xl text-center sm:mb-7">
     <h2 id="services-title" className="text-[29px] font-black tracking-tight text-[#102741] sm:text-[38px]">Our <span className="text-forest-600">Services</span></h2>
     <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-forest-500"/>
     <p className="mt-2 text-[14px] font-bold leading-6 text-slate-700 sm:text-base">Explore financial services in six categories.</p>
    </div>

    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-5" aria-label="Financial product categories">
     {categories.map(category=>{
      const theme=themeByCategory[category.slug]||{card:"from-emerald-50 via-white to-teal-50 border-emerald-200",accent:"text-forest-900",chips:[]};
      return <Link href={`/category/${category.slug}`} key={category.slug} prefetch
       className={`group relative flex min-h-[185px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[23px] border bg-gradient-to-br px-2.5 py-3.5 text-center shadow-[0_7px_22px_rgba(5,58,43,0.10)] transition-[transform,box-shadow,filter] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(5,58,43,0.17)] active:scale-[.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 sm:min-h-[165px] sm:flex-row sm:justify-start sm:gap-5 sm:px-5 sm:py-5 sm:text-left ${theme.card}`}>
       <div className="mb-2 grid h-[100px] w-[100px] shrink-0 place-items-center overflow-hidden rounded-[20px] bg-transparent sm:mb-0 sm:h-[125px] sm:w-[125px]">
        {category.icon_url
         ?<img src={category.icon_url} alt="" loading="lazy" decoding="async" className="h-full w-full scale-[1.12] rounded-[20px] object-contain drop-shadow-[0_6px_10px_rgba(4,53,37,0.12)] transition-transform duration-150 group-hover:scale-[1.18]"/>
         :<span className="text-6xl" aria-hidden="true">{category.emoji}</span>}
       </div>
       <div className="min-w-0 flex-1">
        <h3 className={`text-[17px] font-black leading-tight tracking-tight sm:text-[23px] ${theme.accent}`}>{category.title}</h3>
        <p className="mt-1 text-[12px] font-bold leading-[1.4] text-slate-800 sm:text-[14px]">{category.description}</p>
        {theme.chips.length>0&&<div className="mt-2 hidden flex-wrap gap-1 sm:flex">
         {theme.chips.map(chip=><span key={chip} className="rounded-full border border-black/5 bg-white/60 px-2 py-0.5 text-[10px] font-bold text-slate-700">{chip}</span>)}
        </div>}
       </div>
      </Link>
     })}
    </div>
   </section>

   <section aria-label="Financial information highlights" className="mx-auto mt-5 grid max-w-5xl grid-cols-3 items-center gap-1 rounded-[16px] border border-emerald-100/80 bg-gradient-to-r from-emerald-50 via-white to-sky-50 px-2 py-3 text-[10px] font-extrabold text-forest-900 shadow-sm sm:mt-6 sm:gap-4 sm:px-5 sm:py-4 sm:text-sm">
    <span className="flex min-w-0 items-center justify-center gap-1 text-center sm:gap-2"><ShieldCheck size={18} className="hidden shrink-0 text-forest-600 sm:block"/> <span>Product Information</span></span>
    <span className="flex min-w-0 items-center justify-center gap-1 text-center sm:gap-2"><Compass size={18} className="hidden shrink-0 text-forest-600 sm:block"/> <span>Six Categories</span></span>
    <span className="flex min-w-0 items-center justify-center gap-1 text-center sm:gap-2"><CheckCircle2 size={18} className="hidden shrink-0 text-forest-600 sm:block"/> <span>Provider Links</span></span>
   </section>
  </main>
  <HomeFooter settings={settings}/>
 </>;
}
