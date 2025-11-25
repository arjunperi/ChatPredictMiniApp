'use client';

import { Navigation } from './navigation';
import { ToastContainer, useToast } from '@/components/ui/toast';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

