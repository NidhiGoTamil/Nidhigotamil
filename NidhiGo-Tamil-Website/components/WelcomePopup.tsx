"use client";

import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import {X,Youtube,Send,ExternalLink} from "lucide-react";

function safeSocialUrl(value:string|null|undefined,service:"youtube"|"telegram"){
 if(!value)return "";
 try{
  const url=new URL(value);
  if(url.protocol!=="https:")return "";
  const allowed=service==="youtube"
   ?["youtube.com","www.youtube.com","m.youtube.com","youtu.be"]
   :["t.me","telegram.me","www.t.me"];
  return allowed.includes(url.hostname.toLowerCase())?url.href:"";
 }catch{return ""}
}

type Props={youtubeUrl:string|null;telegramUrl:string|null;logoUrl:string|null};

export default function WelcomePopup({youtubeUrl,telegramUrl,logoUrl}:Props){
 const pathname=usePathname();
 const [visible,setVisible]=useState(false);
 const youtube=safeSocialUrl(youtubeUrl,"youtube");
 const telegram=safeSocialUrl(telegramUrl,"telegram");
 const skip=pathname.startsWith("/admin");
 useEffect(()=>{
  if(skip){setVisible(false);return}
  try{if(window.sessionStorage.getItem("nidhigo-welcome-shown-v2")==="yes")return}catch{}
  const timer=window.setTimeout(()=>{
   setVisible(true);
   try{window.sessionStorage.setItem("nidhigo-welcome-shown-v2","yes")}catch{}
  },3500);
  return()=>window.clearTimeout(timer);
 },[skip]);
 useEffect(()=>{
  if(!visible)return;
  const handleKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setVisible(false)};
  document.addEventListener("keydown",handleKey);
  return()=>document.removeEventListener("keydown",handleKey);
 },[visible]);

 if(skip||!visible)return null;
 return <div
  className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#091d32]/65 p-3 backdrop-blur-[5px] sm:p-5"
  onMouseDown={e=>{if(e.currentTarget===e.target)setVisible(false)}}
 >
  <section role="dialog" aria-modal="true" aria-labelledby="nidhigo-welcome-title"
   className="relative my-auto w-full max-w-[440px] overflow-hidden rounded-[30px] border border-sky-100/80 bg-white shadow-[0_0_22px_rgba(65,200,220,0.32),0_25px_65px_rgba(0,24,51,0.30)]">
   <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#061b44] via-[#073e70] to-[#037a80] px-5 pb-8 pt-6 text-center text-white sm:px-8 sm:pb-9 sm:pt-8">
    <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-[#16c3aa]/35 blur-[70px]"/>
    <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-10 h-36 w-36 rounded-full bg-[#35bed7]/20 blur-[70px]"/>
    <button type="button" onClick={()=>setVisible(false)} aria-label="Close welcome message"
     className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full border-2 border-white/85 bg-white/10 text-white shadow-sm transition hover:bg-white/25 sm:right-4 sm:top-4">
     <X size={24}/>
    </button>

    <div className="mx-auto mt-3 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[23px] bg-white p-2 shadow-[0_7px_22px_rgba(1,16,44,0.24)] sm:h-32 sm:w-32">
     {logoUrl?<img src={logoUrl} alt="NidhiGo Tamil logo" className="h-full w-full object-contain"/>:<span className="text-center text-xl font-black text-[#09563d]">NidhiGo<br/>Tamil</span>}
    </div>
    <p className="mx-auto mt-5 inline-flex min-h-9 items-center justify-center rounded-full border border-amber-100/50 bg-white/10 px-6 text-[12px] font-extrabold tracking-[0.17em] text-[#ffdfae] sm:text-sm">
     NIDHIGO TAMIL
    </p>
    <h2 id="nidhigo-welcome-title" lang="ta"
     className="mt-5 text-[39px] font-black leading-tight tracking-tight text-white drop-shadow-sm sm:text-[44px]">
     வணக்கம்!
    </h2>
    <p lang="ta" className="mx-auto mt-3 max-w-sm text-[15px] font-bold leading-7 text-white/95 sm:text-[17px] sm:leading-8">
     NidhiGo Tamil-க்கு உங்களை அன்புடன் வரவேற்கிறோம். வங்கி தொடர்பான புதிய அறிவிப்புகள், சிறப்பு சலுகைகள் மற்றும் விண்ணப்ப வழிகாட்டுதல்களை உடனுக்குடன் பெறுங்கள்.
    </p>
   </div>

   <div className="space-y-3 bg-white px-5 pb-5 pt-5 sm:px-7 sm:pb-6">
    {telegram
     ?<a href={telegram} target="_blank" rel="noopener noreferrer" onClick={()=>setVisible(false)}
       className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-[#229eda] px-3 py-3 text-center text-[15px] font-extrabold text-white shadow-[0_5px_15px_rgba(34,158,218,0.18)] transition hover:bg-[#168bcc] sm:text-[16px]">
        <Send className="h-5 w-5 shrink-0"/>Join Our Telegram Channel<ExternalLink className="h-4 w-4 shrink-0"/>
       </a>
     :<div aria-label="Telegram link coming soon"
       className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-[#229eda]/75 px-3 py-3 text-[15px] font-extrabold text-white/95 sm:text-[16px]">
        <Send className="h-5 w-5 shrink-0"/>Telegram Channel — Coming Soon
       </div>}
    {youtube&&<a href={youtube} target="_blank" rel="noopener noreferrer" onClick={()=>setVisible(false)}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[16px] border border-red-200 bg-[#fff7f7] px-3 py-3 text-center text-[15px] font-extrabold text-[#b72121] transition hover:bg-red-100 sm:text-[16px]">
      <Youtube className="h-6 w-6 shrink-0 fill-[#bc2020] text-[#bc2020]"/>Subscribe to Our YouTube Channel<ExternalLink className="h-4 w-4 shrink-0"/>
     </a>}
    <button type="button" onClick={()=>setVisible(false)} className="mx-auto block min-h-12 w-full pt-2 text-[15px] font-extrabold text-slate-600 transition hover:text-slate-900">
     Continue Browsing
    </button>
   </div>
  </section>
 </div>;
}
