
import '../styles/globals.css';
import Link from 'next/link';
import NeonLineLoader from './NeonLineLoader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Ghibli Studio Website</title>
      </head>
      <body>
        <NeonLineLoader />
        <header>
          <nav>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}