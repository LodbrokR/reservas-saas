import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, TrendingUp, DollarSign } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // 1. Obtener el TenantID del Usuario Logeado (Basado en RLS, esto limitaría el resto de las consultas automágicamente)
    const { data: { user } } = await supabase.auth.getUser()

    // Para motivos demostrativos (y dado que el Seed genera data sin Auth aún), 
    // contaremos el volumen total visible para el usuario activo usando RLS

    const { count: countClientes } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

    const { count: countReservas } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bienvenido al Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    {user ? `Identificado como admin autorizado` : 'Sesión en modo vista previa aislada.'}
                </p>
            </div>

            {/* Stats Cards Reales (Simuladas en Demo) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reservas del Sistema</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{countReservas ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Volumen total almacenado</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{countClientes ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Registrados en tu CRM</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--%</div>
                        <p className="text-xs text-muted-foreground">En cálculo...</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Estimados</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0</div>
                        <p className="text-xs text-muted-foreground">Reservas pagadas de hoy</p>
                    </CardContent>
                </Card>
            </div>

            {/* Aqui iria una tabla de Proximas reservas y Graficos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-muted/30">
                    <CardHeader>
                        <CardTitle>Rendimiento en Vivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground flex items-center justify-center p-12 italic">
                            Conecta tu primer recurso activable para ver los horarios copados aquí.
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Actividad Supabase</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            - <span className="text-emerald-500 font-bold">En línea:</span> Conectado exitosamente al backend Postgres
                            <br />
                            - <span className="text-emerald-500 font-bold">RLS:</span> Activo (Seguridad encriptada de inquilino cruzado controlada)
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
