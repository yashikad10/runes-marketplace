"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "bitcoin-wallet-adapter";
import { Provider } from "react-redux";
import { store } from "@/stores";
import Header from "@/components/Layout/Header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={store}>
      <WalletProvider >
      <html lang="en">
        <body className={inter.className}>
        <Header />
          {children}
        </body>
      </html>
    </WalletProvider>
    </Provider>
  );
}
