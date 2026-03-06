import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, MoreHorizontal } from "lucide-react"

export default function ReservasPage() {
    const reservasMock = [
        {
            id: "RES-001",
            cliente: "Juan Pérez",
            recurso: "Cancha de Tenis 1",
            fecha: "10 Oct 2026",
            hora: "18:00 - 19:30",
            estado: "Confirmada",
            pago: "Pagado",
        },
        {
            id: "RES-002",
            cliente: "María Silva",
            recurso: "Cancha de Pádel 2",
            fecha: "10 Oct 2026",
            hora: "19:00 - 20:30",
            estado: "Pendiente",
            pago: "Abono",
        },
        {
            id: "RES-003",
            cliente: "Carlos Mena",
            recurso: "Cancha de Tenis 1",
            fecha: "11 Oct 2026",
            hora: "09:00 - 10:30",
            estado: "Cancelada",
            pago: "Reembolsado",
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestor de Reservas</h1>
                    <p className="text-muted-foreground mt-1">
                        Administra los bloques de tiempo y reservas de tus recursos.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Calendario lateral */}
                <Card className="md:col-span-4 lg:col-span-3 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" /> Calendario
                        </CardTitle>
                        <CardDescription>
                            Filtra por fecha específica
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        {/* Aquí iría el componente Calendar de Shadcn */}
                        <div className="w-full h-64 border rounded-md bg-muted/20 flex items-center justify-center text-muted-foreground text-sm">
                            [Componente Calendario Interactivo]
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Reservas de la Fecha Seleccionada */}
                <div className="md:col-span-8 lg:col-span-9 space-y-4">
                    <h2 className="text-xl font-semibold tracking-tight">Reservas del Día (10 Oct 2026)</h2>

                    <div className="space-y-3">
                        {reservasMock.map((reserva) => (
                            <Card key={reserva.id} className="overflow-hidden">
                                <div className={`h-1.5 w-full ${reserva.estado === 'Confirmada' ? 'bg-green-500' : reserva.estado === 'Cancelada' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                <CardContent className="p-4 sm:p-6 sm:flex sm:items-center sm:justify-between">

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{reserva.cliente}</h3>
                                            <Badge variant="outline" className="text-xs">{reserva.id}</Badge>
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {reserva.recurso}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{reserva.hora}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
                                        <div className="flex gap-2">
                                            <Badge variant={
                                                reserva.estado === 'Confirmada' ? 'default' :
                                                    reserva.estado === 'Cancelada' ? 'destructive' : 'secondary'
                                            }>
                                                {reserva.estado}
                                            </Badge>
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800">
                                                {reserva.pago}
                                            </Badge>
                                        </div>
                                        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                                            Ver detalles <MoreHorizontal className="w-3 h-3" />
                                        </button>
                                    </div>

                                </CardContent>
                            </Card>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    )
}
