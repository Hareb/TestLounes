"use client"

import { Calendar, momentLocalizer, Event } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/fr'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../../app/dashboard/planning/calendar-styles.css'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/i18n/i18n-context'

// Configuration de moment en français
moment.locale('fr')
const localizer = momentLocalizer(moment)

interface Lesson {
  id: string
  type: string
  status: string
  startTime: string
  endTime: string
  duration: number
  isGroupLesson?: boolean
  students?: Array<{
    studentId: string
    attended: boolean
    student: {
      id: string
      user: {
        firstName: string
        lastName: string
      }
    }
  }>
  instructor?: {
    user: {
      firstName: string
      lastName: string
    }
  }
  vehicle?: {
    brand: string
    model: string
  }
}

interface MonthViewProps {
  lessons: Lesson[]
  onSelectLesson: (lesson: Lesson) => void
  onSelectSlot: (start: Date, end: Date) => void
}

export function MonthView({ lessons, onSelectLesson, onSelectSlot }: MonthViewProps) {
  const { t } = useTranslation()

  // Convertir les leçons en événements pour react-big-calendar
  const events: Event[] = lessons.map((lesson) => {
    const students = lesson.students || []
    const studentCount = students.length

    let title = ''
    if (studentCount > 1) {
      title = `👥 Groupe (${studentCount})`
    } else if (studentCount === 1) {
      title = `${students[0].student.user.firstName} ${students[0].student.user.lastName}`
    } else {
      title = 'Leçon sans élève'
    }

    return {
      id: lesson.id,
      title,
      start: new Date(lesson.startTime),
      end: new Date(lesson.endTime),
      resource: lesson, // Stocker la leçon complète dans resource
    }
  })

  // Gérer la sélection d'un événement
  const handleSelectEvent = (event: Event) => {
    if (event.resource) {
      onSelectLesson(event.resource as Lesson)
    }
  }

  // Gérer la sélection d'un créneau vide
  const handleSelectSlot = (slotInfo: any) => {
    onSelectSlot(slotInfo.start, slotInfo.end)
  }

  // Personnaliser l'apparence des événements
  const eventStyleGetter = (event: Event) => {
    const lesson = event.resource as Lesson
    let backgroundColor = '#3174ad'

    // Couleur selon le type de leçon
    switch (lesson.type) {
      case 'CODE':
        backgroundColor = '#6366f1' // Indigo
        break
      case 'DRIVE':
        backgroundColor = '#10b981' // Green
        break
      case 'EXAM_PREPARATION':
        backgroundColor = '#f59e0b' // Amber
        break
      case 'EVALUATION':
        backgroundColor = '#8b5cf6' // Purple
        break
    }

    // Opacité selon le statut
    if (lesson.status === 'CANCELLED' || lesson.status === 'NO_SHOW') {
      backgroundColor = '#9ca3af' // Gray
    } else if (lesson.status === 'COMPLETED') {
      backgroundColor = '#059669' // Darker green
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: lesson.status === 'CANCELLED' ? 0.6 : 1,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    }
  }

  // Composant personnalisé pour afficher les événements
  const EventComponent = ({ event }: { event: Event }) => {
    const lesson = event.resource as Lesson
    const startTime = moment(event.start).format('HH:mm')
    const students = lesson.students || []
    const isGroup = students.length > 1

    return (
      <div className="text-xs">
        <div className="font-semibold truncate flex items-center gap-1">
          {isGroup && <span>👥</span>}
          {event.title}
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span>{startTime}</span>
          {lesson.instructor && (
            <span className="truncate">
              • {lesson.instructor.user.firstName} {lesson.instructor.user.lastName.charAt(0)}.
            </span>
          )}
        </div>
      </div>
    )
  }

  // Messages personnalisés en français
  const messages = {
    today: "Aujourd'hui",
    previous: 'Précédent',
    next: 'Suivant',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Leçon',
    showMore: (count: number) => `+ ${count} leçon(s)`,
  }

  return (
    <div className="h-[700px] bg-white p-4 rounded-lg shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
        messages={messages}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
        step={30}
        timeslots={2}
      />
    </div>
  )
}
