'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, GraduationCap, Car, Calendar, Euro, TrendingUp, Package, CalendarCheck, Award, ArrowRight } from 'lucide-react'
import { dashboardService, packageService, examService, bookingService } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuthStore } from '@/lib/store'

interface DashboardStats {
  overview: {
    totalStudents: number
    activeStudents: number
    totalInstructors: number
    totalVehicles: number
    totalLessons: number
    completedLessons: number
    totalRevenue: number
  }
  upcomingLessons: any[]
  recentPayments: any[]
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [packageStats, setPackageStats] = useState<any>(null)
  const [examStats, setExamStats] = useState<any>(null)
  const [pendingBookings, setPendingBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllStats()
  }, [])

  const fetchAllStats = async () => {
    console.log('fetchAllStats: Starting to fetch dashboard stats')
    console.log('fetchAllStats: API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')
    console.log('fetchAllStats: Token exists:', !!localStorage.getItem('token'))
    console.log('fetchAllStats: isAuthenticated:', isAuthenticated)

    if (!isAuthenticated) {
      console.log('fetchAllStats: Not authenticated, skipping API calls')
      setLoading(false)
      return
    }

    try {
      // Fetch main stats
      console.log('fetchAllStats: Fetching main dashboard stats')
      const response = await dashboardService.getStats()
      console.log('fetchAllStats: Main stats response:', response)
      setStats(response.data.data)

      // Fetch package stats
      try {
        console.log('fetchAllStats: Fetching package stats')
        const pkgStatsRes = await packageService.getStats()
        console.log('fetchAllStats: Package stats response:', pkgStatsRes)
        setPackageStats(pkgStatsRes.data.data)
      } catch (error) {
        console.error('fetchAllStats: Error fetching package stats:', error)
        console.error('fetchAllStats: Package stats error details:', {
          message: (error as any)?.message,
          status: (error as any)?.response?.status,
          data: (error as any)?.response?.data,
          url: (error as any)?.config?.url
        })
      }

      // Fetch exam stats
      try {
        console.log('fetchAllStats: Fetching exam stats')
        const examStatsRes = await examService.getStats()
        console.log('fetchAllStats: Exam stats response:', examStatsRes)
        setExamStats(examStatsRes.data.data)
      } catch (error) {
        console.error('fetchAllStats: Error fetching exam stats:', error)
        console.error('fetchAllStats: Exam stats error details:', {
          message: (error as any)?.message,
          status: (error as any)?.response?.status,
          data: (error as any)?.response?.data,
          url: (error as any)?.config?.url
        })
      }

      // Fetch pending bookings
      try {
        console.log('fetchAllStats: Fetching pending bookings')
        const bookingsRes = await bookingService.getAll()
        console.log('fetchAllStats: Bookings response:', bookingsRes)
        const pending = bookingsRes.data.data?.filter((b: any) => b.status === 'PENDING') || []
        setPendingBookings(pending.slice(0, 5)) // Show only first 5
      } catch (error) {
        console.error('fetchAllStats: Error fetching bookings:', error)
        console.error('fetchAllStats: Bookings error details:', {
          message: (error as any)?.message,
          status: (error as any)?.response?.status,
          data: (error as any)?.response?.data,
          url: (error as any)?.config?.url
        })
      }
    } catch (error) {
      console.error('fetchAllStats: Error fetching main stats:', error)
      console.error('fetchAllStats: Main stats error details:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        url: (error as any)?.config?.url
      })
    } finally {
      console.log('fetchAllStats: Finished fetching, setting loading to false')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center">
        <p className="text-red-600">Erreur lors du chargement des statistiques</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre auto-école</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Élèves Actifs</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              / {stats.overview.totalStudents} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moniteurs</CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <GraduationCap className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalInstructors}</div>
            <p className="text-xs text-muted-foreground">actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leçons Complétées</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.completedLessons}</div>
            <p className="text-xs text-muted-foreground">ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100">
              <Euro className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">toutes sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Phase 4 Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Package Stats */}
        {packageStats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forfaits Vendus</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{packageStats.totalPurchases}</div>
              <p className="text-xs text-muted-foreground">
                {packageStats.activePurchases} actifs
              </p>
              <div className="pt-2 text-sm text-emerald-600 font-semibold">
                {formatCurrency(packageStats.totalRevenue)}
              </div>
              <Link href="/dashboard/packages">
                <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                  Voir détails <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Booking Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <CalendarCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings.length}</div>
            <p className="text-xs text-muted-foreground">en attente de confirmation</p>
            {pendingBookings.length > 0 && (
              <Link href="/dashboard/bookings">
                <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-orange-600">
                  Confirmer <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Exam Stats */}
        {examStats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Code:</span>
                  <span className="text-lg font-bold text-blue-600">{examStats.codePassRate.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Conduite:</span>
                  <span className="text-lg font-bold text-green-600">{examStats.drivePassRate.toFixed(0)}%</span>
                </div>
              </div>
              <Link href="/dashboard/exams">
                <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                  Voir stats <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pending Bookings Alert */}
      {pendingBookings.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-orange-900">Réservations en Attente</CardTitle>
                <CardDescription className="text-orange-700">
                  {pendingBookings.length} réservation(s) nécessitent votre confirmation
                </CardDescription>
              </div>
              <Link href="/dashboard/bookings">
                <Button variant="outline" size="sm">
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium">
                      {booking.student.user.firstName} {booking.student.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.startTime).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {booking.type}
                    </p>
                  </div>
                  <Badge variant="secondary">En attente</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Lessons */}
        <Card>
          <CardHeader>
            <CardTitle>Leçons à Venir (7 prochains jours)</CardTitle>
            <CardDescription>
              {stats.upcomingLessons.length} leçons planifiées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingLessons.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune leçon prévue</p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingLessons.slice(0, 5).map((lesson) => {
                  const students = lesson.students || []
                  const isGroup = students.length > 1

                  return (
                    <div key={lesson.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {isGroup ? (
                            <span>👥 Groupe ({students.length} élèves)</span>
                          ) : students.length === 1 ? (
                            <span>{students[0].student.user.firstName} {students[0].student.user.lastName}</span>
                          ) : (
                            <span>Leçon sans élève</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(lesson.startTime).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' avec '}
                          {lesson.instructor?.user.firstName}
                        </p>
                      </div>
                      <Badge variant={lesson.type === 'DRIVE' ? 'default' : 'secondary'}>
                        {lesson.type === 'DRIVE' ? 'Conduite' :
                         lesson.type === 'CODE' ? 'Code' :
                         lesson.type === 'EVALUATION' ? 'Évaluation' : 'Examen'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Paiements Récents</CardTitle>
            <CardDescription>
              Dernières transactions enregistrées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun paiement récent</p>
            ) : (
              <div className="space-y-3">
                {stats.recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {payment.student.user.firstName} {payment.student.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">{formatCurrency(payment.amount)}</p>
                      <Badge variant="outline" className="text-xs">
                        {payment.method === 'CARD' ? 'Carte' :
                         payment.method === 'CASH' ? 'Espèces' :
                         payment.method === 'TRANSFER' ? 'Virement' :
                         payment.method === 'CPF' ? 'CPF' : payment.method}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
