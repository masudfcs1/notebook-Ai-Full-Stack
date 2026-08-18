import type { GetServerSideProps } from 'next'
import { AppPage } from '@/components/routing/app-page'

interface TeamPageProps {
  workspaceSlug: string
  teamSlug: string
}

export default function TeamPage({ workspaceSlug, teamSlug }: TeamPageProps) {
  return (
    <AppPage title='Team' workspaceSlug={workspaceSlug} teamSlug={teamSlug} />
  )
}

export const getServerSideProps: GetServerSideProps<TeamPageProps> = async ({
  params,
}) => {
  const workspaceSlug = String(params?.workspaceSlug || '').trim()
  const teamSlug = String(params?.teamSlug || '').trim()

  if (!workspaceSlug || !teamSlug) {
    return { notFound: true }
  }

  return { props: { workspaceSlug, teamSlug } }
}

