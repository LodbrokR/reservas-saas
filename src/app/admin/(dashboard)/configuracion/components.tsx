'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, PlusCircle, Pencil, Settings2, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react'
import { addResource, deleteResource, updateTenantInfo, updateWhatsApp, updateBookingPolicy } from './actions'
import { toast } from 'sonner'

type Resource = { id: string; name: string; display_name: string | null; description: string | null; capacity: number | null; resource_type: string | null }
type Tenant = { name: string; slug: string; ui_primary_color: string | null; whatsapp_number: string | null; whatsapp_api_key: string | null; allow_overlap: boolean | null; business_type: string | null }

const BUSINESS_TYPES = [
    { value: 'general', label: '🏢 General / Servicios', resourceLabel: 'Servicio' },
    { value: 'clinic', label: '🏥 Clínica / Salud', resourceLabel: 'Doctor/a' },
    { value: 'restaurant', label: '🍽ï¸ Restaurante / Café', resourceLabel: 'Mesa' },
    { value: 'sports', label: '⚽ Canchas / Deportes', resourceLabel: 'Cancha' },
]

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
                <CardDescription>Edita el nombre, tipo y color principal que verán tus clientes al reservar.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Negocio</Label>
                        <Input id="name" name="name" defaultValue={tenant.name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="business_type">Tipo de Negocio</Label>
                        <select
                            id="business_type"
                            name="business_type"
                            defaultValue={tenant.business_type || 'general'}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {BUSINESS_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground">Determina cómo se ve la página de reservas para tus clientes.</p>
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

export function ResourcesManager({ resources, businessType }: { resources: Resource[]; businessType: string | null }) {
    const btype = businessType || 'general'
    const typeInfo = BUSINESS_TYPES.find(t => t.value === btype) || BUSINESS_TYPES[0]
    const [isPending, startTransition] = useTransition()
    const [localResources, setLocalResources] = useState(resources)

    async function handleAdd(formData: FormData) {
        // Inject resource_type según el rubro
        const rt = btype === 'clinic' ? 'doctor' : btype === 'restaurant' ? 'table' : btype === 'sports' ? 'court' : 'generic'
        formData.set('resource_type', rt)
        startTransition(async () => {
            const res = await addResource(formData)
            if (res.error) toast.error(res.error)
            else {
                toast.success(`${typeInfo.resourceLabel} agregado.`)
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
                toast.success(`${typeInfo.resourceLabel} eliminado.`)
                setLocalResources(prev => prev.filter(r => r.id !== id))
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> {typeInfo.resourceLabel}s / Recursos</CardTitle>
                <CardDescription>
                    {btype === 'clinic' && 'Agrega los profesionales de salud. Los clientes elegirán con quién atenderse.'}
                    {btype === 'restaurant' && 'Define tus mesas. Los clientes verán cuáles están disponibles.'}
                    {btype === 'sports' && 'Agrega tus canchas. Cada una tendrá horarios independientes.'}
                    {btype === 'general' && 'Estos son los servicios que tus clientes podrán reservar.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Lista actual */}
                <div className="space-y-2">
                    {localResources.length === 0 && (
                        <p className="text-sm text-muted-foreground italic text-center py-4">No tienes {typeInfo.resourceLabel.toLowerCase()}s aún. Agrega uno abajo.</p>
                    )}
                    {localResources.map(r => (
                        <div key={r.id} className="flex items-center justify-between gap-3 border rounded-md px-4 py-3 hover:bg-muted/30 transition-colors">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{r.display_name || r.name}</p>
                                {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                                {btype === 'restaurant' && r.capacity && (
                                    <p className="text-xs text-muted-foreground">👥 {r.capacity} personas</p>
                                )}
                                {btype === 'sports' && r.capacity && (
                                    <p className="text-xs text-muted-foreground">👥 Capacidad: {r.capacity} personas</p>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(r.id)} disabled={isPending}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Formulario adaptativo */}
                <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-3">Agregar {typeInfo.resourceLabel}</p>
                    <form id="add-resource-form" action={handleAdd} className="space-y-3">
                        {btype === 'clinic' && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Título + Nombre <span className="text-muted-foreground">(ej: Dr. Juan Pérez)</span></Label>
                                        <Input name="display_name" placeholder="Dr. / Dra. Nombre Apellido" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Especialidad</Label>
                                        <Input name="description" placeholder="Ej: Medicina General, Traumatología" />
                                    </div>
                                </div>
                                <input type="hidden" name="name" value="doctor" />
                            </>
                        )}
                        {btype === 'restaurant' && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Nombre de la mesa</Label>
                                        <Input name="name" placeholder="Ej: Mesa Terraza, Mesa 5" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Capacidad (personas)</Label>
                                        <Input name="capacity" type="number" min="1" max="20" defaultValue="4" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Descripción / Ubicación <span className="text-muted-foreground">(opcional)</span></Label>
                                    <Input name="description" placeholder="Ej: Junto a la ventana, zona exterior" />
                                </div>
                            </>
                        )}
                        {btype === 'sports' && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Nombre de la cancha</Label>
                                        <Input name="name" placeholder="Ej: Cancha 1, Pádel A, Fútbol Norte" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Tipo / Deporte</Label>
                                        <Input name="description" placeholder="Ej: Pádel, Fútbol 7, Tenis" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Jugadores (capacidad)</Label>
                                    <Input name="capacity" type="number" min="1" max="22" defaultValue="2" />
                                </div>
                            </>
                        )}
                        {btype === 'general' && (
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
                        )}
                        <Button type="submit" variant="outline" className="gap-2" disabled={isPending}>
                            <PlusCircle className="w-4 h-4" />
                            {isPending ? 'Agregando...' : `Agregar ${typeInfo.resourceLabel}`}
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}

export function WhatsAppForm({ tenant }: { tenant: Tenant }) {
    const [isPending, startTransition] = useTransition()

    async function handleSave(formData: FormData) {
        startTransition(async () => {
            const res = await updateWhatsApp(formData)
            if (res.error) toast.error(res.error)
            else toast.success('¡Configuración de WhatsApp guardada!')
        })
    }

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" /> Notificaciones WhatsApp
                </CardTitle>
                <CardDescription>
                    Recibe un mensaje automático cada vez que un cliente agenda una reserva.
                    Usa el servicio gratuito de <strong>CallMeBot</strong>.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                {/* Instrucciones */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-md p-4 space-y-2">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">⚡ Activación en 2 pasos (solo una vez)</p>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                        <li>Agrega este número a tus contactos de WhatsApp: <strong className="text-foreground">+34 644 59 78 83</strong></li>
                        <li>
                            Envíale exactamente este mensaje:{' '}
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">I allow callmebot to send me messages</code>
                        </li>
                        <li>Recibirás tu <strong>API Key</strong> en respuesta. ¡Ya está!</li>
                    </ol>
                    <a
                        href="https://www.callmebot.com/blog/free-api-whatsapp-messages/"
                        target="_blank"
                        className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-1"
                    >
                        Ver documentación oficial <ExternalLink className="w-3 h-3" />
                    </a>
                </div>

                {/* Formulario */}
                <form action={handleSave} className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp_number">Tu número (con código de país)</Label>
                        <Input
                            id="whatsapp_number"
                            name="whatsapp_number"
                            type="tel"
                            placeholder="Ej: +56912345678"
                            defaultValue={tenant.whatsapp_number || ''}
                        />
                        <p className="text-xs text-muted-foreground">Sin espacios, con + y código de país.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp_api_key">API Key de CallMeBot</Label>
                        <Input
                            id="whatsapp_api_key"
                            name="whatsapp_api_key"
                            type="password"
                            placeholder="La recibirás por WhatsApp"
                            defaultValue={tenant.whatsapp_api_key || ''}
                        />
                        <p className="text-xs text-muted-foreground">Se guarda encriptada en tu base de datos privada.</p>
                    </div>
                    <div className="sm:col-span-2">
                        <Button type="submit" className="gap-2" disabled={isPending}>
                            <MessageCircle className="w-4 h-4" />
                            {isPending ? 'Guardando...' : 'Guardar Configuración de WhatsApp'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export function BookingPolicyForm({ tenant }: { tenant: Tenant }) {
    const [isPending, startTransition] = useTransition()

    async function handleSave(formData: FormData) {
        startTransition(async () => {
            const res = await updateBookingPolicy(formData)
            if (res.error) toast.error(res.error)
            else toast.success('Política de reservas actualizada.')
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" /> Política de Reservas
                </CardTitle>
                <CardDescription>
                    Define si se pueden hacer múltiples reservas en el mismo horario (ej: consultas paralelas vs. turno único).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="allow_overlap">¿Permite más de una reserva en el mismo horario?</Label>
                        <select
                            id="allow_overlap"
                            name="allow_overlap"
                            defaultValue={tenant.allow_overlap ? 'true' : 'false'}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="false">❌ No — Solo 1 reserva por bloque horario (recomendado para consultas médicas)</option>
                            <option value="true">✅ Sí — Múltiples reservas en el mismo horario (clases grupales, eventos)</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                            Cuando está desactivado, el sistema rechazará automáticamente reservas que choquen con una existente.
                        </p>
                    </div>
                    <Button type="submit" disabled={isPending} variant="outline">
                        {isPending ? 'Guardando...' : 'Guardar Política'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
