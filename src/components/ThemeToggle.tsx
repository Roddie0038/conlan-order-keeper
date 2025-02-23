
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative px-8 py-6 rounded-lg border-2 border-primary flex items-center gap-2 hover:bg-primary/10 transition-all"
    >
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-500" />
      <span className="ml-2 text-lg font-medium">
        {theme === 'light' ? 'Light' : 'Dark'} Mode
      </span>
    </Button>
  );
}
