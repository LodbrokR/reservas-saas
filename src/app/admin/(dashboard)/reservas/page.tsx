import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ReservaCard } from "./components"

export default async function ReservasPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    // Leer reservas reales incluyendo id del cliente para poder editar
    const { data: reservas, error } = await supabase
        .from('reservations')
        .select(`
      id,
      start_time,
      end_time,
      status,
      payment_status,
      customers ( id, full_name, email, phone ),
      resources ( name )
    `)
        .order('start_time', { ascending: true })
        .limit(50)

    if (error) {
        console.error("Error cargando reservas:", error)
    }

    const reservasReales = reservas || []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestor de Reservas</h1>
                <p className="text-muted-foreground mt-1">
                    Haz clic en <strong>Editar</strong> para cambiar la fecha, hora o datos del cliente de cualquier reserva.
                </p>
            </div>

            <div className="space-y-3">
                {reservasReales.length === 0 ? (
                    <div className="border border-dashed p-16 text-center rounded-lg text-muted-foreground bg-muted/20">
                        No hay reservas aún. El calendario está completamente libre.
                    </div>
                ) : (
                    reservasReales.map((reserva: any) => (
                        <ReservaCard key={reserva.id} reserva={reserva} />
                    ))
                )}
            </div>
        </div>
    )
}
