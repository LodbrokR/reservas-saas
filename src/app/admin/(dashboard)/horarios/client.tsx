'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { saveAvailabilityRule } from './actions'
import { toast } from 'sonner'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const WORK_DAYS_DEFAULT = [1, 2, 3, 4, 5] // Lunes a Viernes

type Rule = {
    day_of_week: number
    start_time: string
    end_time: string
    is_active: boolean
    resource_id?: string | null
}

type Resource = {
    id: string
    name: string
    display_name: string | null
    resource_type: string | null
}

export default function HorariosClient({ rules, resources, businessType }: { rules: Rule[]; resources: Resource[]; businessType: string }) {
    const [isPending, startTransition] = useTransition()

    // El id del recurso seleccionado (null = global)
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)

    // Obtener las reglas para el recurso actual
    const currentRules = rules.filter(r => (r.resource_id || null) === selectedResourceId)

    // Estado del formulario
    const [schedule, setSchedule] = useState<Rule[]>(
        DAYS.map((_, dayIdx) => {
            const existing = currentRules.find(r => r.day_of_week === dayIdx)
            return existing || {
                day_of_week: dayIdx,
                start_time: '09:00',
                end_time: '18:00',
                is_active: WORK_DAYS_DEFAULT.includes(dayIdx),
                resource_id: selectedResourceId
            }
        })
    )

    // Resetear el schedule cuando cambia el recurso
    const handleResourceChange = (resId: string | null) => {
        setSelectedResourceId(resId)
        const newRules = rules.filter(r => (r.resource_id || null) === resId)
        setSchedule(
            DAYS.map((_, dayIdx) => {
                const existing = newRules.find(r => r.day_of_week === dayIdx)
                return existing || {
                    day_of_week: dayIdx,
                    start_time: '09:00',
                    end_time: '18:00',
                    is_active: WORK_DAYS_DEFAULT.includes(dayIdx),
                    resource_id: resId
                }
            })
        )
    }

    function updateRule(dayIdx: number, field: keyof Rule, value: any) {
        setSchedule(prev => prev.map((r, i) => i === dayIdx ? { ...r, [field]: value } : r))
    }

    async function handleSave(dayIdx: number) {
        const rule = schedule[dayIdx]
        const formData = new FormData()
        formData.append('day_of_week', String(rule.day_of_week))
        formData.append('start_time', rule.start_time)
        formData.append('end_time', rule.end_time)
        formData.append('is_active', String(rule.is_active))
        if (selectedResourceId) formData.append('resource_id', selectedResourceId)

        startTransition(async () => {
            const res = await saveAvailabilityRule(formData)
            if (res.error) toast.error(res.error)
            else toast.success(`Horario del ${DAYS[dayIdx]} guardado.`)
        })
    }

    async function handleSaveAll() {
        startTransition(async () => {
            let hasError = false
            for (let i = 0; i < schedule.length; i++) {
                const rule = schedule[i]
                const formData = new FormData()
                formData.append('day_of_week', String(rule.day_of_week))
                formData.append('start_time', rule.start_time)
                formData.append('end_time', rule.end_time)
                formData.append('is_active', String(rule.is_active))
                if (selectedResourceId) formData.append('resource_id', selectedResourceId)

                const res = await saveAvailabilityRule(formData)
                if (res.error) {
                    toast.error(`Error en ${DAYS[i]}: ${res.error}`)
                    hasError = true
                    break
                }
            }
            if (!hasError) {
                toast.success('Horario semanal completo guardado exitosamente.')
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Selector de Recurso */}
            {resources.length > 0 && businessType !== 'general' && (
                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 rounded-lg border">
                    <Label className="self-start sm:self-center font-semibold mb-1 sm:mb-0 w-32 shrink-0">Configurando:</Label>
                    <select
                        value={selectedResourceId || 'general'}
                        onChange={(e) => handleResourceChange(e.target.value === 'general' ? null : e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="general">
                            {businessType === 'clinic' ? 'Horario de la Clínica (General)' :
                                businessType === 'restaurant' ? 'Horario del Restaurante (General)' :
                                    businessType === 'sports' ? 'Horario del Predio (General)' : 'Horario General'}
                        </option>
                        {resources.map(r => (
                            <option key={r.id} value={r.id}>
                                {r.display_name || r.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Configuración de días */}
            <div className="space-y-3">
                {schedule.map((rule, dayIdx) => (
                    <div
                        key={dayIdx}
                        className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${rule.is_active ? 'bg-card' : 'bg-muted/30 opacity-60'}`}
                    >
                        {/* Día + Switch */}
                        <div className="flex items-center gap-3 min-w-[130px]">
                            <Switch
                                id={`day-${dayIdx}`}
                                checked={rule.is_active}
                                onCheckedChange={(val) => updateRule(dayIdx, 'is_active', val)}
                            />
                            <Label htmlFor={`day-${dayIdx}`} className="font-semibold text-sm cursor-pointer">
                                {DAYS[dayIdx]}
                            </Label>
                        </div>

                        {/* Horario */}
                        <div className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground shrink-0">Desde</Label>
                                <Input
                                    type="time"
                                    value={rule.start_time}
                                    onChange={(e) => updateRule(dayIdx, 'start_time', e.target.value)}
                                    className="w-28 h-8 text-sm"
                                    disabled={!rule.is_active}
                                />
                            </div>
                            <span className="text-muted-foreground">→</span>
                            <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground shrink-0">Hasta</Label>
                                <Input
                                    type="time"
                                    value={rule.end_time}
                                    onChange={(e) => updateRule(dayIdx, 'end_time', e.target.value)}
                                    className="w-28 h-8 text-sm"
                                    disabled={!rule.is_active}
                                />
                            </div>
                        </div>

                        {/* Guardar */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSave(dayIdx)}
                            disabled={isPending}
                            className="shrink-0"
                        >
                            Guardar
                        </Button>
                    </div>
                ))}
            </div>

            {/* Botón Guardar Todos */}
            <div className="pt-4 flex justify-end border-t">
                <Button
                    onClick={handleSaveAll}
                    disabled={isPending}
                    className="w-full sm:w-auto"
                >
                    {isPending ? 'Guardando...' : 'Guardar Horario Semanal'}
                </Button>
            </div>
        </div>
    )
}
