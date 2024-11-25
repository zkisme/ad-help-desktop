import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"

export default function Layout() {
  return (
    <div className="w-full">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col p-4 flex-1 min-h-[100vh] h-full">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
      <Toaster />
    </div>
  );
}
