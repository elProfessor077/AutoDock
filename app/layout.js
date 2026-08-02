import './globals.css';

export const metadata = {
  title: '🐳 Dockeryze — Instant Docker & Compose blueprints',
  description: 'Upload your project archive. Dockeryze reads manifests, retrieves verified RAG recipes, maps configurations with Google Gemini, and delivers optimized Docker configurations instantly.',
  keywords: 'Docker, docker-compose, DevOps, Next.js, Express, Go, Python, RAG, Gemini AI, automated containerization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
