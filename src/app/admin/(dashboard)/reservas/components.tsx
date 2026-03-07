'use client'

import { useState, useTransition } from 'react'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarIcon, Clock, User, ChevronDown, ChevronUp, CheckCircle, XCircle, RotateCcw, Trash2 } from 'lucide-react'
import { updateReservationTime, updateCustomerData, updateReservationStatus, deleteReservation } from './actions'
import { toast } from 'sonner'
import 'react-day-picker/dist/style.css'

type Reserva = {
    id: string
    start_time: string
    end_time: string
    status: string
    payment_status: string
    customers: { id: string; full_name: string; email: string | null; phone: string | null } | null
    resources: { name: string } | null
}

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    canceled: 'Cancelada',
    completed: 'Completada'
}
const STATUS_COLORS: Record<string, string> = {
    pending: 'secondary',
    confirmed: 'default',
    canceled: 'destructive',
    completed: 'outline'
}

const TIEMPO_HORAS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
]

export function ReservaCard({ reserva }: { reserva: Reserva }) {
    const [expanded, setExpanded] = useState(false)
    const [editTab, setEditTab] = useState<'horario' | 'cliente'>('horario')
    const [isPending, startTransition] = useTransition()
    const [confirmDelete, setConfirmDelete] = useState(false)

    // Estado del editor de horario
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(reserva.start_time))
    const [selectedTime, setSelectedTime] = useState(
        format(new Date(reserva.start_time), 'HH:mm')
    )

    // Estado del editor del cliente
    const [clienteData, setClienteData] = useState({
        full_name: reserva.customers?.full_name || '',
        email: reserva.customers?.email || '',
        phone: reserva.customers?.phone || ''
    })

    function handleSaveHorario() {
        const formData = new FormData()
        formData.append('date', format(selectedDate, 'yyyy-MM-dd'))
        formData.append('time', selectedTime)
        formData.append('duration', '30')
        startTransition(async () => {
            const res = await updateReservationTime(reserva.id, formData)
            if (res.error) toast.error(res.error)
            else { toast.success('Horario actualizado.'); setExpanded(false) }
        })
    }

    function handleSaveCliente() {
        if (!reserva.customers?.id) return
        const formData = new FormData()
        formData.append('full_name', clienteData.full_name)
        formData.append('email', clienteData.email)
        formData.append('phone', clienteData.phone)
        startTransition(async () => {
            const res = await updateCustomerData(reserva.customers!.id, formData)
            if (res.error) toast.error(res.error)
            else { toast.success('Datos del cliente actualizados.'); setExpanded(false) }
        })
    }

    function handleStatus(status: string) {
        startTransition(async () => {
            const res = await updateReservationStatus(reserva.id, status)
            if (res.error) toast.error(res.error)
            else toast.success(`Estado cambiado a "${STATUS_LABELS[status]}".`)
        })
    }

    function handleDelete() {
        startTransition(async () => {
            const res = await deleteReservation(reserva.id)
            if (res.error) toast.error(res.error)
            else toast.success('Reserva eliminada permanentemente.')
        })
    }

    const startDate = new Date(reserva.start_time)
    const endDate = new Date(reserva.end_time)
    const isPaid = reserva.payment_status === 'paid'

    return (
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className={`h-1.5 w-full ${reserva.status === 'confirmed' ? 'bg-green-500' : reserva.status === 'canceled' ? 'bg-red-500' : reserva.status === 'completed' ? 'bg-blue-500' : 'bg-primary'}`} />
            <CardContent className="p-4">
                {/* Fila principal */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base">{reserva.customers?.full_name || 'Cliente Desconocido'}</h3>
                            <Badge variant={STATUS_COLORS[reserva.status] as any} className="capitalize text-xs">
                                {STATUS_LABELS[reserva.status] || reserva.status}
                            </Badge>
                            {isPaid && <Badge variant="outline" className="text-green-600 border-green-300 text-xs">Pagado</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {startDate.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {startDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {reserva.resources?.name && (
                                <span className="text-xs bg-muted px-2 py-0.5 rounded">{reserva.resources.name}</span>
                            )}
                        </div>
                    </div>

                    {/* Acciones rápidas de estado */}
                    <div className="flex items-center gap-2 shrink-0">
                        {reserva.status !== 'confirmed' && (
                            <button title="Confirmar" onClick={() => handleStatus('confirmed')} disabled={isPending}
                                className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                <CheckCircle className="w-4 h-4" />
                            </button>
                        )}
                        {reserva.status !== 'canceled' && (
                            <button title="Cancelar" onClick={() => handleStatus('canceled')} disabled={isPending}
                                className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                        {reserva.status !== 'pending' && (
                            <button title="Volver a Pendiente" onClick={() => handleStatus('pending')} disabled={isPending}
                                className="p-1.5 rounded text-muted-foreground hover:bg-muted transition-colors">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}

                        {/* Eliminar con confirmación en 2 pasos */}
                        {!confirmDelete ? (
                            <button
                                title="Eliminar reserva"
                                onClick={() => setConfirmDelete(true)}
                                disabled={isPending}
                                className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1 ml-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-2 py-1">
                                <span className="text-xs text-red-600 font-medium">¿Eliminar?</span>
                                <button
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="text-xs font-bold text-red-600 hover:text-red-800 px-1.5 py-0.5 rounded hover:bg-red-100 transition-colors"
                                >
                                    {isPending ? '...' : 'Sí'}
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="text-xs text-muted-foreground hover:text-foreground px-1 py-0.5"
                                >
                                    No
                                </button>
                            </div>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-xs"
                            onClick={() => setExpanded(!expanded)}
                        >
                            Editar {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </Button>
                    </div>
                </div>

                {/* Panel de edición expandible */}
                {expanded && (
                    <div className="mt-4 border-t pt-4">
                        {/* Tabs */}
                        <div className="flex gap-1 mb-4">
                            <button
                                onClick={() => setEditTab('horario')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${editTab === 'horario' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                            >
                                <Clock className="w-3.5 h-3.5" /> Horario
                            </button>
                            <button
                                onClick={() => setEditTab('cliente')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${editTab === 'cliente' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                            >
                                <User className="w-3.5 h-3.5" /> Cliente
                            </button>
                        </div>

                        {editTab === 'horario' ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Calendario */}
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Selecciona una fecha</p>
                                    <DayPicker
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(d) => d && setSelectedDate(d)}
                                        locale={es}
                                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                        className="border rounded-md p-2"
                                    />
                                </div>
                                {/* Horas */}
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Selecciona la hora</p>
                                    <div className="grid grid-cols-3 gap-1.5 max-h-[260px] overflow-y-auto pr-1">
                                        {TIEMPO_HORAS.map(h => (
                                            <button
                                                key={h}
                                                onClick={() => setSelectedTime(h)}
                                                className={`py-1.5 text-sm rounded border transition-colors ${selectedTime === h ? 'bg-primary text-primary-foreground border-transparent' : 'hover:border-primary/50 hover:bg-muted'}`}
                                            >
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Nueva hora: <strong>{format(selectedDate, 'dd/MM/yyyy')} a las {selectedTime}</strong>
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <Button onClick={handleSaveHorario} disabled={isPending} className="w-full sm:w-auto">
                                        {isPending ? 'Guardando...' : 'Guardar Nuevo Horario'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 max-w-md">
                                <div className="space-y-1.5">
                                    <Label htmlFor={`name-${reserva.id}`} className="text-xs">Nombre completo</Label>
                                    <Input id={`name-${reserva.id}`} value={clienteData.full_name}
                                        onChange={e => setClienteData(p => ({ ...p, full_name: e.target.value }))} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor={`email-${reserva.id}`} className="text-xs">Correo electrónico</Label>
                                    <Input id={`email-${reserva.id}`} type="email" value={clienteData.email}
                                        onChange={e => setClienteData(p => ({ ...p, email: e.target.value }))} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor={`phone-${reserva.id}`} className="text-xs">Teléfono</Label>
                                    <Input id={`phone-${reserva.id}`} type="tel" value={clienteData.phone}
                                        onChange={e => setClienteData(p => ({ ...p, phone: e.target.value }))} />
                                </div>
                                <Button onClick={handleSaveCliente} disabled={isPending || !reserva.customers?.id}>
                                    {isPending ? 'Guardando...' : 'Guardar Datos del Cliente'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
