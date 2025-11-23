'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { lessonService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/lib/i18n/i18n-context'

interface Lesson {
  id: string
  type: string
  status: string
  startTime: string
  endTime: string
  duration: number
  student: {
    user: {
      firstName: string
      lastName: string
    }
  }
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

export default function PlanningPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const { toast } = useToast()
  const { t } = useTranslation()

  const fetchLessons = async () => {
    try {
      setLoading(true)
      const startDate = new Date(currentDate)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + 7)
      endDate.setHours(23, 59, 59, 999)

      const response = await lessonService.getAll({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })
      setLessons(response.data.data)
    } catch (error) {
      toast({
        title: t.messages.error,
        description: 'Failed to load planning',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLessons()
  }, [currentDate])

  const getWeekDays = () => {
    const days = []
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay() + 1) // Lundi

    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekDays = getWeekDays()

  const getLessonsForDay = (day: Date) => {
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.startTime)
      return lessonDate.toDateString() === day.toDateString()
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      CODE: { variant: 'secondary', label: t.planning.lessonTypes.code },
      DRIVE: { variant: 'default', label: t.planning.lessonTypes.drive },
      EVALUATION: { variant: 'outline', label: t.planning.lessonTypes.evaluation },
      EXAM_PREPARATION: { variant: 'warning', label: t.planning.lessonTypes.exam },
    }
    const config = variants[type] || { variant: 'outline', label: type }
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
  }

  const previousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const today = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.planning.title}</h1>
          <p className="text-gray-600">{t.planning.weekView}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.planning.add}
        </Button>
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t.planning.previousWeek}
            </Button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-lg">
                {weekDays[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
              <Button variant="outline" size="sm" onClick={today}>
                {t.planning.today}
              </Button>
            </div>
            <Button variant="outline" onClick={nextWeek}>
              {t.planning.nextWeek}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t.common.loading}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayLessons = getLessonsForDay(day)
            const isToday = day.toDateString() === new Date().toDateString()

            return (
              <Card key={index} className={isToday ? 'border-blue-500 border-2' : ''}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    <div className="text-center">
                      <div className="text-gray-600 text-xs">
                        {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </div>
                      <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : ''}`}>
                        {day.getDate()}
                      </div>
                      {isToday && (
                        <div className="text-xs text-blue-600">{t.planning.today}</div>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 min-h-[200px]">
                  {dayLessons.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">{t.planning.noLessons}</p>
                  ) : (
                    dayLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-2 bg-blue-50 border border-blue-200 rounded text-xs space-y-1 hover:bg-blue-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {new Date(lesson.startTime).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {getTypeBadge(lesson.type)}
                        </div>
                        <div className="font-medium text-gray-900">
                          {lesson.student.user.firstName} {lesson.student.user.lastName}
                        </div>
                        {lesson.instructor && (
                          <div className="text-gray-600">
                            👨‍🏫 {lesson.instructor.user.firstName} {lesson.instructor.user.lastName.charAt(0)}.
                          </div>
                        )}
                        {lesson.vehicle && (
                          <div className="text-gray-600">
                            🚗 {lesson.vehicle.brand} {lesson.vehicle.model}
                          </div>
                        )}
                        <div className="text-gray-500">
                          {lesson.duration}h
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t.planning.legend}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="default">{t.planning.lessonTypes.drive}</Badge>
              <span className="text-sm text-gray-600">Practical driving lesson</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{t.planning.lessonTypes.code}</Badge>
              <span className="text-sm text-gray-600">Theory session</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{t.planning.lessonTypes.evaluation}</Badge>
              <span className="text-sm text-gray-600">Student evaluation</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">{t.planning.lessonTypes.exam}</Badge>
              <span className="text-sm text-gray-600">Exam preparation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
