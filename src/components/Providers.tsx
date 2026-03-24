"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
 
 export function Providers({ children }: { children: React.ReactNode }) {
   return (
     <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
       <SessionProvider>
         <TooltipProvider>{children}</TooltipProvider>
         <Toaster position="top-center" richColors />
       </SessionProvider>
     </ThemeProvider>
   );
 }
