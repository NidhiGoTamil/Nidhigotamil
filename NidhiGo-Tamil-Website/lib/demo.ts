import type { CategorySlug } from "./config";
export type Offer = {
 id:string; slug:string; category:CategorySlug; title:string; provider_name:string; description:string;
 logo_url:string|null; highlight:string; benefits:string[]; documents:string[]; steps:string[];
 tutorial_url:string|null; affiliate_url:string|null; is_demo:boolean; published:boolean; created_at?:string;
};
export type Category = {slug:CategorySlug; title:string; description:string; icon_url:string|null; emoji:string; accent:string};
export const categories:Category[]=[
 {slug:"loan",title:"Loans",description:"Personal, Home & Business",icon_url:"/assets/loan.png",emoji:"💰",accent:"from-rose-50 to-orange-50"},
 {slug:"bank-account",title:"Bank Accounts",description:"Savings, Current & Digital",icon_url:"/assets/bank-account.png",emoji:"🏦",accent:"from-sky-50 to-blue-50"},
 {slug:"credit-card",title:"Credit Cards",description:"Cashback, Rewards & More",icon_url:"/assets/credit-card.png",emoji:"💳",accent:"from-violet-50 to-fuchsia-50"},
 {slug:"demat-account",title:"Demat Account",description:"Investing & Trading",icon_url:"/assets/demat-account.png",emoji:"📈",accent:"from-emerald-50 to-teal-50"},
 {slug:"insurance",title:"Insurance",description:"Life, Health & Vehicle",icon_url:"/assets/insurance.png",emoji:"🛡️",accent:"from-pink-50 to-rose-50"},
 {slug:"investment",title:"Investment",description:"Mutual Funds & SIP",icon_url:"/assets/investment.png",emoji:"🌱",accent:"from-amber-50 to-yellow-50"},
];
// No preloaded demo products; administrators manage all listings.
export const demoOffers:Offer[]=[];
export const demoSettings={logo_url:"",banner_url:"",headline:"Simple Banking, Brighter Futures",subheadline:"All Financial Solutions in One Place",youtube_url:"",instagram_url:"",telegram_url:"",x_url:""};
