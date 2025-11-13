import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flowcus - Your Neural Network Dashboard',
  description: 'Visual project management and second brain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
