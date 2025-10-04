declare global {
  interface Window {
    ConcillioToast: {
      show: (opts: { title?: string; message?: string; variant?: 'success'|'warning'|'error'; duration?: number }) => HTMLElement | null;
      success: (message: string, opts?: { duration?: number }) => HTMLElement | null;
      warning: (message: string, opts?: { duration?: number }) => HTMLElement | null;
      error:   (message: string, opts?: { duration?: number }) => HTMLElement | null;
    };
  }
}
export {};