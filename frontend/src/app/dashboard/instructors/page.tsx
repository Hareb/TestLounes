'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { instructorService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/lib/i18n/i18n-context'
import { InstructorDialog } from '@/components/instructors/InstructorDialog'
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

interface Instructor {
  id: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  diploma: string
  diplomaNumber: string
  status: string
  weeklyHours: number
  totalHoursTaught: number
  _count?: {
    lessons: number
  }
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toast } = useToast()
  const { t } = useTranslation()

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [instructorToDelete, setInstructorToDelete] = useState<Instructor | null>(null)

  const fetchInstructors = async () => {
    try {
      setLoading(true)
      const response = await instructorService.getAll({ search })
      setInstructors(response.data.data)
    } catch (error) {
      toast({
        title: t.messages.error,
        description: 'Failed to load instructors',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstructors()
  }, [search])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: { variant: 'success', label: t.status.active },
      ON_LEAVE: { variant: 'warning', label: 'On Leave' },
      INACTIVE: { variant: 'destructive', label: t.status.inactive },
    }
    const config = variants[status] || { variant: 'outline', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleCreate = () => {
    setSelectedInstructor(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (instructor: Instructor) => {
    setSelectedInstructor(instructor)
    setDialogOpen(true)
  }

  const handleDeleteClick = (instructor: Instructor) => {
    setInstructorToDelete(instructor)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!instructorToDelete) return

    try {
      await instructorService.delete(instructorToDelete.id)
      toast({
        title: 'Succès',
        description: 'Moniteur supprimé avec succès',
      })
      fetchInstructors()
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer le moniteur',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setInstructorToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.instructors.title}</h1>
          <p className="text-gray-600">{instructors.length} {t.instructors.total}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t.instructors.add}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.instructors.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.instructors.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : instructors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.common.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>{t.instructors.diploma}</TableHead>
                  <TableHead>{t.instructors.weeklyHours}</TableHead>
                  <TableHead>{t.instructors.hoursTaught}</TableHead>
                  <TableHead>{t.instructors.lessons}</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructors.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {instructor.user.firstName} {instructor.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{instructor.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {instructor.user.phone || '-'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{instructor.diploma}</p>
                        <p className="text-xs text-gray-500">{instructor.diplomaNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>{instructor.weeklyHours}h</TableCell>
                    <TableCell>
                      <span className="font-semibold text-blue-600">
                        {instructor.totalHoursTaught}h
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {instructor._count?.lessons || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(instructor.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(instructor)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(instructor)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <InstructorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        instructor={selectedInstructor}
        onSuccess={fetchInstructors}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le moniteur{' '}
              <strong>
                {instructorToDelete?.user.firstName} {instructorToDelete?.user.lastName}
              </strong>{' '}
              sera définitivement supprimé.
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
