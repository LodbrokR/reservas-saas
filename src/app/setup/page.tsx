'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Store, PlusCircle, CheckCircle } from 'lucide-react'
import { setupTenant } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SetupWizard() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [successSlug, setSuccessSlug] = useState<string | null>(null)

    async function handleSetup(formData: FormData) {
        setIsLoading(true)
        const res = await setupTenant(formData)

        if (res.error) {
            toast.error(res.error)
            setIsLoading(false)
        } else {
            toast.success("¡Negocio registrado con éxito!")
            setSuccessSlug(res.slug!)
            setIsLoading(false)
        }
    }

    if (successSlug) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <Card className="max-w-md w-full text-center py-10">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 text-green-600 p-3 rounded-full mb-4 w-fit">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-2xl">¡Configuración Mágica Lista!</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Hemos creado tu base de datos de reservas aislada para <b>{successSlug}</b>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted p-4 rounded-md text-sm text-left">
                            <p className="font-semibold text-primary mb-2">Pasos siguientes:</p>
                            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                <li>Tu URL pública es: <code>/booking/{successSlug}</code></li>
                                <li>Ya puedes acceder a la Intranet Administrativa</li>
                                <li>Si usas WordPress, pega el Token en tu Plugin.</li>
                            </ol>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-4 justify-center">
                        <Button onClick={() => router.push('/admin')}>
                            Ir al Panel de Control
                        </Button>
                        <Button variant="outline" onClick={() => router.push(`/booking/${successSlug}`)}>
                            Ver Agendamiento B2C
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="max-w-md w-full shadow-lg border-primary/10">
                <CardHeader className="space-y-1 text-center pb-6">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2 w-fit">
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Setup Automático</CardTitle>
                    <CardDescription>
                        Reclama tu instancia y configura tu negocio en 1 minuto.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSetup} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="negocioName">Nombre de tu Negocio</Label>
                            <Input
                                id="negocioName"
                                name="negocioName"
                                placeholder="Ej: Clínica Los Andes"
                                required
                                className="h-11"
                            />
                            <p className="text-xs text-muted-foreground">
                                Este nombre se usará para generar tu Link público de reservas.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rubro">Rubro Principal</Label>
                            <Select name="rubro" required defaultValue="peluqueria">
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Selecciona un rubro..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="peluqueria">
                                        <div className="flex items-center gap-2">
                                            <span>💇‍♂️</span> Barbería / Peluquería
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="clinica">
                                        <div className="flex items-center gap-2">
                                            <span>🩺</span> Clínica / Centro Médico
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="deportes">
                                        <div className="flex items-center gap-2">
                                            <span>⚽</span> Arriendo de Canchas
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="generico">
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4" /> Centro de Servicios (Otro)
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Auto-crearemos servicios de muestra según tu rubro.
                            </p>
                        </div>

                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            {isLoading ? (
                                "Construyendo Motor..."
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Iniciar Mi Negocio
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
