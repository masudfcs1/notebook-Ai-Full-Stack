import type { GetServerSideProps } from 'next'
import { AppPage } from '@/components/routing/app-page'

interface AdminUserPageProps {
  adminUserId: number
}

export default function AdminUserPage({ adminUserId }: AdminUserPageProps) {
  return (
    <AppPage
      title='User details'
      initialView='admin-user-detail'
      adminUserId={adminUserId}
    />
  )
}

export const getServerSideProps: GetServerSideProps<AdminUserPageProps> = async ({
  params,
}) => {
  const adminUserId = Number(params?.id)

  if (!Number.isInteger(adminUserId) || adminUserId <= 0) {
    return { notFound: true }
  }

  return { props: { adminUserId } }
}

