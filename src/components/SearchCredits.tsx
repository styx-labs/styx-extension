import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useSearchCredits } from "@/hooks/useSearchCredits";

interface SearchCreditsProps {
  className?: string;
  variant?: "default" | "compact";
}

export function SearchCredits({
  className,
  variant = "default",
}: SearchCreditsProps) {
  const { searchCredits, loading, error, refetch } = useSearchCredits();

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-5 w-16 bg-muted rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            className={cn("text-destructive hover:text-destructive", className)}
          >
            <Search className="h-3 w-3" />
            <span className="ml-1">Error</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Failed to load credits. Click to retry.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (searchCredits === null) {
    return null;
  }

  if (variant === "compact") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 h-auto font-normal",
          className
        )}
      >
        <Search className="h-3 w-3" />
        <span>{searchCredits}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("flex items-center gap-1 text-primary", className)}
    >
      <Search className="h-4 w-4" />
      <span>{searchCredits} remaining search credits</span>
    </Button>
  );
}
