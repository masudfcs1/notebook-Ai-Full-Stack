import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAppSelector } from '@/lib/redux/hooks'
import { resolveViewPath } from '@/config/routes'

export function RouteStateSync() {
  const router = useRouter()
  const view = useAppSelector((state) => state.app.view)
  const adminUserId = useAppSelector((state) => state.app.selectedAdminUserId)
  const workspaces = useAppSelector((state) => state.data.workspaces)
  const activeWorkspaceId = useAppSelector((state) => state.data.activeWorkspaceId)
  const activeTeamId = useAppSelector((state) => state.data.activeTeamId)
  const initialized = useRef(false)
  const previousTarget = useRef<string | null>(null)

  const targetPath = useMemo(() => {
    const workspace = workspaces.find((item) => item.id === activeWorkspaceId)
    const team = workspace?.teams.find((item) => item.id === activeTeamId)

    return resolveViewPath(view, {
      adminUserId,
      workspaceSlug: workspace?.slug,
      teamSlug: team?.slug || team?.key.toLowerCase(),
    })
  }, [activeTeamId, activeWorkspaceId, adminUserId, view, workspaces])

  useEffect(() => {
    if (!router.isReady) return

    if (!initialized.current) {
      initialized.current = true
      previousTarget.current = targetPath
      return
    }

    if (previousTarget.current === targetPath) return
    previousTarget.current = targetPath

    const currentPath = router.asPath.split(/[?#]/, 1)[0]
    if (currentPath !== targetPath) {
      void router.push(targetPath)
    }
  }, [router, targetPath])

  return null
}

