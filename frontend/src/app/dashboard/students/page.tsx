'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { studentService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Student {
  id: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  status: string
  formationType: string
  driveHoursPaid: number
  driveHoursUsed: number
  codeExamPassed?: boolean
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [formationTypeFilter, setFormationTypeFilter] = useState<string>('')
  const [codeExamFilter, setCodeExamFilter] = useState<string>('')
  const { toast } = useToast()

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params: any = { search, page, limit: 10 }

      // Add filters if set
      if (statusFilter) params.status = statusFilter
      if (formationTypeFilter) params.formationType = formationTypeFilter
      if (codeExamFilter === 'passed') params.codeExamPassed = true
      if (codeExamFilter === 'notPassed') params.codeExamPassed = false

      const response = await studentService.getAll(params)
      setStudents(response.data.data.students)
      setTotal(response.data.data.pagination.total)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les élèves',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [search, page, statusFilter, formationTypeFilter, codeExamFilter])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: { variant: 'success', label: 'Actif' },
      COMPLETED: { variant: 'default', label: 'Terminé' },
      SUSPENDED: { variant: 'warning', label: 'Suspendu' },
      CANCELLED: { variant: 'destructive', label: 'Annulé' },
    }
    const config = variants[status] || { variant: 'outline', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getFormationTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      TRADITIONAL: 'Classique',
      AAC: 'AAC',
      SUPERVISED: 'Supervisée',
      ACCELERATED: 'Accélérée',
    }
    return <Badge variant="outline">{labels[type] || type}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Élèves</h1>
          <p className="text-gray-600">{total} élève(s) au total</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel Élève
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email ou NEPH..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[180px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="COMPLETED">Terminé</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <select
                value={formationTypeFilter}
                onChange={(e) => setFormationTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="TRADITIONAL">Classique</option>
                <option value="AAC">AAC</option>
                <option value="SUPERVISED">Supervisée</option>
                <option value="ACCELERATED">Accélérée</option>
              </select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <select
                value={codeExamFilter}
                onChange={(e) => setCodeExamFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Code - Tous</option>
                <option value="passed">Réussi</option>
                <option value="notPassed">En cours</option>
              </select>
            </div>

            {(statusFilter || formationTypeFilter || codeExamFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('')
                  setFormationTypeFilter('')
                  setCodeExamFilter('')
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Élèves</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun élève trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Formation</TableHead>
                  <TableHead>Heures</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {student.user.firstName} {student.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{student.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.user.phone || '-'}
                    </TableCell>
                    <TableCell>
                      {getFormationTypeBadge(student.formationType)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {student.driveHoursUsed}h / {student.driveHoursPaid}h
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((student.driveHoursUsed / student.driveHoursPaid) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.codeExamPassed ? (
                        <Badge variant="success">Réussi</Badge>
                      ) : (
                        <Badge variant="outline">En cours</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(student.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/students/${student.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!loading && total > 10 && (
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= total}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
