import { ReactNode } from "react"
import Link from "next/link"
import { Calendar, Users, Settings, LayoutDashboard } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-muted/20">
            {/* Sidebar (Intranet Menu) */}
            <aside className="w-64 border-r bg-background/50 backdrop-blur-xl flex flex-col">
                <div className="h-16 flex items-center px-6 border-b font-bold text-xl tracking-tight">
                    Reservas<span className="text-primary">SaaS</span>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary font-medium transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/reservas" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Calendar className="h-5 w-5" />
                        Reservas
                    </Link>
                    <Link href="/admin/clientes" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Users className="h-5 w-5" />
                        Clientes
                    </Link>
                    <Link href="/admin/configuracion" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Settings className="h-5 w-5" />
                        Ajustes
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 border-b bg-background/50 backdrop-blur-xl flex items-center px-6 justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground">Administración del Negocio</h2>
                    <div className="flex items-center gap-4">
                        {/* Avatar Placeholder */}
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            JD
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
