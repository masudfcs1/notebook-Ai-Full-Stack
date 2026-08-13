import { AppShell } from "@/components/layout"

interface AdminUserPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: AdminUserPageProps) {
  const resolvedParams = await params
  const userId = parseInt(resolvedParams.id, 10)

  return (
    <AppShell
      initialView="admin-user-detail"
      adminUserId={isNaN(userId) ? undefined : userId}
    />
  )
}
