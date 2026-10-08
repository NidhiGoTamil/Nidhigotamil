import {redirect} from "next/navigation";
import {requireAdmin} from "@/lib/supabase";
import AdminDashboard from "@/components/AdminDashboard";
export const dynamic="force-dynamic";
export const metadata={title:"Admin Dashboard"};
export default async function Admin(){if(!await requireAdmin())redirect("/admin/login");return <AdminDashboard/>;}
