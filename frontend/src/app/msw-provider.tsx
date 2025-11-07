"use client";

import { useEffect, useState } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const initMSW = async () => {
      if (process.env.NODE_ENV === "development") {
        try {
          const { worker } = await import("@/mocks/browser");
          await worker.start({
            onUnhandledRequest: "bypass",
            serviceWorker: {
              url: "/mockServiceWorker.js",
            },
          });
          console.log("🔥 MSW: Mock service worker started");
          
          // Add a small delay to ensure handlers are fully registered
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log("🔥 MSW: Handlers fully initialized");
        } catch (error) {
          console.warn("MSW: Failed to start service worker:", error);
          // Continue without MSW if it fails to start
        }
      }
      setMswReady(true);
    };

    initMSW();
  }, []);

  if (!mswReady) {
    return null;
  }

  return <>{children}</>;
}