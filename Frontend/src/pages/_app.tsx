import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Inter, Manrope } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/providers'
import { RouteStateSync } from '@/components/routing/route-state-sync'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { Toaster as HotToaster } from 'react-hot-toast'
import { SITE_CONFIG } from '@/config/site'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
})

export default function Application({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='description' content={SITE_CONFIG.description} />
        <meta name='keywords' content={SITE_CONFIG.keywords} />
        <link rel='icon' href='/logo.png' />
        <link rel='shortcut icon' href='/logo.png' />
        <link rel='apple-touch-icon' href='/logo.png' />
      </Head>
      <Providers>
        <RouteStateSync />
        <div
          className={`${inter.variable} ${manrope.variable} min-h-screen bg-background text-foreground antialiased`}
        >
          <Component {...pageProps} />
        </div>
        <Toaster />
        <SonnerToaster position='bottom-right' richColors />
        <HotToaster position='bottom-right' reverseOrder={false} />
      </Providers>
    </>
  )
}

