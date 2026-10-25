'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pushToDataLayer, getFacebookCookies } from '@/lib/dataLayer';

function AnalyticsListenerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize/read Meta Pixel _fbp and _fbc cookies
    const fb = getFacebookCookies();

    window.dataLayer = window.dataLayer || [];
    const query = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    const fullPath = `${pathname}${query}`;

    pushToDataLayer({
      event: 'page_view',
      _fbp: fb._fbp,
      _fbc: fb._fbc,
      fbp: fb.fbp,
      fbc: fb.fbc,
      page_location: window.location.href,
      page_path: fullPath,
      page_title: document.title || 'Digiport Analytics',
    });
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsListener() {
  return (
    <Suspense fallback={null}>
      <AnalyticsListenerInner />
    </Suspense>
  );
}
