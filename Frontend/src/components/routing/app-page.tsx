import Head from 'next/head'
import { AppShell } from '@/components/layout'
import type { ViewKey } from '@/types'
import { SITE_CONFIG } from '@/config/site'

interface AppPageProps {
  title?: string
  initialView?: ViewKey
  workspaceSlug?: string
  teamSlug?: string
  adminUserId?: number
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

