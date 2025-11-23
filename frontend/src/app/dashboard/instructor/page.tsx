'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Clock } from 'lucide-react'
import { dashboardService } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface InstructorDashboardData {
  todayLessons: any[]
  stats: {
    totalLessons: number
    completedLessons: number
    totalHoursTaught: number
  }
}

export default function InstructorDashboardPage() {
  const [data, setData] = useState<InstructorDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getInstructorDashboard()
        setData(response.data.data)
      } catch (error) {
        console.error('Error fetching instructor dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  if (!data) {
    return <div className="text-center text-red-600">Erreur lors du chargement</div>
  }

  const statCards = [
    {
      title: 'Leçons Complétées',
      value: `${data.stats.completedLessons}/${data.stats.totalLessons}`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Heures Enseignées',
      value: `${data.stats.totalHoursTaught}h`,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Leçons Aujourd\'hui',
      value: data.todayLessons.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mon Tableau de Bord</h1>
        <p className="text-gray-600">Vue d&apos;ensemble de mon activité</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
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

      {/* Today's Lessons */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Leçons Aujourd&apos;hui</CardTitle>
          <CardDescription>
            {data.todayLessons.length} leçon(s) prévue(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.todayLessons.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aucune leçon prévue aujourd&apos;hui</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Heure</TableHead>
                  <TableHead>Élève</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Durée</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.todayLessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">
                      {new Date(lesson.startTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {lesson.student.user.firstName} {lesson.student.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{lesson.student.user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lesson.type === 'DRIVE' ? 'default' : 'secondary'}>
                        {lesson.type === 'DRIVE' ? 'Conduite' :
                         lesson.type === 'CODE' ? 'Code' :
                         lesson.type === 'EVALUATION' ? 'Évaluation' : 'Examen'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lesson.vehicle ? `${lesson.vehicle.brand} ${lesson.vehicle.model}` : '-'}
                    </TableCell>
                    <TableCell>{lesson.duration}h</TableCell>
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
