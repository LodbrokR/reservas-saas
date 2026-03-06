import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function ClientesPage() {
    const supabase = await createClient()

    // Extraemos los clientes de la BD (Si el usuario esta logeado, el RLS filtrará por su Tenant automáticamente)
    const { data: clientes, error, count } = await supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50) // Paginación inicial básica

    if (error) {
        console.error("Error trayendo clientes:", error)
    }

    // Si no hay datos (porque es BBDD nueva) ponemos una fila de muestra simulada
    const clientesReales = clientes && clientes.length > 0 ? clientes : []

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Directorio de Clientes</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona la información de contacto y el historial de tus clientes en tiempo real.
                    </p>
                </div>
                <Button className="shrink-0 gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Cliente
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Base de Datos Activa</CardTitle>
                            <CardDescription>
                                Tienes un total de {count ?? 0} clientes registrados en Postgres.
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar por nombre o correo..."
                                className="w-full pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre / Razón Social</TableHead>
                                <TableHead>Correo Electrónico</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead className="text-right">Fecha Ingreso</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clientesReales.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        Aún no hay clientes registrados en este Tenant. ¡Atrae tus primeras ventas!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clientesReales.map((cliente) => (
                                    <TableRow key={cliente.id}>
                                        <TableCell className="font-medium">{cliente.full_name}</TableCell>
                                        <TableCell>{cliente.email || '—'}</TableCell>
                                        <TableCell>{cliente.phone || '—'}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {new Date(cliente.created_at).toLocaleDateString('es-CL')}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
