'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, Car, Calendar, Euro, TrendingUp } from 'lucide-react'
import { dashboardService } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getStats()
        setStats(response.data.data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

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

  const statCards = [
    {
      title: 'Élèves Actifs',
      value: `${stats.overview.activeStudents}/${stats.overview.totalStudents}`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Moniteurs',
      value: stats.overview.totalInstructors,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Véhicules',
      value: stats.overview.totalVehicles,
      icon: Car,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Leçons Complétées',
      value: stats.overview.completedLessons,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Revenu Total',
      value: formatCurrency(stats.overview.totalRevenue),
      icon: Euro,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Taux de Réussite',
      value: '78%',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-600">Vue d&apos;ensemble de votre auto-école</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Élève</TableHead>
                  <TableHead>Moniteur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.upcomingLessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>
                      {new Date(lesson.startTime).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      {lesson.student.user.firstName} {lesson.student.user.lastName}
                    </TableCell>
                    <TableCell>
                      {lesson.instructor?.user.firstName} {lesson.instructor?.user.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lesson.type === 'DRIVE' ? 'default' : 'secondary'}>
                        {lesson.type === 'DRIVE' ? 'Conduite' :
                         lesson.type === 'CODE' ? 'Code' :
                         lesson.type === 'EVALUATION' ? 'Évaluation' : 'Examen'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lesson.status === 'CONFIRMED' ? 'success' : 'outline'}>
                        {lesson.status === 'CONFIRMED' ? 'Confirmée' : 'Planifiée'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Élève</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      {payment.student.user.firstName} {payment.student.user.lastName}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment.method === 'CARD' ? 'Carte' :
                         payment.method === 'CASH' ? 'Espèces' :
                         payment.method === 'TRANSFER' ? 'Virement' :
                         payment.method === 'CPF' ? 'CPF' : payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">
                        Payé
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
