import type {Metadata} from "next";
import "./globals.css";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import WelcomePopup from "@/components/WelcomePopup";
import {getSettings} from "@/lib/data";
export const metadata:Metadata={title:{default:"NidhiGo Tamil | Financial Product Information",template:"%s | NidhiGo Tamil"},description:"Explore and compare financial product information in one place. Loan, bank account, credit card, demat account, insurance and investment offers."};
export default async function RootLayout({children}:{children:React.ReactNode}){
 const settings=await getSettings();
 return <html lang="en"><body className="min-h-screen"><Header logoUrl={settings.logo_url}/>{children}<SiteFooter settings={settings}/><WelcomePopup youtubeUrl={settings.youtube_url} telegramUrl={settings.telegram_url} logoUrl={settings.logo_url}/></body></html>;
}
