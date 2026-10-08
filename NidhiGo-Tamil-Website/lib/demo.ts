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
const commonDocuments=["Identity proof (as required by provider)","Address proof (if requested)","Other documents as per provider's official eligibility rules"];
const commonSteps=["Review the product eligibility and fees.","Read the provider's official conditions carefully.","Follow the application link only after verifying the details."];
const sample=(slug:string,category:CategorySlug,title:string,provider_name:string,description:string,highlight:string):Offer=>({id:`demo-${slug}`,slug,category,title,provider_name,description,logo_url:null,highlight,benefits:["Eligibility and terms vary by provider","Review fees before applying"],documents:commonDocuments,steps:commonSteps,tutorial_url:null,affiliate_url:null,is_demo:true,published:true});
export const demoOffers:Offer[]=[
 sample("personal-loan-demo","loan","Personal Loan — Demo","Sample Lender","Compare general personal loan options.","Eligibility varies"),
 sample("home-loan-demo","loan","Home Loan — Demo","Sample Lender","Explore home financing options.","See provider's terms"),
 sample("digital-savings-demo","bank-account","Digital Savings Account — Demo","Sample Bank","Explore online savings account opening.","Provider KYC required"),
 sample("current-account-demo","bank-account","Current Account — Demo","Sample Bank","Business banking account information.","Verify fees & minimum balance"),
 sample("cashback-card-demo","credit-card","Cashback Credit Card — Demo","Sample Bank","Understand cashback card features.","Rewards depend on terms"),
 sample("travel-card-demo","credit-card","Travel Credit Card — Demo","Sample Bank","Explore travel reward benefits.","Fees may apply"),
 sample("starter-demat-demo","demat-account","Starter Demat Account — Demo","Sample Broker","Learn about demat account opening.","Check brokerage charges"),
 sample("trading-demat-demo","demat-account","Trading + Demat — Demo","Sample Broker","Explore combined demat and trading facilities.","Market risks apply"),
 sample("health-cover-demo","insurance","Health Insurance — Demo","Sample Insurer","Review coverage types and exclusions.","Coverage depends on policy"),
 sample("term-cover-demo","insurance","Term Insurance — Demo","Sample Insurer","Explore life insurance options.","Underwriting applies"),
 sample("sip-investment-demo","investment","SIP Investment — Demo","Sample Platform","Learn about systematic investing.","Market risks apply"),
 sample("mutual-fund-demo","investment","Mutual Funds — Demo","Sample Platform","Understand mutual fund account options.","Returns not guaranteed")
];
export const demoSettings={logo_url:"",banner_url:"",headline:"Simple Banking, Brighter Futures",subheadline:"All Financial Solutions in One Place",youtube_url:"",instagram_url:"",telegram_url:"",x_url:""};
