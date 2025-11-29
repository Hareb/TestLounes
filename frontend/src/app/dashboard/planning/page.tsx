'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit, Trash2, LayoutGrid, List } from 'lucide-react'
import { lessonService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/lib/i18n/i18n-context'
import { LessonDialog } from '@/components/lessons/LessonDialog'
import { MonthView } from '@/components/planning/MonthView'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
  // Legacy support (will be removed once all data migrated)
  student?: {
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
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const { toast } = useToast()
  const { t } = useTranslation()

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)

  const fetchLessons = async () => {
    try {
      setLoading(true)
      const startDate = new Date(currentDate)
      const endDate = new Date(currentDate)

      if (viewMode === 'week') {
        // Vue hebdomadaire: charger 7 jours
        startDate.setHours(0, 0, 0, 0)
        endDate.setDate(endDate.getDate() + 7)
        endDate.setHours(23, 59, 59, 999)
      } else {
        // Vue mensuelle: charger tout le mois
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0) // Dernier jour du mois
        endDate.setHours(23, 59, 59, 999)
      }

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
  }, [currentDate, viewMode])

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

  const handleCreate = () => {
    setSelectedLesson(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setDialogOpen(true)
  }

  const handleDeleteClick = (lesson: Lesson) => {
    setLessonToDelete(lesson)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!lessonToDelete) return

    try {
      await lessonService.delete(lessonToDelete.id)
      toast({
        title: 'Succès',
        description: 'Leçon supprimée avec succès',
      })
      fetchLessons()
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer la leçon',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setLessonToDelete(null)
    }
  }

  // Handler pour la sélection d'un créneau vide dans la vue mensuelle
  const handleSelectSlot = (start: Date, end: Date) => {
    // Pré-remplir le dialog avec la date/heure sélectionnée
    setSelectedLesson(undefined)
    setDialogOpen(true)
    // TODO: passer les dates au dialog si on veut pré-remplir
  }

  // Handler pour cliquer sur une leçon dans la vue mensuelle
  const handleSelectLessonFromMonth = (lesson: Lesson) => {
    handleEdit(lesson)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.planning.title}</h1>
          <p className="text-gray-600">
            {viewMode === 'week' ? t.planning.weekView : 'Vue mensuelle'}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Toggle view buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Semaine
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Mois
            </Button>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t.planning.add}
          </Button>
        </div>
      </div>

      {/* Navigation - Only for week view */}
      {viewMode === 'week' && (
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
      )}

      {/* Week View or Month View */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t.common.loading}</p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'month' ? (
        /* Month View */
        <MonthView
          lessons={lessons}
          onSelectLesson={handleSelectLessonFromMonth}
          onSelectSlot={handleSelectSlot}
        />
      ) : (
        /* Week View */
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
                    dayLessons.map((lesson) => {
                      // Determine if this is a group lesson and get student info
                      const students = lesson.students || []
                      const isGroup = students.length > 1
                      const studentCount = students.length

                      return (
                        <div
                          key={lesson.id}
                          className="p-2 bg-blue-50 border border-blue-200 rounded text-xs space-y-1 hover:bg-blue-100 transition-colors group relative"
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

                          {/* Student Display - Group or Individual */}
                          {isGroup ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900 flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  👥 {studentCount}
                                </Badge>
                                <span className="text-xs">élève{studentCount > 1 ? 's' : ''}</span>
                              </div>
                              <div className="text-xs text-gray-600 pl-1">
                                {students.slice(0, 2).map((s, idx) => (
                                  <div key={s.studentId}>
                                    • {s.student.user.firstName} {s.student.user.lastName.charAt(0)}.
                                  </div>
                                ))}
                                {studentCount > 2 && (
                                  <div className="text-gray-500">
                                    +{studentCount - 2} autre{studentCount - 2 > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : students.length === 1 ? (
                            <div className="font-medium text-gray-900">
                              {students[0].student.user.firstName} {students[0].student.user.lastName}
                            </div>
                          ) : null}

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
                          <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 bg-white hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(lesson)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 bg-white hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(lesson)
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      )
                    })
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

      {/* Create/Edit Dialog */}
      <LessonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lesson={selectedLesson}
        onSuccess={fetchLessons}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La leçon{' '}
              {lessonToDelete?.students && lessonToDelete.students.length > 1 ? (
                <>
                  de groupe avec <strong>{lessonToDelete.students.length} élèves</strong>
                </>
              ) : lessonToDelete?.students && lessonToDelete.students.length === 1 ? (
                <>
                  de{' '}
                  <strong>
                    {lessonToDelete.students[0].student.user.firstName}{' '}
                    {lessonToDelete.students[0].student.user.lastName}
                  </strong>
                </>
              ) : null}
              {' '}prévue le{' '}
              <strong>
                {lessonToDelete && new Date(lessonToDelete.startTime).toLocaleString('fr-FR')}
              </strong>
              {' '}sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
