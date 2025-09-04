"use client";

import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Try to use the theme context, fallback to local state if not available
  let themeFromContext = theme;
  let toggleFromContext = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      // Apply theme manually if context is not available
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  try {
    const context = useTheme();
    themeFromContext = context.theme;
    toggleFromContext = context.toggleTheme;
  } catch (error) {
    // Context not available, use fallback
    console.warn('ThemeContext not available, using fallback theme logic');
  }

  // Only show the theme toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Initialize theme from localStorage if context is not available
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const initialTheme = savedTheme || systemTheme;
      setTheme(initialTheme);
      
      // Apply theme if context is not available
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(initialTheme);
    }
  }, []);

  if (!mounted) {
    // Return a placeholder button with the same dimensions to prevent layout shift
    return (
      <Button
        variant="ghost"
        size="sm"
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFromContext}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={themeFromContext === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {themeFromContext === 'light' ? (
        <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      ) : (
        <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      )}
    </Button>
  );
}