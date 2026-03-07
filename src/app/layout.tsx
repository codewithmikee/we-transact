import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "sonner"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/providers/SessionProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { cn } from "@/lib/utils";
import { ProtectedAppWrapper } from "@/features/app-shell/ProtectedAppWrapper";

export const metadata: Metadata = {
  title: {
    default: "Trans Dashboard",
    template: "%s | Trans Dashboard",
  },
  description: "Organization and payment management dashboard",
  robots: { index: false, follow: false },
}

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, fontSans.variable)}
    >
      <body className="font-sans">
        <ThemeProvider>
          <QueryProvider>
            <SessionProvider>
              <ProtectedAppWrapper>{children}</ProtectedAppWrapper>
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
