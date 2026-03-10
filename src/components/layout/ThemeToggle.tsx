"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl transition-all duration-300 hover:bg-muted active:scale-95">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className="rounded-lg flex items-center gap-2 cursor-pointer transition-colors focus:bg-primary/10 focus:text-primary"
        >
          <Sun className="h-4 w-4" />
          <span className="font-medium">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className="rounded-lg flex items-center gap-2 cursor-pointer transition-colors focus:bg-primary/10 focus:text-primary"
        >
          <Moon className="h-4 w-4" />
          <span className="font-medium">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className="rounded-lg flex items-center gap-2 cursor-pointer transition-colors focus:bg-primary/10 focus:text-primary"
        >
          <Monitor className="h-4 w-4" />
          <span className="font-medium">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
