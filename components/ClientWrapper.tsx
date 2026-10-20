'use client';

import dynamic from 'next/dynamic';

const ClientPage = dynamic(() => import('@/components/pages/ClientPage'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold" />
    </div>
  ),
});

export default function ClientWrapper() {
  return <ClientPage />;
}