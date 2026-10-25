import { useEffect, useState } from 'react'
import {
  PhoneCall,
  Stethoscope,
  CalendarPlus,
  CalendarCheck,
  Video,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { Card, Button, Badge, Field, Select } from '../components/ui.jsx'
import { formatDate, todayISO } from '../lib/format.js'
import {
  CARE_CONNECT_REGIONS,
  EMERGENCY_GUIDANCE,
  EMERGENCY_NUMBERS,
  EMERGENCY_DISCLAIMER,
  HELPLINES_DISCLAIMER,
  VERIFIED_HELPLINES,
  TRUSTED_RESOURCES,
  SPECIALTY_FOCUS_AREAS,
  DEMO_DOCTORS,
  getDemoSlots,
} from '../lib/careConnectData.js'
import { getAppointments, bookAppointment, cancelAppointment } from '../lib/careConnectStorage.js'

const TABS = [
  { key: 'helplines', label: 'Helplines', icon: PhoneCall },
  { key: 'doctors', label: 'Find a Doctor', icon: Stethoscope },
  { key: 'book', label: 'Book Appointment', icon: CalendarPlus },
  { key: 'online', label: 'Online Consultation', icon: Video },
  { key: 'appointments', label: 'My Appointments', icon: CalendarCheck },
]

// Tap-to-call link styled like ui.jsx's Button (copied variant classes
// directly rather than nesting an <a> inside a <button>).
function TelLink({ phone, children, variant = 'primary' }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200'
  const variants = {
    primary: 'bg-ink text-cream hover:bg-ink/90 shadow-sm hover:shadow-md',
    blush: 'bg-blush-dark text-ink hover:bg-blush-deep hover:text-white shadow-sm',
  }
  return (
    <a href={`tel:${phone}`} className={`${base} ${variants[variant] || variants.primary}`}>
      <PhoneCall size={15} /> {children}
    </a>
  )
}

const ALL_REGIONS = 'All regions'

export default function CareConnect() {
  const [tab, setTab] = useState('helplines')
  // Defaults to India so Indian users aren't shown U.S./U.K. numbers by
  // default — switching here still shows the other starter regions.
  const [region, setRegion] = useState('India')
  const emergencyGroups = region === ALL_REGIONS ? EMERGENCY_NUMBERS : EMERGENCY_NUMBERS.filter((g) => g.region === region)
  const filteredHelplines = region === ALL_REGIONS ? VERIFIED_HELPLINES : VERIFIED_HELPLINES.filter((h) => h.region === region)
  const filteredResources = region === ALL_REGIONS ? TRUSTED_RESOURCES : TRUSTED_RESOURCES.filter((r) => r.region === region)

  // --- Find a Doctor: a brief, clearly-commented simulated load. There's
  // no real provider-directory backend yet; this stands in for where a
  // real fetch would go, and demonstrates the loading state that fetch
  // would need, rather than pretending one already exists.
  const [doctorsLoading, setDoctorsLoading] = useState(true)
  const [focusFilter, setFocusFilter] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDoctorsLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  const filteredDoctors = focusFilter ? DEMO_DOCTORS.filter((d) => d.focusArea === focusFilter) : DEMO_DOCTORS

  // --- Book an Appointment
  const [bookDoctorId, setBookDoctorId] = useState('')
  const [bookType, setBookType] = useState('')
  const [bookSlotId, setBookSlotId] = useState('')
  const [bookError, setBookError] = useState('')
  const [bookSuccess, setBookSuccess] = useState(null)

  const bookDoctor = DEMO_DOCTORS.find((d) => d.id === bookDoctorId) || null
  const bookSlots = bookDoctor ? getDemoSlots(bookDoctor).filter((s) => !bookType || s.type === bookType) : []

  function startBooking(doctorId) {
    setBookDoctorId(doctorId)
    setBookType('')
    setBookSlotId('')
    setBookError('')
    setBookSuccess(null)
    setTab('book')
  }

  function handleConfirmBooking() {
    if (!bookDoctor) {
      setBookError('Choose a specialist first.')
      return
    }
    if (!bookType) {
      setBookError('Choose a consultation type.')
      return
    }
    const slot = bookSlots.find((s) => s.id === bookSlotId)
    if (!slot) {
      setBookError('Choose an available time slot.')
      return
    }
    try {
      const appt = bookAppointment({
        doctorId: bookDoctor.id,
        doctorName: bookDoctor.name,
        focusArea: bookDoctor.focusArea,
        type: slot.type,
        date: slot.date,
        time: slot.time,
      })
      setBookError('')
      setBookSuccess(appt)
      refreshAppointments()
    } catch (err) {
      setBookError(err.message || 'Could not save this appointment on this device.')
    }
  }

  // --- My Appointments
  const [appointments, setAppointments] = useState([])
  const [confirmCancelId, setConfirmCancelId] = useState(null)

  function refreshAppointments() {
    setAppointments(getAppointments())
  }

  useEffect(() => {
    refreshAppointments()
  }, [])

  const today = todayISO()
  const upcoming = appointments.filter((a) => a.date >= today)
  const past = appointments.filter((a) => a.date < today)

  function handleCancel(id) {
    cancelAppointment(id)
    setConfirmCancelId(null)
    refreshAppointments()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-ink">Care Connect</h1>
        <p className="text-ink-soft">Find support, talk to a specialist, and keep track of menopause-related care in one place.</p>
      </div>

      <Card className="rounded-2xl bg-lavender/40 p-4 text-xs text-ink-soft leading-relaxed">
        Care Connect is a documentation and support hub, not a diagnostic or booking service. Nothing here is sent
        anywhere automatically — appointments you save stay on this device only. Listings marked{' '}
        <Badge tone="blush" className="align-middle">Demo profile</Badge> are fictional examples, not real providers.
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="care-connect-region" className="text-sm font-medium text-ink">
          Region
        </label>
        <Select
          id="care-connect-region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="!w-auto"
        >
          {CARE_CONNECT_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
          <option value={ALL_REGIONS}>All regions</option>
        </Select>
        <span className="text-xs text-ink-faint">Changes which emergency numbers, helplines, and resources are shown below.</span>
      </div>

      {/* Need Help Now? — always visible, not tab-gated */}
      <Card className="space-y-3 border-blush-deep/60 bg-blush/30 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-blush-deep" />
          <h2 className="font-serif text-lg text-ink">Need help now?</h2>
        </div>
        <p className="text-sm text-ink">{EMERGENCY_GUIDANCE}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {emergencyGroups.map((group) => (
            <div key={group.region} className="rounded-xl bg-white/70 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">{group.region}</p>
              <div className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <div key={item.label} className="flex flex-wrap items-center gap-2">
                    <TelLink phone={item.number} variant="blush">
                      {item.label} · {item.number}
                    </TelLink>
                    {item.note && <span className="text-xs text-ink-soft">{item.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-faint">{EMERGENCY_DISCLAIMER}</p>
      </Card>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              tab === key
                ? 'bg-lavender-dark border-lavender-deep text-ink'
                : 'bg-white border-ink-faint/30 text-ink-soft hover:border-lavender-deep'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'helplines' && (
        <div className="space-y-4">
          <p className="text-xs text-ink-faint">{HELPLINES_DISCLAIMER}</p>
          {filteredHelplines.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-ink-soft">No helplines configured for this region yet. Try "All regions" above.</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredHelplines.map((h) => (
                <Card key={h.id} className="space-y-2 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-serif text-base text-ink">{h.name}</p>
                    <Badge tone="sage">{h.region}</Badge>
                  </div>
                  <p className="text-sm text-ink-soft">{h.description}</p>
                  <p className="text-xs text-ink-faint">{h.hours}</p>
                  <p className="text-xs text-ink-faint">Source: {h.source}</p>
                  <TelLink phone={h.phone}>{h.phoneDisplay}</TelLink>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'doctors' && (
        <div className="space-y-4">
          <Field label="Filter by focus area">
            <Select value={focusFilter} onChange={(e) => setFocusFilter(e.target.value)}>
              <option value="">All focus areas</option>
              {SPECIALTY_FOCUS_AREAS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </Field>

          {doctorsLoading ? (
            <Card className="flex items-center gap-2 p-8 text-ink-soft">
              <Loader2 size={18} className="animate-spin" /> Loading specialists…
            </Card>
          ) : filteredDoctors.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-ink-soft">No specialists match this filter.</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredDoctors.map((d) => (
                <Card key={d.id} className="space-y-2 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-base text-ink">{d.name}</p>
                      <p className="text-xs text-ink-faint">{d.focusArea}</p>
                    </div>
                    <Badge tone="blush">Demo profile</Badge>
                  </div>
                  <p className="text-sm text-ink-soft">{d.bio}</p>
                  <p className="text-xs text-ink-faint">{d.location}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.consultationTypes.map((t) => (
                      <Badge key={t} tone="lavender">
                        {t === 'online' ? 'Online' : 'In-person'}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => startBooking(d.id)}>
                    <CalendarPlus size={16} /> Book
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'book' && (
        <Card className="space-y-5 p-6">
          {bookSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 size={36} className="text-sage-dark" />
              <p className="font-serif text-xl text-ink">Appointment saved</p>
              <p className="max-w-sm text-sm text-ink-soft">
                {bookSuccess.doctorName} · {formatDate(bookSuccess.date)} at {bookSuccess.time} (
                {bookSuccess.type === 'online' ? 'online' : 'in-person'}). This is saved on this device only — it is
                not a real booking request to the provider. Please call ahead to confirm.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setTab('appointments')}>View My Appointments</Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setBookSuccess(null)
                    setBookDoctorId('')
                  }}
                >
                  Book another
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Field label="Specialist">
                <Select
                  value={bookDoctorId}
                  onChange={(e) => {
                    setBookDoctorId(e.target.value)
                    setBookType('')
                    setBookSlotId('')
                    setBookError('')
                  }}
                >
                  <option value="">Select a specialist</option>
                  {DEMO_DOCTORS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.focusArea}
                    </option>
                  ))}
                </Select>
              </Field>

              {bookDoctor && (
                <Field label="Consultation type">
                  <Select
                    value={bookType}
                    onChange={(e) => {
                      setBookType(e.target.value)
                      setBookSlotId('')
                      setBookError('')
                    }}
                  >
                    <option value="">Select a type</option>
                    {bookDoctor.consultationTypes.map((t) => (
                      <option key={t} value={t}>
                        {t === 'online' ? 'Online' : 'In-person'}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              {bookDoctor && bookType && (
                <Field label="Available slots" hint="Demo availability — not live scheduling.">
                  <div className="flex flex-wrap gap-2">
                    {bookSlots.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setBookSlotId(s.id)
                          setBookError('')
                        }}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                          bookSlotId === s.id
                            ? 'bg-lavender-dark border-lavender-deep text-ink'
                            : 'bg-white border-ink-faint/30 text-ink-soft hover:border-lavender-deep'
                        }`}
                      >
                        {formatDate(s.date)} · {s.time}
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              {bookError && <p className="text-sm text-blush-deep">{bookError}</p>}

              <Button onClick={handleConfirmBooking}>Confirm appointment</Button>
            </>
          )}
        </Card>
      )}

      {tab === 'online' && (
        <div className="space-y-4">
          <Card className="rounded-2xl bg-lavender/30 p-4 text-sm text-ink-soft leading-relaxed">
            This app doesn't have a direct telehealth booking integration. Use your existing provider's patient
            portal or insurance telehealth benefit, or start from one of these trusted external resources.
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredResources.map((r) => (
              <Card key={r.id} className="space-y-2 p-5">
                <p className="font-serif text-base text-ink">{r.name}</p>
                <p className="text-sm text-ink-soft">{r.description}</p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-lavender-deep hover:underline"
                >
                  Visit site <ExternalLink size={14} />
                </a>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'appointments' && (
        <div className="space-y-5">
          {appointments.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-ink-soft">No appointments yet. Book one from Find a Doctor or Book an Appointment.</p>
            </Card>
          ) : (
            <>
              <div>
                <h2 className="mb-2 font-serif text-lg text-ink">Upcoming</h2>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-ink-soft">No upcoming appointments.</p>
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((a) => (
                      <AppointmentCard
                        key={a.id}
                        appt={a}
                        confirmCancelId={confirmCancelId}
                        setConfirmCancelId={setConfirmCancelId}
                        onCancel={handleCancel}
                      />
                    ))}
                  </div>
                )}
              </div>
              {past.length > 0 && (
                <div>
                  <h2 className="mb-2 font-serif text-lg text-ink">Past</h2>
                  <div className="space-y-3">
                    {past.map((a) => (
                      <AppointmentCard key={a.id} appt={a} past />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function AppointmentCard({ appt, past, confirmCancelId, setConfirmCancelId, onCancel }) {
  const confirming = confirmCancelId === appt.id
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="text-sm font-medium text-ink">{appt.doctorName}</p>
        <p className="text-xs text-ink-faint">{appt.focusArea}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-soft">
          {formatDate(appt.date)} · {appt.time} ·{' '}
          {appt.type === 'online' ? <Video size={12} /> : <MapPin size={12} />}
          {appt.type === 'online' ? 'Online' : 'In-person'}
        </p>
      </div>
      {!past &&
        (confirming ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-soft">Cancel this?</span>
            <Button variant="danger" onClick={() => onCancel(appt.id)}>
              Yes, cancel
            </Button>
            <Button variant="ghost" onClick={() => setConfirmCancelId(null)}>
              Keep
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setConfirmCancelId(appt.id)}>
            <Trash2 size={15} /> Cancel
          </Button>
        ))}
    </Card>
  )
}
