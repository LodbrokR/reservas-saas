import { ReactNode } from "react"

export const metadata = {
    title: "SaaS Onboarding - Setup Mágico",
    description: "Configura tu instancia B2B de negocio en segundos",
}

export default function SetupLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {children}
        </div>
    )
}
