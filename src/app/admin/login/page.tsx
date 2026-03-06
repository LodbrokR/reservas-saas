'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { login } from './actions'
import { Lock, Mail } from 'lucide-react'
import { toast } from 'sonner' // Requires Shadcn Sonner (Toaster)

export default function LoginPage() {
    const [loading, setLoading] = useState(false)

    const handleLogin = async (formData: FormData) => {
        setLoading(true)
        const result = await login(formData)

        // Si la acción redirige, este código abajo no se ejecutará (Next.js intercepta redirect)
        // Si falla, retornará el objeto { error }
        if (result?.error) {
            toast.error('Error al iniciar sesión: ' + result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Acceso Intranet</CardTitle>
                    <CardDescription>
                        Ingresa tus credenciales para administrar tu negocio
                    </CardDescription>
                </CardHeader>
                <form action={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="admin@minegocio.cl"
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Verificando..." : "Iniciar Sesión"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
