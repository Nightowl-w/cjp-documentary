'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import ClientPage from '@/components/pages/ClientPage';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold" />
      </div>
    );
  }

  return <ClientPage />;
}