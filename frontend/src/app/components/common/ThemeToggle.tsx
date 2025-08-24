"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-[40px] h-[40px] flex items-center justify-center bg-gray-100 border-0 cursor-pointer dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-blue-600" />
        )
      ) : (
        // render a placeholder to prevent layout shift
        <div className="w-5 h-5" />
      )}
    </Button>
  );
}
