import { AppShell } from "@/components/layout"

interface Props {
  params: Promise<{
    workspaceSlug: string
  }>
}

export default async function WorkspaceSlugPage({ params }: Props) {
  const resolvedParams = await params
  return <AppShell workspaceSlug={resolvedParams.workspaceSlug} />
}
