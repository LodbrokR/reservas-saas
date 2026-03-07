'use client'

import { useState, useEffect } from "react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, Calendar as CalIcon, Sparkles } from "lucide-react"
import { createReservation, getBookedSlots } from "./actions"
import { toast } from "sonner"
import "react-day-picker/dist/style.css"

type Service = { id: string; name: string; display_name: string | null; description: string | null; capacity: number; resource_type: string | null }
type AvailRule = { day_of_week: number; start_time: string; end_time: string; is_active: boolean; resource_id: string | null }

const STEP_LABELS = ["Servicio", "Fecha y Hora", "Tus Datos", "Confirmación"]

// ─── Confetti ───────────────────────────────────────────────────────────────
function Confetti() {
    const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#f97316"]
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => {
                const color = colors[i % colors.length]
                const left = `${Math.random() * 100}%`
                const delay = `${Math.random() * 1.5}s`
                const size = `${6 + Math.random() * 8}px`
                const duration = `${1.8 + Math.random() * 1.5}s`
                const rotate = `${Math.random() * 720}deg`
                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            top: "-20px",
                            left,
                            width: size,
                            height: size,
                            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                            backgroundColor: color,
                            animation: `confettiFall ${duration} ${delay} ease-in forwards`,
                            transform: `rotate(${rotate})`
                        }}
                    />
                )
            })}
            <style>{`
                @keyframes confettiFall {
                    0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                    80%  { opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
        </div>
    )
}

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ current, color }: { current: number; color: string }) {
    return (
        <div className="flex items-center justify-center gap-0 mb-8">
            {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${i < current
                                ? "text-white border-transparent"
                                : i === current
                                    ? "text-white border-transparent scale-110 shadow-lg"
                                    : "bg-muted text-muted-foreground border-border"
                                }`}
                            style={i <= current ? { backgroundColor: color, borderColor: color } : {}}
                        >
                            {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className={`text-[10px] mt-1 font-medium hidden sm:block ${i === current ? "text-foreground" : "text-muted-foreground"}`}>
                            {label}
                        </span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                        <div className={`h-0.5 w-8 sm:w-14 mx-1 transition-all duration-500 ${i < current ? "" : "bg-border"}`}
                            style={i < current ? { backgroundColor: color } : {}} />
                    )}
                </div>
            ))}
        </div>
    )
}

// ─── Floating Summary ────────────────────────────────────────────────────────
function FloatingSummary({ service, date, time, color }: {
    service: string | null; date: Date | undefined; time: string | null; color: string
}) {
    if (!service && !date && !time) return null
    return (
        <div className="fixed bottom-6 right-6 z-40 max-w-xs w-full sm:w-72 rounded-2xl shadow-2xl border backdrop-blur-sm bg-background/90 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
            <div className="p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Tu reserva en progreso
                </p>
                {service && (
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-medium">{service}</span>
                    </div>
                )}
                {date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalIcon className="w-3.5 h-3.5" />
                        {format(date, "EEEE d 'de' MMMM", { locale: es })}
                    </div>
                )}
                {time && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {time} hrs
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingPageClient({
    tenantSlug, tenantName, tenantColor, businessType, services, availability,
}: {
    tenantSlug: string
    tenantName: string
    tenantColor: string
    businessType: string
    services: Service[]
    availability: AvailRule[]
}) {
    const [step, setStep] = useState(0)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [date, setDate] = useState<Date | undefined>()
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [customer, setCustomer] = useState({ fullName: "", email: "", phone: "", notes: "" })
    const [loading, setLoading] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const [bookedSlots, setBookedSlots] = useState<string[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)

    // Cargar los slots ocupados cada vez que cambia la fecha seleccionada
    useEffect(() => {
        if (!date) { setBookedSlots([]); return }
        setLoadingSlots(true)
        getBookedSlots(tenantSlug, format(date, 'yyyy-MM-dd'), selectedService?.id)
            .then(slots => setBookedSlots(slots))
            .finally(() => setLoadingSlots(false))
    }, [date, tenantSlug, selectedService?.id])

    // Reglas de horario para el recurso seleccionado (o fallback a generales)
    const resourceRules = availability.filter(r => r.resource_id === selectedService?.id)
    const rulesToUse = resourceRules.length > 0 ? resourceRules : availability.filter(r => r.resource_id === null)

    const activeDays = new Set(rulesToUse.map(r => r.day_of_week))

    function getHoras(d: Date): string[] {
        const rule = rulesToUse.find(r => r.day_of_week === d.getDay())
        if (!rule) return []
        const slots: string[] = []
        const [sh, sm] = rule.start_time.substring(0, 5).split(":").map(Number)
        const [eh, em] = rule.end_time.substring(0, 5).split(":").map(Number)
        let cur = sh * 60 + sm
        const end = eh * 60 + em
        while (cur + 30 <= end) {
            slots.push(`${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`)
            cur += 30
        }
        return slots
    }

    const horas = date ? getHoras(date) : []

    const mañana = horas.filter(h => parseInt(h) < 12)
    const tarde = horas.filter(h => parseInt(h) >= 12 && parseInt(h) < 18)
    const noche = horas.filter(h => parseInt(h) >= 18)

    async function handleConfirm() {
        if (!date || !selectedService || !selectedTime) return
        setLoading(true)
        const res = await createReservation(tenantSlug, selectedService.id, date, selectedTime, customer)
        setLoading(false)
        if (res.error) {
            toast.error(res.error)
        } else {
            setShowConfetti(true)
            setStep(3)
            setTimeout(() => setShowConfetti(false), 4000)
        }
    }

    // ── Textos según rubro ──
    const textServiceTitle = businessType === 'clinic' ? '¿Con qué especialista?' :
        businessType === 'restaurant' ? '¿En qué mesa o sector?' :
            businessType === 'sports' ? '¿Qué cancha deseas reservar?' :
                '¿Qué servicio necesitas?'

    const textServiceDesc = businessType === 'clinic' ? 'Selecciona a un profesional' :
        businessType === 'restaurant' ? 'Selecciona tu mesa preferida' :
            businessType === 'sports' ? 'Elige la cancha para continuar' :
                'Selecciona uno para comenzar'

    const textEmptyServices = businessType === 'clinic' ? 'No hay doctores configurados aún.' :
        businessType === 'restaurant' ? 'No hay mesas configuradas aún.' :
            businessType === 'sports' ? 'No hay canchas configuradas aún.' :
                'No hay servicios configurados aún.'

    // ── Step 0: Selección de Servicio / Recurso ──
    const Step0 = (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold">{textServiceTitle}</h2>
                <p className="text-muted-foreground text-sm mt-1">{textServiceDesc}</p>
            </div>
            {services.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                    {textEmptyServices}
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {services.map(s => (
                        <button
                            key={s.id}
                            onClick={() => { setSelectedService(s); setTimeout(() => setStep(1), 150) }}
                            className={`group p-5 text-left rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${selectedService?.id === s.id ? "border-[var(--tc)] shadow-lg -translate-y-0.5" : "border-border hover:border-[var(--tc)]/50"}`}
                            style={{ "--tc": tenantColor } as any}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-base leading-snug">{s.display_name || s.name}</p>
                                    {s.description && (
                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                                    )}
                                </div>
                                <div className="rounded-full p-2 flex-shrink-0 transition-colors"
                                    style={{ backgroundColor: `${tenantColor}18` }}>
                                    <Clock className="w-4 h-4" style={{ color: tenantColor }} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-muted-foreground">
                                    {businessType === 'restaurant' ? `Capacidad: ${s.capacity} presonas` :
                                        businessType === 'sports' ? `${s.capacity} jugadores` : '30 min'}
                                </span>
                                <span className="text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: tenantColor }}>
                                    Seleccionar <ChevronRight className="w-3 h-3" />
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )

    // ── Step 1: Fecha y Hora ──
    const Step1 = (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold">¿Cuándo te acomodamos?</h2>
                <p className="text-muted-foreground text-sm mt-1">Selecciona una fecha y horario disponible</p>
            </div>
            <div className="grid md:grid-cols-[auto,1fr] gap-6 items-start">
                {/* Calendario */}
                <div className="flex justify-center">
                    <div className="border rounded-2xl p-3 shadow-sm bg-card">
                        <DayPicker
                            mode="single"
                            selected={date}
                            onSelect={(d) => { setDate(d); setSelectedTime(null) }}
                            locale={es}
                            disabled={(d) =>
                                d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                (activeDays.size > 0 && !activeDays.has(d.getDay()))
                            }
                            modifiersStyles={{
                                selected: { backgroundColor: tenantColor, color: "white", borderRadius: "50%" }
                            }}
                        />
                    </div>
                </div>

                {/* Slots de hora */}
                <div className="space-y-4">
                    {!date ? (
                        <div className="h-full flex items-center justify-center border border-dashed rounded-2xl p-8 text-center text-muted-foreground text-sm">
                            👆 Selecciona un día en el calendario
                        </div>
                    ) : loadingSlots ? (
                        <div className="border rounded-2xl p-8 text-center text-muted-foreground text-sm animate-pulse">
                            Cargando disponibilidad...
                        </div>
                    ) : horas.length === 0 ? (
                        <div className="border border-dashed rounded-2xl p-8 text-center text-muted-foreground text-sm">
                            No hay disponibilidad este día.
                        </div>
                    ) : (
                        <>
                            {[["🌅 Mañana", mañana], ["☀️ Tarde", tarde], ["🌙 Noche", noche]].map(([label, slots]) =>
                                (slots as string[]).length > 0 && (
                                    <div key={label as string}>
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">{label as string}</p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                                            {(slots as string[]).map(h => {
                                                const isBooked = bookedSlots.includes(h)
                                                const isSelected = selectedTime === h
                                                return (
                                                    <button
                                                        key={h}
                                                        onClick={() => !isBooked && setSelectedTime(h)}
                                                        disabled={isBooked}
                                                        title={isBooked ? "Este horario ya está reservado" : `Reservar las ${h} hrs`}
                                                        className={`py-2 text-sm rounded-xl border font-medium transition-all duration-150 flex flex-col items-center gap-0.5
                                                            ${isBooked
                                                                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-400 cursor-not-allowed opacity-70"
                                                                : isSelected
                                                                    ? "text-white border-transparent shadow-md scale-105"
                                                                    : "hover:border-[var(--tc)]/50 hover:bg-muted"
                                                            }`}
                                                        style={isSelected && !isBooked ? { backgroundColor: tenantColor } : { "--tc": tenantColor } as any}
                                                    >
                                                        <span className={isBooked ? "line-through" : ""}>{h}</span>
                                                        {isBooked && <span className="text-[9px] font-normal leading-none">Ocupado</span>}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
            {selectedTime && date && (
                <div className="mt-6 flex justify-end">
                    <Button onClick={() => setStep(2)} className="gap-2 rounded-xl px-6" style={{ backgroundColor: tenantColor }}>
                        Continuar <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    )

    // ── Step 2: Datos del cliente ──
    const Step2 = (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-md mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold">Tus datos de contacto</h2>
                <p className="text-muted-foreground text-sm mt-1">Para confirmar y recordarte tu reserva</p>
            </div>
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="fullName">Nombre y Apellido</Label>
                    <Input id="fullName" value={customer.fullName}
                        onChange={e => setCustomer(p => ({ ...p, fullName: e.target.value }))}
                        placeholder="Ej: María González" className="rounded-xl h-11" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" value={customer.email}
                        onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
                        placeholder="maria@correo.com" className="rounded-xl h-11" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
                    <Input id="phone" type="tel" value={customer.phone}
                        onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+56 9 1234 5678" className="rounded-xl h-11" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="notes">Nota adicional <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                    <Input id="notes" value={customer.notes}
                        onChange={e => setCustomer(p => ({ ...p, notes: e.target.value }))}
                        placeholder="¿Algo que debamos saber?" className="rounded-xl h-11" />
                </div>
            </div>
            <div className="mt-6">
                <Button
                    onClick={handleConfirm}
                    disabled={loading || !customer.fullName || !customer.email || !customer.phone}
                    className="w-full h-12 rounded-xl text-base font-semibold gap-2"
                    style={{ backgroundColor: tenantColor }}
                >
                    {loading ? "Procesando..." : <>Confirmar Reserva <CheckCircle2 className="w-4 h-4" /></>}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                    Al confirmar aceptas que tus datos serán usados para gestionar tu reserva.
                </p>
            </div>
        </div>
    )

    // ── Step 3: Éxito ──
    const Step3 = (
        <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-8 space-y-6">
            <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-full blur-2xl opacity-30 scale-150" style={{ backgroundColor: tenantColor }} />
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl"
                    style={{ backgroundColor: tenantColor }}>
                    <CheckCircle2 className="w-12 h-12" />
                </div>
            </div>
            <div>
                <h2 className="text-3xl font-extrabold">¡Reserva Confirmada!</h2>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Te esperamos en <strong>{tenantName}</strong> el{" "}
                    <strong>{date ? format(date, "EEEE d 'de' MMMM", { locale: es }) : ""}</strong>{" "}
                    a las <strong>{selectedTime} hrs</strong>.
                </p>
            </div>
            <div className="inline-flex flex-col items-center gap-2 border rounded-2xl p-5 bg-card max-w-xs w-full mx-auto text-left">
                <div className="w-full space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Servicio</span><span className="font-medium">{selectedService?.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Fecha</span><span className="font-medium">{date ? format(date, "dd/MM/yyyy") : ""}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Hora</span><span className="font-medium">{selectedTime} hrs</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Nombre</span><span className="font-medium">{customer.fullName}</span></div>
                </div>
            </div>
            <Button variant="outline" className="rounded-xl" onClick={() => {
                setStep(0); setSelectedService(null); setDate(undefined); setSelectedTime(null); setCustomer({ fullName: "", email: "", phone: "", notes: "" })
            }}>
                Hacer nueva reserva
            </Button>
        </div>
    )

    const steps = [Step0, Step1, Step2, Step3]

    return (
        <>
            {showConfetti && <Confetti />}

            <FloatingSummary
                service={selectedService?.name || null}
                date={date}
                time={selectedTime}
                color={tenantColor}
            />

            <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(135deg, ${tenantColor}08 0%, transparent 60%)` }}>
                {/* Hero Header */}
                <div className="w-full py-10 text-center px-4">
                    <div
                        className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-xl ring-4 ring-white/20"
                        style={{ backgroundColor: tenantColor }}
                    >
                        {tenantName.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight">{tenantName}</h1>
                    <p className="text-muted-foreground text-sm mt-1">Reserva tu hora rápido y sin llamadas</p>
                </div>

                {/* Booking Card */}
                <div className="flex-1 px-4 pb-16 max-w-3xl mx-auto w-full">
                    <div className="bg-card border rounded-3xl shadow-xl overflow-hidden">
                        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${tenantColor}, ${tenantColor}80)` }} />
                        <div className="p-6 sm:p-8">
                            {step < 3 && <StepIndicator current={step} color={tenantColor} />}
                            {steps[step]}

                            {/* Botones nav */}
                            {step > 0 && step < 3 && (
                                <button
                                    onClick={() => setStep(s => s - 1)}
                                    className="mt-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Volver
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Impulsado por <strong>RegistraPro SaaS</strong>
                    </p>
                </div>
            </div>
        </>
    )
}
