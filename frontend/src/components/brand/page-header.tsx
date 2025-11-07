import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  className,
  children 
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <h1 
          className="text-3xl md:text-4xl font-bold text-prisere-dark-gray tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p 
            className="text-lg text-gray-600 max-w-3xl"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}