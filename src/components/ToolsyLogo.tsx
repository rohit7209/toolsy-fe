import { type SVGProps } from 'react';

export function ToolsyLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
      {...props}
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <circle cx="10.5" cy="14.5" r="1.8" fill="currentColor" />
      <circle cx="21.5" cy="14.5" r="1.8" fill="currentColor" />
      <polygon points="16,4 18,6 16,8 14,6" fill="currentColor" />
    </svg>
  );
}
