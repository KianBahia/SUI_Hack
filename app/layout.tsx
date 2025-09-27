import "@mysten/dapp-kit/dist/index.css";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";
import { ObjectIdProvider } from "@/components/data/ObjectIdContext"; //this is where the PUBLIC posts will be stored

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Remove forced dark mode which set near-black background
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sui dApp Starter</title>
      </head>
      {/* Ensure light background and readable text */}
      <body className="bg-white text-gray-900 antialiased">
        <Providers>
          {/* Wrap everything in ObjectIdProvider */}
          <ObjectIdProvider>
            <Navbar />
            {children}
          </ObjectIdProvider>
        </Providers>
      </body>
    </html>
  );
}
