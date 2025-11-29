"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { lessonService, studentService, instructorService, vehicleService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Users } from 'lucide-react'

interface LessonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson?: any
  onSuccess: () => void
}

export function LessonDialog({ open, onOpenChange, lesson, onSuccess }: LessonDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    instructorId: '',
    vehicleId: '',
    type: 'DRIVE',
    status: 'SCHEDULED',
    startTime: '',
    duration: 1,
    topic: '',
    location: '',
    notes: '',
  })

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  useEffect(() => {
    if (lesson) {
      const startDate = new Date(lesson.startTime)
      // Extract student IDs from lesson.students array
      const studentIds = lesson.students?.map((s: any) => s.studentId || s.student?.id) || []
      setSelectedStudentIds(studentIds)

      setFormData({
        instructorId: lesson.instructorId || '',
        vehicleId: lesson.vehicleId || '',
        type: lesson.type || 'DRIVE',
        status: lesson.status || 'SCHEDULED',
        startTime: startDate.toISOString().slice(0, 16),
        duration: lesson.duration || 1,
        topic: lesson.topic || '',
        location: lesson.location || '',
        notes: lesson.notes || '',
      })
    } else {
      setSelectedStudentIds([])
      setFormData({
        instructorId: '',
        vehicleId: '',
        type: 'DRIVE',
        status: 'SCHEDULED',
        startTime: '',
        duration: 1,
        topic: '',
        location: '',
        notes: '',
      })
    }
  }, [lesson])

  const loadData = async () => {
    try {
      const [studentsRes, instructorsRes, vehiclesRes] = await Promise.all([
        studentService.getAll({ limit: 100 }),
        instructorService.getAll({ limit: 100 }),
        vehicleService.getAll({ limit: 100 }),
      ])
      setStudents(studentsRes.data.data.students || studentsRes.data.data)
      setInstructors(instructorsRes.data.data.instructors || instructorsRes.data.data)
      setVehicles(vehiclesRes.data.data.vehicles || vehiclesRes.data.data)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: at least 1 student required
    if (selectedStudentIds.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner au moins un élève',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const startDate = new Date(formData.startTime)
      const endDate = new Date(startDate.getTime() + formData.duration * 60 * 60 * 1000)

      const payload: any = {
        studentIds: selectedStudentIds,
        instructorId: formData.instructorId || null,
        vehicleId: formData.vehicleId || null,
        type: formData.type,
        status: formData.status,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        duration: parseFloat(formData.duration.toString()),
        topic: formData.topic,
        location: formData.location,
        notes: formData.notes,
      }

      if (lesson) {
        await lessonService.update(lesson.id, payload)
        toast({
          title: 'Succès',
          description: 'Leçon modifiée avec succès',
        })
      } else {
        await lessonService.create(payload)
        toast({
          title: 'Succès',
          description: 'Leçon créée avec succès',
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Modifier la leçon' : 'Nouvelle leçon'}</DialogTitle>
          <DialogDescription>
            {lesson ? 'Modifiez les informations de la leçon' : 'Remplissez les informations pour créer une nouvelle leçon'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Participants */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Participants</h3>

            {/* Students Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Élèves *</Label>
                {selectedStudentIds.length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {selectedStudentIds.length} élève{selectedStudentIds.length > 1 ? 's' : ''} sélectionné{selectedStudentIds.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <ScrollArea className="h-[200px] border rounded-md p-3">
                <div className="space-y-2">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedStudentIds.includes(student.id)}
                        onCheckedChange={() => handleStudentToggle(student.id)}
                      />
                      <label
                        htmlFor={`student-${student.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {student.user.firstName} {student.user.lastName}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="instructorId">Moniteur</Label>
                <Select
                  value={formData.instructorId}
                  onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un moniteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.user.firstName} {instructor.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicleId">Véhicule</Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value) => setFormData({ ...formData, vehicleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.plateNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Détails de la leçon */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Détails de la leçon</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODE">Séance de code</SelectItem>
                    <SelectItem value="DRIVE">Leçon de conduite</SelectItem>
                    <SelectItem value="EXAM_PREPARATION">Préparation examen</SelectItem>
                    <SelectItem value="EVALUATION">Évaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Planifiée</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                    <SelectItem value="COMPLETED">Terminée</SelectItem>
                    <SelectItem value="CANCELLED">Annulée</SelectItem>
                    <SelectItem value="NO_SHOW">Absence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startTime">Date et heure *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Durée (heures) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="4"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="topic">Sujet</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Circulation en ville..."
                />
              </div>
              <div>
                <Label htmlFor="location">Lieu de RDV</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Agence, domicile..."
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes du moniteur..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {lesson ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
