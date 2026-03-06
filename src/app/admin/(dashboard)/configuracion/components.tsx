'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, PlusCircle, Pencil, Settings2 } from 'lucide-react'
import { addResource, deleteResource, updateTenantInfo } from './actions'
import { toast } from 'sonner'

type Resource = { id: string; name: string; description: string | null }
type Tenant = { name: string; slug: string; ui_primary_color: string | null }

export function TenantInfoForm({ tenant }: { tenant: Tenant }) {
    const [isPending, startTransition] = useTransition()

    async function handleUpdate(formData: FormData) {
        startTransition(async () => {
            const res = await updateTenantInfo(formData)
            if (res.error) toast.error(res.error)
            else toast.success('¡Datos del negocio actualizados!')
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Pencil className="w-4 h-4" /> Datos del Negocio</CardTitle>
                <CardDescription>Edita el nombre y color principal que verán tus clientes al reservar.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Negocio</Label>
                        <Input id="name" name="name" defaultValue={tenant.name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ui_primary_color">Color Principal (HEX)</Label>
                        <div className="flex gap-3 items-center">
                            <input type="color" name="ui_primary_color" defaultValue={tenant.ui_primary_color || '#000000'} className="h-10 w-12 rounded border cursor-pointer" />
                            <Input name="ui_primary_color_text" placeholder="#000000" defaultValue={tenant.ui_primary_color || '#000000'} className="flex-1" />
                        </div>
                    </div>
                    <div className="space-y-1 p-3 bg-muted/40 rounded-md">
                        <Label className="text-xs text-muted-foreground">URL Pública de Reservas</Label>
                        <p className="text-sm font-mono font-bold">/booking/{tenant.slug}</p>
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export function ResourcesManager({ resources }: { resources: Resource[] }) {
    const [isPending, startTransition] = useTransition()
    const [localResources, setLocalResources] = useState(resources)

    async function handleAdd(formData: FormData) {
        startTransition(async () => {
            const res = await addResource(formData)
            if (res.error) toast.error(res.error)
            else {
                toast.success('Servicio agregado.')
                // Reset the form
                const form = document.getElementById('add-resource-form') as HTMLFormElement
                form?.reset()
            }
        })
    }

    async function handleDelete(id: string) {
        startTransition(async () => {
            const res = await deleteResource(id)
            if (res.error) toast.error(res.error)
            else {
                toast.success('Servicio eliminado.')
                setLocalResources(prev => prev.filter(r => r.id !== id))
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> Servicios / Recursos</CardTitle>
                <CardDescription>Estos son los servicios que tus clientes podrán reservar en tu página pública.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Lista actual */}
                <div className="space-y-2">
                    {localResources.length === 0 && (
                        <p className="text-sm text-muted-foreground italic text-center py-4">No tienes servicios aún. Agrega uno abajo.</p>
                    )}
                    {localResources.map(r => (
                        <div key={r.id} className="flex items-center justify-between gap-3 border rounded-md px-4 py-3 hover:bg-muted/30 transition-colors">
                            <div>
                                <p className="font-medium text-sm">{r.name}</p>
                                {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(r.id)}
                                disabled={isPending}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Formulario para agregar */}
                <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-3">Agregar Nuevo Servicio</p>
                    <form id="add-resource-form" action={handleAdd} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="res-name" className="text-xs">Nombre del Servicio</Label>
                                <Input id="res-name" name="name" placeholder="Ej: Consulta Médica" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="res-desc" className="text-xs">Descripción (opcional)</Label>
                                <Input id="res-desc" name="description" placeholder="Ej: Duración 30 min" />
                            </div>
                        </div>
                        <Button type="submit" variant="outline" className="gap-2" disabled={isPending}>
                            <PlusCircle className="w-4 h-4" />
                            {isPending ? 'Agregando...' : 'Agregar Servicio'}
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}
