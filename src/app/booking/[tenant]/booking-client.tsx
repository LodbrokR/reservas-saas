'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Clock, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react"
import { es } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createReservation } from "./actions"
import { toast } from "sonner"

// En Next.js 15 app router, page.tsx puede ser 'use client' si usa hooks o recibir props de layout servidor
export default function BookingPageClient({
    tenantSlug,
    tenantName,
    tenantColor,
    services,
}: {
    tenantSlug: string
    tenantName: string
    tenantColor: string
    services: { id: string; name: string; description: string | null }[]
}) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedService, setSelectedService] = useState<string | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Datos del formulario cliente final
    const [customer, setCustomer] = useState({ fullName: '', email: '', phone: '' })

    // Horas inventadas para el día seleccionado
    const horasDisponibles = ["10:00", "11:30", "15:00", "16:30", "18:00"]

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!date || !selectedService || !selectedTime) return

        setLoading(true)
        const res = await createReservation(tenantSlug, selectedService, date, selectedTime, customer)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            setIsSuccess(true)
            toast.success("¡Reserva confirmada con éxito!")
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4 sm:px-6">

            {/* Header Corporativo del Tenant */}
            <div className="w-full max-w-4xl mb-8 text-center space-y-4">
                <div
                    className="mx-auto h-20 w-20 rounded-full flex items-center justify-center border-2 text-white"
                    style={{ backgroundColor: tenantColor }}
                >
                    <span className="text-2xl font-bold">{tenantName.charAt(0).toUpperCase()}</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">{tenantName}</h1>
            </div>

            {/* Booking Widget Principal */}
            <Card className="w-full max-w-4xl shadow-xl">
                <CardHeader className="border-b bg-muted/20">
                    <CardTitle>Haz tu Reserva</CardTitle>
                    <CardDescription>Paso 1: Selecciona el servicio y la fecha</CardDescription>
                </CardHeader>

                <CardContent className="p-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

                    {/* Col 1: Selección de Servicio */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" /> ¿Qué necesitas?
                        </h3>
                        <div className="grid gap-2">
                            {services.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic text-center py-4">No hay servicios configurados aún.</p>
                            ) : (
                                services.map((servicio) => (
                                    <button
                                        key={servicio.id}
                                        onClick={() => setSelectedService(servicio.name)}
                                        className={`flex justify-between items-center p-3 text-left border rounded-lg transition-all text-sm
                    ${selectedService === servicio.name ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'hover:border-primary/50 hover:bg-muted/50'}
                  `}
                                    >
                                        <span className="font-medium">{servicio.name}</span>
                                        <span className="text-muted-foreground text-xs">{servicio.description || '30 min'}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Col 2: Calendario */}
                    <div className="space-y-4 lg:border-l lg:pl-8">
                        <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-primary" /> Fecha de Preferencia
                        </h3>
                        <div className="flex justify-center border rounded-md p-2 bg-card">
                            <Calendar
                                locale={es}
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md"
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </div>
                    </div>

                    {/* Col 3: Horas */}
                    <div className="space-y-4 lg:border-l lg:pl-8">
                        <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" /> Bloques Disponibles
                        </h3>

                        {date ? (
                            <div className="grid grid-cols-2 gap-2">
                                {horasDisponibles.map((hora) => (
                                    <button
                                        key={hora}
                                        onClick={() => setSelectedTime(hora)}
                                        className={`py-2 text-sm rounded-md border text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                      ${selectedTime === hora ? 'bg-primary text-primary-foreground border-transparent font-medium' : 'hover:border-primary/50 hover:bg-muted'}
                    `}
                                    >
                                        {hora}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-6 border border-dashed rounded-md text-sm text-muted-foreground">
                                Selecciona un día en el calendario para ver las horas disponibles.
                            </div>
                        )}
                    </div>

                </CardContent>

                {isSuccess ? (
                    <div className="p-12 bg-green-500/10 border-t flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="h-16 w-16 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-green-700 dark:text-green-500">¡Reserva Confirmada!</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                Te hemos agendado el <strong>{date?.toLocaleDateString('es-CL')}</strong> a las <strong>{selectedTime} hrs</strong>.
                                Te esperamos en {tenantName}.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                            Hacer nueva reserva
                        </Button>
                    </div>
                ) : (
                    selectedService && date && selectedTime && (
                        <form onSubmit={handleBooking} className="p-6 bg-muted/30 border-t space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-sm pb-4 border-b">
                                ✅ Resumen: <strong>{selectedService}</strong> el <strong>{date.toLocaleDateString('es-CL')}</strong> a las <strong>{selectedTime} hrs</strong>.
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre y Apellido</Label>
                                    <Input id="name" required value={customer.fullName} onChange={e => setCustomer({ ...customer, fullName: e.target.value })} placeholder="Ej. Juan Pérez" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input id="email" type="email" required value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} placeholder="correo@ejemplo.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
                                    <Input id="phone" type="tel" required value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} placeholder="+56 9 1234 5678" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
                                    {loading ? "Procesando en BD..." : "Confirmar Reserva"}
                                </Button>
                            </div>
                        </form>
                    )
                )}
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Impulsado por RegistraPro SaaS</p>
            </div>
        </div>
    )
}
