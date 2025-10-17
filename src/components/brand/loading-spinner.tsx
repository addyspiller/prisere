import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "maroon" | "teal" | "mustard";
}

const sizeConfig = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8"
};

const colorConfig = {
  maroon: "text-prisere-maroon",
  teal: "text-prisere-teal",
  mustard: "text-prisere-mustard"
};

export function LoadingSpinner({ 
  size = "md", 
  className,
  color = "maroon"
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeConfig[size],
        colorConfig[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}