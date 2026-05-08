import { Toaster } from 'sonner';

export default function AppToaster() {
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

