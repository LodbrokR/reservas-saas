import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"

// Mock Data
const clientesMock = [
    { id: 1, nombre: "Juan Pérez", email: "juan@ejemplo.com", ultReserva: "10 Oct 2026", estado: "Frecuente" },
    { id: 2, nombre: "María Silva", email: "masilva@gmail.com", ultReserva: "Hoy", estado: "Nuevo" },
    { id: 3, nombre: "Pedro Castro", email: "pedro.c@empresa.cl", ultReserva: "02 Sep 2026", estado: "Inactivo" },
]

export default function ClientesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Directorio de Clientes</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona la información de contacto y el historial de tus clientes.
                    </p>
                </div>
                <Button className="shrink-0 gap-2">
                    <Plus className="h-4 w-4" /> Nuevo Cliente
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Base de Datos</CardTitle>
                            <CardDescription>
                                Tienes un total de 1,204 clientes registrados.
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
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
                                <TableHead>Contacto</TableHead>
                                <TableHead>Última Reserva</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clientesMock.map((cliente) => (
                                <TableRow key={cliente.id}>
                                    <TableCell className="font-medium">{cliente.nombre}</TableCell>
                                    <TableCell>{cliente.email}</TableCell>
                                    <TableCell>{cliente.ultReserva}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${cliente.estado === 'Frecuente' ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : ''}
                      ${cliente.estado === 'Nuevo' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400' : ''}
                      ${cliente.estado === 'Inactivo' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400' : ''}
                    `}>
                                            {cliente.estado}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
