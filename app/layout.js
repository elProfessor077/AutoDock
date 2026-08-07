import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'AutoDock — Instant Docker & Compose Blueprints',
  description: 'Upload your project archive. AutoDock reads manifests, retrieves verified RAG recipes, maps configurations with Google Gemini, and delivers optimized Docker configurations instantly.',
  keywords: 'Docker, docker-compose, DevOps, Next.js, Express, Go, Python, RAG, Gemini AI, automated containerization',
  icons: {
    icon: '/AutoDock-icon.png',
    shortcut: '/AutoDock-icon.png',
    apple: '/AutoDock-icon.png',
  },
  openGraph: {
    title: 'AutoDock — AI-Powered Docker Blueprint Generator',
    description: 'Ship container-ready code in seconds. Upload your project, get production-ready Dockerfiles & docker-compose configs instantly.',
    type: 'website',
    siteName: 'AutoDock',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoDock — Instant Docker & Compose Blueprints',
    description: 'AI-powered containerization: upload your project archive and get optimized Docker blueprints in under 8 seconds.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
