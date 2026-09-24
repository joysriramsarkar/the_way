import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { I18nProvider } from '@/components/I18nProvider';
import { AuthProvider } from '@/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'দ্য ওয়ে (The Way) — আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন ও গণআন্দোলনের উন্মুক্ত পোর্টাল',
  description: 'আন্তর্জাতিক সমাজতান্ত্রিক চিন্তন, রাজনৈতিক অর্থনীতি, সাম্রাজ্যবাদ-বিরোধী গণসংগ্রাম ও শ্রমিক শ্রেণির মুক্তির উন্মুক্ত বহুমাত্রিক জ্ঞান-পোর্টাল।',
  icons: {
    icon: '/assets/images/favicon.svg',
    shortcut: '/favicon.svg'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var theme = localStorage.getItem('theway_theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
                var lang = localStorage.getItem('theway_lang') || 'bn';
                document.documentElement.setAttribute('lang', lang);
              } catch(e){}
            })();`
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <div className="main-wrapper">
                <Header />
                <main id="main-content" style={{ minHeight: '80vh' }}>
                  {children}
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
