'use client'

import { useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Provider as ReduxProvider } from "react-redux"
import type { ReactNode } from "react"
import { makeStore, type AppStore } from "@/lib/redux/store"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore())
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ReduxProvider store={store}>
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
      </ReduxProvider>
    </NextThemesProvider>
  )
}
