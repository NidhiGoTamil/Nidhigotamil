export default function ProductLoading(){
 return <main aria-label="Loading product information" className="mx-auto max-w-4xl px-3 pb-7 pt-5 sm:px-6">
  <div className="mb-3 h-9 w-24 animate-pulse rounded-xl bg-emerald-100"/>
  <div className="h-28 animate-pulse rounded-[22px] bg-gradient-to-r from-emerald-300 to-teal-200"/>
  <div className="mt-4 space-y-5 rounded-[22px] bg-white p-6 shadow-sm">
   <div className="h-7 w-52 animate-pulse rounded-lg bg-slate-200"/>
   <div className="h-4 w-full animate-pulse rounded-lg bg-slate-100"/>
   <div className="h-4 w-4/5 animate-pulse rounded-lg bg-slate-100"/>
   <div className="h-4 w-3/5 animate-pulse rounded-lg bg-slate-100"/>
   <div className="mt-4 aspect-video w-full animate-pulse rounded-2xl bg-slate-100"/>
  </div>
 </main>;
}
