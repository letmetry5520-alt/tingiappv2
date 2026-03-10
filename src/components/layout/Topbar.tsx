"use client";

import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar() {
  const { data: session, status } = useSession();

  return (
    <header className="flex h-14 lg:h-[64px] items-center gap-4 border-b bg-background/60 backdrop-blur-xl px-6 sticky top-0 z-30 transition-colors duration-300">
      <Sheet>
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "shrink-0 md:hidden border-input/50 rounded-xl"
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 border-r border-border/50">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {/* Reuse sidebar styling but inside a sheet for mobile */}
          <Sidebar className="flex md:flex w-full border-none" />
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        {/* Can put a global search bar here later */}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        {status === "authenticated" && session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({ variant: "ghost", size: "icon" }) + " rounded-xl hover:bg-muted transition-all active:scale-95"}
            >
              <UserIcon className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 mt-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="font-bold text-sm leading-none">{session.user.name}</div>
                  <div className="text-[10px] uppercase tracking-tighter font-black text-primary mt-1 opacity-70">{session.user.role}</div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="rounded-lg m-1 text-destructive focus:bg-destructive/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium text-sm">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
