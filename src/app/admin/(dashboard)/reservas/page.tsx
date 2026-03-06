import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, MoreHorizontal } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function ReservasPage() {
    const supabase = await createClient()

    // Leer reservas reales (con RLS activo) junto con la info del cliente y recurso
    const { data: reservas, error } = await supabase
        .from('reservations')
        .select(`
      id,
      start_time,
      end_time,
      status,
      payment_status,
      customers ( full_name ),
      resources ( name )
    `)
        .order('start_time', { ascending: true })
        .limit(20)

    if (error) {
        console.error("Error cargando reservas:", error)
    }

    const reservasReales = reservas || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestor de Reservas en Vivo</h1>
                    <p className="text-muted-foreground mt-1">
                        Administra los bloques de tiempo y reservas conectadas a Postgres (Supabase).
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Calendario lateral */}
                <Card className="md:col-span-4 lg:col-span-3 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" /> Calendario Base
                        </CardTitle>
                        <CardDescription>
                            (Componente en construcción)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div className="w-full h-64 border rounded-md bg-muted/20 flex flex-col items-center justify-center text-muted-foreground text-sm p-4 text-center">
                            <span>Se integrará react-day-picker próximamente.</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Reservas de la Base de Datos */}
                <div className="md:col-span-8 lg:col-span-9 space-y-4">
                    <h2 className="text-xl font-semibold tracking-tight">Reservas Entrantes</h2>

                    <div className="space-y-3">
                        {reservasReales.length === 0 ? (
                            <div className="border border-dashed p-12 text-center rounded-lg text-muted-foreground">
                                No tienes reservas agendadas aún. El calendario está totalmente libre.
                            </div>
                        ) : (
                            reservasReales.map((reserva: any) => {
                                const isPaid = reserva.payment_status === 'paid'

                                return (
                                    <Card key={reserva.id} className="overflow-hidden">
                                        <div className={`h-1.5 w-full ${reserva.status === 'confirmed' ? 'bg-green-500' : reserva.status === 'canceled' ? 'bg-red-500' : 'bg-primary'}`} />
                                        <CardContent className="p-4 sm:p-6 sm:flex sm:items-center sm:justify-between">

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-lg">{reserva.customers?.full_name || 'Cliente Desconocido'}</h3>
                                                    <Badge variant="outline" className="text-xs">{reserva.id.split('-')[0]}</Badge>
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    {reserva.resources?.name || 'Recurso Base'}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-foreground font-medium mt-2">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    <span>
                                                        {new Date(reserva.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                                        &nbsp;-&nbsp;
                                                        {new Date(reserva.end_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
                                                <div className="flex gap-2">
                                                    <Badge variant={
                                                        reserva.status === 'confirmed' ? 'default' :
                                                            reserva.status === 'canceled' ? 'destructive' : 'secondary'
                                                    }>
                                                        {reserva.status.toUpperCase()}
                                                    </Badge>
                                                    <Badge variant={isPaid ? "outline" : "secondary"} className={
                                                        isPaid
                                                            ? "text-green-600 border-green-200 bg-green-50 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800"
                                                            : ""
                                                    }>
                                                        {reserva.payment_status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                                                    Ver detalles <MoreHorizontal className="w-3 h-3" />
                                                </button>
                                            </div>

                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
