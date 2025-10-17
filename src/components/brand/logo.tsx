import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export function Logo({ 
  className, 
  width = 120, 
  height = 40, 
  showText = false 
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/Prisere-logo-transparent.png"
        alt="Prisere - Deep rooted. Farsighted."
        width={width}
        height={height}
        className="object-contain"
        style={{ width: 'auto', height: 'auto', maxWidth: `${width}px`, maxHeight: `${height}px` }}
        priority
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm text-prisere-dark-gray font-body italic">
            Deep rooted. Farsighted.®
          </span>
        </div>
      )}
    </div>
  );
}