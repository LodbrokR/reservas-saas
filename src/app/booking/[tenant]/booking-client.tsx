'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Clock, MapPin, Calendar as CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"

// En Next.js 15 app router, page.tsx puede ser 'use client' si usa hooks o recibir props de layout servidor
export default function BookingPageClient({
    tenantSlug,
}: {
    tenantSlug: string
}) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedService, setSelectedService] = useState<string | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    // Mock data basado en el Slug para demostración
    const negocioMock = {
        nombre: tenantSlug.replace('-', ' ').toUpperCase(),
        direccion: "Av. Providencia 1234, Santiago",
        servicios: ["Corte de Cabello", "Perfilado de Barba", "Masaje Capilar"]
    }

    // Horas inventadas para el día seleccionado
    const horasDisponibles = ["10:00", "11:30", "15:00", "16:30", "18:00"]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4 sm:px-6">

            {/* Header Corporativo del Tenant */}
            <div className="w-full max-w-4xl mb-8 text-center space-y-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                    <span className="text-2xl font-bold text-primary">{negocioMock.nombre.charAt(0)}</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">{negocioMock.nombre}</h1>
                <p className="text-muted-foreground flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" /> {negocioMock.direccion}
                </p>
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
                            {negocioMock.servicios.map((servicio, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedService(servicio)}
                                    className={`flex justify-between items-center p-3 text-left border rounded-lg transition-all text-sm
                    ${selectedService === servicio ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'hover:border-primary/50 hover:bg-muted/50'}
                  `}
                                >
                                    <span className="font-medium">{servicio}</span>
                                    <span className="text-muted-foreground text-xs">30 min</span>
                                </button>
                            ))}
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
                {selectedService && date && selectedTime && (
                    <div className="p-6 bg-muted/30 border-t flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-sm">
                            Has seleccionado <strong>{selectedService}</strong> el <strong>{date.toLocaleDateString('es-CL')}</strong> a las <strong>{selectedTime} hrs</strong>.
                        </div>
                        <Button size="lg" className="w-full sm:w-auto">
                            Confirmar Reserva
                        </Button>
                    </div>
                )}
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Impulsado por RegistraPro SaaS</p>
            </div>
        </div>
    )
}
