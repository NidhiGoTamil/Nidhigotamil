export default function CategoryLoading(){
 return <main aria-label="Loading financial products" className="mx-auto max-w-6xl px-3 pb-7 pt-5 sm:px-6">
  <div className="mb-3 h-9 w-24 animate-pulse rounded-xl bg-emerald-100"/>
  <div className="h-28 animate-pulse rounded-[22px] bg-gradient-to-r from-emerald-200 to-teal-100 sm:h-32"/>
  <div className="mb-4 mt-7 h-8 w-52 animate-pulse rounded-xl bg-slate-200"/>
  <div className="space-y-3">
   {[1,2].map(i=><div key={i} className="flex items-center gap-4 rounded-[22px] bg-white px-4 py-5 shadow-sm">
    <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-emerald-100"/>
    <div className="flex-1 space-y-3"><div className="h-6 max-w-48 animate-pulse rounded-lg bg-slate-200"/><div className="h-4 max-w-64 animate-pulse rounded-lg bg-slate-100"/></div>
    <div className="h-11 w-24 shrink-0 animate-pulse rounded-xl bg-emerald-200"/>
   </div>)}
  </div>
 </main>;
}
