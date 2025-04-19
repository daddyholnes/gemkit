// React JSX types
import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Next.js types
declare module 'next/link';
declare module 'next/navigation' {
  export function usePathname(): string;
  export function useRouter(): any;
}

declare module 'next/font/google' {
  export function Inter(options: { subsets: string[] }): {
    className: string;
    style: React.CSSProperties;
  };
}

// Workaround for the "Cannot find namespace 'React'" error
declare namespace React {
  interface ReactNode {}
} 