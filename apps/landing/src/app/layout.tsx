import '@repo/ui/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'A simple admin dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
