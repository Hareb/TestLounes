'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, BookOpen, Car, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'

export default function StudentDashboardPage() {
  const { user } = useAuthStore()

  const statCards = [
    {
      title: 'Heures de Code',
      value: '12 / 20h',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      progress: 60,
    },
    {
      title: 'Heures de Conduite',
      value: '15 / 30h',
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      progress: 50,
    },
    {
      title: 'Prochaine Leçon',
      value: 'Demain 10h',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Progression',
      value: '55%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour {user?.firstName} !
        </h1>
        <p className="text-gray-600">Votre parcours de formation</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                {stat.progress && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Code Exam Status */}
      <Card>
        <CardHeader>
          <CardTitle>Examen du Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Statut</span>
              <Badge variant="success">Réussi</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Date de réussite</span>
              <span className="font-medium">15 Novembre 2024</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driving Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progression en Conduite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Maîtrise du véhicule', progress: 80 },
              { name: 'Circulation routière', progress: 65 },
              { name: 'Conditions difficiles', progress: 45 },
              { name: 'Conduite autonome', progress: 50 },
            ].map((comp) => (
              <div key={comp.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">{comp.name}</span>
                  <span className="text-sm font-medium">{comp.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${comp.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
