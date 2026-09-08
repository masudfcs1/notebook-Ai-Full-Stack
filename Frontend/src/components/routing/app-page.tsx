import Head from 'next/head'
import { AppShell, type AppShellProps } from '@/components/layout'
import { SITE_CONFIG } from '@/config/site'

interface AppPageProps extends AppShellProps {
  title?: string
}

export function AppPage({ title, ...shellProps }: AppPageProps) {
  const pageTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.title

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name='description' content={SITE_CONFIG.description} />
      </Head>
      <AppShell {...shellProps} />
    </>
  )
}
