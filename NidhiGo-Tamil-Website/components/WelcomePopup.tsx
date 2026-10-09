"use client";

import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import {X,Youtube,Send,Heart} from "lucide-react";

function safeSocialUrl(value:string|null|undefined,service:"youtube"|"telegram"){
 if(!value)return "";
 try{
  const url=new URL(value);
  if(url.protocol!=="https:")return "";
  const host=url.hostname.toLowerCase();
  const permitted=service==="youtube"
    ?["youtube.com","www.youtube.com","m.youtube.com","youtu.be"]
    :["t.me","telegram.me","www.t.me"];
  return permitted.includes(host)?url.href:"";
 }catch{return ""}
}

export default function WelcomePopup({youtubeUrl,telegramUrl}:{youtubeUrl:string|null;telegramUrl:string|null}){
 const pathname=usePathname();
 const [visible,setVisible]=useState(false);
 const youtube=safeSocialUrl(youtubeUrl,"youtube");
 const telegram=safeSocialUrl(telegramUrl,"telegram");
 const skip=pathname.startsWith("/admin")||(!youtube&&!telegram);

 useEffect(()=>{
  if(skip){setVisible(false);return;}
  try{if(window.sessionStorage.getItem("nidhigo-welcome-shown-v1")==="yes")return;}catch{}
  // Show only once per browsing session; don't interrupt the initial paint.
  const timer=window.setTimeout(()=>{
   setVisible(true);
   try{window.sessionStorage.setItem("nidhigo-welcome-shown-v1","yes");}catch{}
  },3500);
  return()=>window.clearTimeout(timer);
 },[skip]);
 useEffect(()=>{
  if(!visible)return;
  const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setVisible(false)};
  document.addEventListener("keydown",onKey);
  return()=>document.removeEventListener("keydown",onKey);
 },[visible]);

 if(skip||!visible)return null;
 return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[3px]"
  onMouseDown={event=>{if(event.target===event.currentTarget)setVisible(false)}}>
   <div role="dialog" aria-modal="true" aria-label="Welcome to NidhiGo Tamil"
    className="w-full max-w-sm rounded-[26px] border border-emerald-100 bg-white p-5 text-center shadow-[0_28px_80px_rgba(2,35,26,0.24)] sm:p-7">
    <button type="button" onClick={()=>setVisible(false)} aria-label="Close welcome message"
     className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"><X size={20}/></button>
    <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-[#087953]"><Heart size={26}/></div>
    <h2 className="text-2xl font-black text-[#064d39]">Welcome to NidhiGo Tamil!</h2>
    <p className="mt-2 text-[15px] font-semibold leading-6 text-slate-700">
     Financial product updates, helpful tutorials &amp; new videos — stay connected with us.
    </p>
    <div className="mt-5 grid gap-2">
     {youtube&&<a href={youtube} target="_blank" rel="noopener noreferrer" onClick={()=>setVisible(false)}
      className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#db2929] px-4 py-3 text-[15px] font-extrabold text-white shadow-md hover:bg-[#bc1d1d]">
      <Youtube size={22}/>Subscribe on YouTube
     </a>}
     {telegram&&<a href={telegram} target="_blank" rel="noopener noreferrer" onClick={()=>setVisible(false)}
      className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#218cc0] px-4 py-3 text-[15px] font-extrabold text-white shadow-md hover:bg-[#136f9e]">
      <Send size={20}/>Join our Telegram
     </a>}
    </div>
    <button type="button" onClick={()=>setVisible(false)}
     className="mt-4 min-h-10 text-sm font-bold text-slate-600 underline underline-offset-4">Continue browsing</button>
   </div>
  </div>;
}
