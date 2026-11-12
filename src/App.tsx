import { lazy, Suspense } from 'react';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import RgbDeviceScene from '@/components/three/RgbDeviceScene';
import ShopChat from '@/components/chat/ShopChat';
import HomePage from '@/pages/HomePage';
import { useHashRoute } from '@/hooks/useHashRoute';

const AccessoriesPage = lazy(() => import('@/pages/AccessoriesPage'));
const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'));
const OwnerPage = lazy(() => import('@/pages/OwnerPage'));

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-700 border-t-neon-blue" />
    </div>
  );
}

function renderPage(route: string) {
  switch (route) {
    case '/accessories':
      return <AccessoriesPage />;
    case '/maintenance':
      return <MaintenancePage />;
    case '/owner':
      return <OwnerPage />;
    default:
      return <HomePage />;
  }
}

function App() {
  const route = useHashRoute();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-950">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-70" aria-hidden="true">
        <RgbDeviceScene />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-ink-950/30 via-ink-950/70 to-ink-950" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader route={route} />
        <main className="flex-1">
          <Suspense fallback={<PageFallback />}>{renderPage(route)}</Suspense>
        </main>
        <SiteFooter />
      </div>

      <ShopChat />
    </div>
  );
}

export default App;
