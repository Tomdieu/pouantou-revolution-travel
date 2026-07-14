import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// This component wrapper disables SSR to prevent hydration issues
const NoSSR = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>),
  { ssr: false }
);

export default NoSSR;
