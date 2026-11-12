import { useEffect, useState } from 'react';

const DEFAULT_ROUTE = '/';

function readRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  return hash.startsWith('/') ? hash : DEFAULT_ROUTE;
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onChange = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
