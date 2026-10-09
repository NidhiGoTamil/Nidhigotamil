"use client";

import {Play,Youtube,ExternalLink} from "lucide-react";

type Props={videoId:string;title:string;compact?:boolean};

/**
 * Video tutorials are external links, not embedded playback. On Android Chrome
 * an intent URL requests the installed YouTube app, with a browser fallback.
 * On other browsers, the standard YouTube watch URL lets OS link associations
 * open the app when supported.
 */
export default function YouTubeVideoLink({videoId,title,compact=false}:Props){
 if(!/^[A-Za-z0-9_-]{11}$/.test(videoId))return null;
 const youtubeUrl="https://www.youtube.com/watch?v="+videoId;
 const thumbnail="https://i.ytimg.com/vi/"+videoId+"/hqdefault.jpg";
 function openYouTubeApp(event:React.MouseEvent<HTMLAnchorElement>){
  if(typeof navigator==="undefined")return;
  const ua=navigator.userAgent;
  if(/Android/i.test(ua)&&/Chrome\/\d+/i.test(ua)){
   event.preventDefault();
   const fallback=encodeURIComponent(youtubeUrl);
   window.location.assign("intent://www.youtube.com/watch?v="+videoId+
    "#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url="+fallback+";end");
  }
 }
 return <a href={youtubeUrl} onClick={openYouTubeApp} target="_blank" rel="noopener noreferrer"
   aria-label={"Open "+title+" tutorial in YouTube"}
   className={"group relative block w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-[0_9px_24px_rgba(0,22,28,0.17)] transition hover:shadow-[0_14px_28px_rgba(0,22,28,0.23)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 "+(compact?"":"sm:max-w-2xl")}>
   <div className="relative aspect-video w-full overflow-hidden">
    <img src={thumbnail} alt="" loading="lazy" decoding="async"
     className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"/>
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10"/>
    <div aria-hidden="true" className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[19px] bg-[#ec1d24] text-white shadow-lg transition-transform group-hover:scale-110">
     <Play size={29} fill="currentColor" className="ml-1"/>
    </div>
    <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-extrabold text-white">
     <Youtube size={16}/> Watch on YouTube
    </span>
    <ExternalLink size={21} aria-hidden="true" className="absolute bottom-4 right-3 text-white drop-shadow"/>
   </div>
  </a>;
}
