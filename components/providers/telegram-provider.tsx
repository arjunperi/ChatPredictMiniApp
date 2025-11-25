'use client';

import { ReactNode, useEffect } from 'react';

export function TelegramProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize Telegram WebApp - run after hydration
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set theme colors after a small delay to avoid hydration issues
      setTimeout(() => {
        if (tg.themeParams.bg_color) {
          document.documentElement.style.setProperty(
            '--tg-theme-bg-color',
            tg.themeParams.bg_color
          );
        }
        if (tg.themeParams.text_color) {
          document.documentElement.style.setProperty(
            '--tg-theme-text-color',
            tg.themeParams.text_color
          );
        }
        if (tg.themeParams.link_color) {
          document.documentElement.style.setProperty(
            '--tg-theme-link-color',
            tg.themeParams.link_color
          );
        }
        if (tg.themeParams.button_text_color) {
          document.documentElement.style.setProperty(
            '--tg-theme-button-text-color',
            tg.themeParams.button_text_color
          );
        }
        // Set color scheme
        if (tg.colorScheme) {
          document.documentElement.style.setProperty(
            '--tg-color-scheme',
            tg.colorScheme
          );
        }
      }, 0);
    }
  }, []);

  return <>{children}</>;
}
