"use client";
import {usePathname} from "next/navigation";
import HomeFooter from "@/components/HomeFooter";

// Homepage renders this footer itself; admin pages have no public footer.
// Every other public page shares the same compact brand/footer appearance.
export default function SiteFooter({settings}:{settings:any}){
 const pathname=usePathname();
 if(pathname==="/"||pathname.startsWith("/admin"))return null;
 return <HomeFooter settings={settings}/>;
}
