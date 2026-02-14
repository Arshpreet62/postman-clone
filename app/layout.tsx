import type { Metadata } from "next";
import { ContextProvider } from "./components/Layout/context/ContextProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Postman Clone - API Testing Tool",
  description: "A lightweight, modern API testing tool built for speed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}
