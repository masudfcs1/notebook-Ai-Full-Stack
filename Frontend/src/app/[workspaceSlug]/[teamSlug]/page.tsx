import { AppShell } from "@/components/layout"

interface Props {
  params: Promise<{
    workspaceSlug: string
    teamSlug: string
  }>
}

export default async function TeamSlugPage({ params }: Props) {
  const resolvedParams = await params
  return (
    <AppShell
      workspaceSlug={resolvedParams.workspaceSlug}
      teamSlug={resolvedParams.teamSlug}
    />
  )
}
