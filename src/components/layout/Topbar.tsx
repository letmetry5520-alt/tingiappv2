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

export function Topbar() {
  const { data: session, status } = useSession();

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
      <Sheet>
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "shrink-0 md:hidden"
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {/* Reuse sidebar styling but inside a sheet for mobile */}
          <Sidebar className="flex md:flex w-full border-none" />
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        {/* Can put a global search bar here later */}
      </div>

      {status === "authenticated" && session?.user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({ variant: "secondary", size: "icon" }) + " rounded-full"}
          >
            <UserIcon className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                {session.user.name} <br />
                <span className="text-xs font-normal text-muted-foreground">{session.user.role}</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
