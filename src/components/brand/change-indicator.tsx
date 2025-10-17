import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, RefreshCw, Plus, Minus } from "lucide-react";

type ChangeType = "increased" | "decreased" | "modified" | "added" | "removed";

interface ChangeIndicatorProps {
  type: ChangeType;
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const changeConfig = {
  increased: {
    icon: ArrowUp,
    color: "text-prisere-teal",
    bgColor: "bg-prisere-teal/10",
    text: "Increased"
  },
  decreased: {
    icon: ArrowDown,
    color: "text-prisere-maroon", 
    bgColor: "bg-prisere-maroon/10",
    text: "Decreased"
  },
  modified: {
    icon: RefreshCw,
    color: "text-prisere-mustard",
    bgColor: "bg-prisere-mustard/10", 
    text: "Modified"
  },
  added: {
    icon: Plus,
    color: "text-prisere-teal",
    bgColor: "bg-prisere-teal/10",
    text: "Added"
  },
  removed: {
    icon: Minus,
    color: "text-prisere-maroon",
    bgColor: "bg-prisere-maroon/10",
    text: "Removed"
  }
};

const sizeConfig = {
  sm: { icon: "h-3 w-3", container: "p-1", text: "text-xs" },
  md: { icon: "h-4 w-4", container: "p-1.5", text: "text-sm" },
  lg: { icon: "h-5 w-5", container: "p-2", text: "text-base" }
};

export function ChangeIndicator({ 
  type, 
  className, 
  showText = false, 
  size = "md" 
}: ChangeIndicatorProps) {
  const config = changeConfig[type];
  const sizeStyle = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-2",
      className
    )}>
      <div className={cn(
        "rounded-full flex items-center justify-center",
        config.bgColor,
        sizeStyle.container
      )}>
        <Icon className={cn(config.color, sizeStyle.icon)} />
      </div>
      {showText && (
        <span className={cn(
          "font-medium",
          config.color,
          sizeStyle.text
        )}>
          {config.text}
        </span>
      )}
    </div>
  );
}