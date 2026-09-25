import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title === 'Home' ? 'Mr.Stonk' : `${title} · Mr.Stonk`;
  }, [title]);
}
