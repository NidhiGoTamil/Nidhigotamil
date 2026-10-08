import type { Config } from "tailwindcss";
export default {
  content:["./app/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}"],
  safelist:["from-rose-50","to-orange-50","from-sky-50","to-blue-50","from-violet-50","to-fuchsia-50","from-emerald-50","to-teal-50","from-pink-50","to-rose-50","from-amber-50","to-yellow-50"],
  theme:{extend:{colors:{forest:{50:"#edf9f4",100:"#d7f2e6",400:"#13aa78",500:"#07885f",600:"#087653",700:"#07583f",800:"#053a2c",900:"#032b22"}},boxShadow:{premium:"0 16px 48px rgba(9,46,35,.10)"}}},plugins:[]
} satisfies Config;
