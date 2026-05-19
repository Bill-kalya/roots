import React, { useEffect } from 'react';
import { Toaster, toast } from 'sonner';

export default function AppToaster() {
  useEffect(() => {
    // Simple bridge so screens can trigger Sonner without importing toast everywhere.
    const handler = (event) => {
      const detail = event?.detail;
      if (!detail) return;

      const { title, description, type } = detail;
      if (type === 'success') return toast.success(description ? `${title}` : `${title}`, description);
      if (type === 'error') return toast.error(description ? `${title}` : `${title}`, description);
      if (type === 'warning') return toast.warning(description ? `${title}` : `${title}`, description);

      return toast(`${title}`, { description });
    };

    window.addEventListener('sonner:toast', handler);
    return () => window.removeEventListener('sonner:toast', handler);
  }, []);

  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        style: {
          background: 'rgba(20,20,20,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
        },
      }}
    />
  );
}


