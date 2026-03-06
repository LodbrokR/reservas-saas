'use client'

import { LogOut } from 'lucide-react'
import { logout } from '@/app/admin/login/actions'

export function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
        </button>
    )
}
