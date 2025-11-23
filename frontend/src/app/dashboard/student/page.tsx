'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, BookOpen, Car, TrendingUp, Award, Package, CalendarCheck, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { HoursCounter } from '@/components/hours-counter'
import { useTranslation } from '@/lib/i18n/i18n-context'
import { examService, logbookService, bookingService } from '@/lib/api'
import Link from 'next/link'

export default function StudentDashboardPage() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [logbook, setLogbook] = useState<any>(null)
  const [nextExam, setNextExam] = useState<any>(null)
  const [nextBooking, setNextBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // TODO: Get actual student ID from auth
  const studentId = 'student-123'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch logbook for GDE progress
      try {
        const logbookRes = await logbookService.getByStudentId(studentId)
        setLogbook(logbookRes.data.data)
      } catch (error) {
        console.error('Error fetching logbook:', error)
      }

      // Fetch next exam
      try {
        const examsRes = await examService.getAll({ studentId })
        const scheduledExams = examsRes.data.data?.filter((e: any) => e.status === 'SCHEDULED') || []
        if (scheduledExams.length > 0) {
          // Sort by date and get the closest
          scheduledExams.sort((a: any, b: any) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
          setNextExam(scheduledExams[0])
        }
      } catch (error) {
        console.error('Error fetching exams:', error)
      }

      // Fetch next booking
      try {
        const bookingsRes = await bookingService.getAll()
        const upcomingBookings = bookingsRes.data.data?.filter(
          (b: any) => (b.status === 'PENDING' || b.status === 'CONFIRMED') && new Date(b.startTime) > new Date()
        ) || []
        if (upcomingBookings.length > 0) {
          upcomingBookings.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          setNextBooking(upcomingBookings[0])
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: t.bookings.book,
      description: 'Réserver un créneau',
      icon: CalendarCheck,
      href: '/dashboard/bookings',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: t.packages.purchase,
      description: 'Acheter un forfait',
      icon: Package,
      href: '/dashboard/packages',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: t.logbook.title,
      description: 'Voir mon livret',
      icon: BookOpen,
      href: '/dashboard/logbook',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      title: t.exams.title,
      description: 'Mes examens',
      icon: Award,
      href: '/dashboard/exams',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour {user?.firstName} ! 👋
        </h1>
        <p className="text-gray-600 mt-1">Votre parcours de formation</p>
      </div>

      {/* Hours Counter */}
      <HoursCounter studentId={studentId} />

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Next Booking */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prochaine Réservation</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {nextBooking ? (
              <div>
                <div className="text-lg font-bold">
                  {new Date(nextBooking.startTime).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(nextBooking.startTime).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' - '}
                  {nextBooking.type}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {nextBooking.status === 'PENDING' ? 'En attente' : 'Confirmée'}
                </Badge>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">Aucune réservation</p>
                <Link href="/dashboard/bookings">
                  <Button size="sm" variant="outline" className="mt-2">
                    Réserver
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Exam */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prochain Examen</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <Award className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            {nextExam ? (
              <div>
                <div className="text-lg font-bold">
                  {nextExam.type === 'CODE' ? 'Code' : 'Conduite'}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(nextExam.examDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {nextExam.examCenter && (
                  <p className="text-xs text-gray-400 mt-1">{nextExam.examCenter}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucun examen planifié</p>
            )}
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression Globale</CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {logbook ? (
              <div>
                <div className="text-2xl font-bold">{Math.round(logbook.overallProgress)}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${logbook.overallProgress}%` }}
                  />
                </div>
                {logbook.isComplete && (
                  <Badge className="mt-2 bg-green-600">
                    Formation complétée !
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chargement...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Actions Rapides</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-lg ${action.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* GDE Driving Progress */}
      {logbook && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Progression GDE - Compétences de Conduite</CardTitle>
              <Link href="/dashboard/logbook">
                <Button variant="outline" size="sm">
                  Voir détails
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: 'Compétence 1: Maîtrise du véhicule',
                  validated: logbook.comp1_validated,
                  fields: ['comp1_skill1', 'comp1_skill2', 'comp1_skill3', 'comp1_skill4', 'comp1_skill5', 'comp1_skill6', 'comp1_skill7']
                },
                {
                  name: 'Compétence 2: Circulation routière',
                  validated: logbook.comp2_validated,
                  fields: ['comp2_skill1', 'comp2_skill2', 'comp2_skill3', 'comp2_skill4', 'comp2_skill5', 'comp2_skill6', 'comp2_skill7']
                },
                {
                  name: 'Compétence 3: Conditions difficiles',
                  validated: logbook.comp3_validated,
                  fields: ['comp3_skill1', 'comp3_skill2', 'comp3_skill3', 'comp3_skill4', 'comp3_skill5', 'comp3_skill6', 'comp3_skill7']
                },
                {
                  name: 'Compétence 4: Conduite autonome',
                  validated: logbook.comp4_validated,
                  fields: ['comp4_skill1', 'comp4_skill2', 'comp4_skill3', 'comp4_skill4', 'comp4_skill5', 'comp4_skill6', 'comp4_skill7']
                },
              ].map((comp, index) => {
                // Calculate progress for this competence
                const totalScore = comp.fields.reduce((sum, field) => sum + (logbook[field] || 0), 0)
                const progress = (totalScore / (7 * 5)) * 100 // 7 skills × 5 max score

                return (
                  <div key={comp.name}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{comp.name}</span>
                        {comp.validated && (
                          <Badge variant="default" className="bg-green-600">
                            ✓ Validée
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          comp.validated ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
