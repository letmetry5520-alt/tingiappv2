"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/login") {
      router.push("/login");
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Prevent flash of dashboard content before redirect
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden h-screen">
        <Topbar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
