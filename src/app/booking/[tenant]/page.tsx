import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, MapPin } from "lucide-react"

// La prop `params` permite a Next.js leer la URL dinámica, e.g. /booking/mi-peluqueria
export default async function BookingPage({
    params,
}: {
    params: Promise<{ tenant: string }>
}) {
    const { tenant } = await params

    // En una app real, aquí haríamos `supabase.from('tenants').select().eq('slug', tenant)`
    // Para ver si el negocio existe y extraer su color/logo.
    const negocioMock = {
        nombre: tenant.replace('-', ' ').toUpperCase(),
        direccion: "Av. Providencia 1234, Santiago",
        descripcion: "Reserva tu hora fácilmente en nuestro sistema automatizado.",
        servicios: ["Corte de Cabello", "Perfilado de Barba", "Masaje Capilar"]
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4 sm:px-6">

            {/* Header Corporativo del Tenant */}
            <div className="w-full max-w-3xl mb-8 text-center space-y-4">
                <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                    <span className="text-2xl font-bold text-primary">{negocioMock.nombre.charAt(0)}</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">{negocioMock.nombre}</h1>
                <p className="text-muted-foreground flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" /> {negocioMock.direccion}
                </p>
            </div>

            {/* Booking Widget Principal */}
            <Card className="w-full max-w-3xl shadow-xl">
                <CardHeader className="border-b bg-muted/20">
                    <CardTitle>Haz tu Reserva</CardTitle>
                    <CardDescription>Paso 1: Selecciona el servicio y la fecha</CardDescription>
                </CardHeader>

                <CardContent className="p-6 grid gap-8 md:grid-cols-2">

                    {/* Selección de Servicio */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" /> ¿Qué necesitas?
                        </h3>
                        <div className="grid gap-2">
                            {negocioMock.servicios.map((servicio, idx) => (
                                <button
                                    key={idx}
                                    className="flex justify-between items-center p-3 text-left border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-sm"
                                >
                                    <span className="font-medium">{servicio}</span>
                                    <span className="text-muted-foreground">30 min</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selección de Fecha y Hora */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-primary" /> Fecha de Preferencia
                        </h3>
                        <div className="w-full h-64 border rounded-md flex items-center justify-center text-muted-foreground text-sm bg-muted/10">
                            [Componente Calendario Interactivo]
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button size="lg" className="w-full sm:w-auto">
                                Continuar
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>Impulsado por RegistraPro SaaS</p>
            </div>
        </div>
    )
}
