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
}

export default function HorariosClient({ rules }: { rules: Rule[] }) {
    const [isPending, startTransition] = useTransition()

    // Construir estado inicial con los 7 días
    const [schedule, setSchedule] = useState<Rule[]>(
        DAYS.map((_, dayIdx) => {
            const existing = rules.find(r => r.day_of_week === dayIdx)
            return existing || {
                day_of_week: dayIdx,
                start_time: '09:00',
                end_time: '18:00',
                is_active: WORK_DAYS_DEFAULT.includes(dayIdx)
            }
        })
    )

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

        startTransition(async () => {
            const res = await saveAvailabilityRule(formData)
            if (res.error) toast.error(res.error)
            else toast.success(`Horario del ${DAYS[dayIdx]} guardado.`)
        })
    }

    return (
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
    )
}
