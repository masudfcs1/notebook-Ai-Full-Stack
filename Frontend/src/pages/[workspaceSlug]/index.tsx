import type { GetServerSideProps } from 'next'
import { AppPage } from '@/components/routing/app-page'

interface WorkspacePageProps {
  workspaceSlug: string
}

export default function WorkspacePage({ workspaceSlug }: WorkspacePageProps) {
  return <AppPage title='Workspace' workspaceSlug={workspaceSlug} />
}

export const getServerSideProps: GetServerSideProps<WorkspacePageProps> = async ({
  params,
}) => {
  const workspaceSlug = String(params?.workspaceSlug || '').trim()

  if (!workspaceSlug) {
    return { notFound: true }
  }

  return { props: { workspaceSlug } }
}

