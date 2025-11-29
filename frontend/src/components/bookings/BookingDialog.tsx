"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { bookingService, studentService, instructorService, vehicleService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking?: any
  onSuccess: () => void
}

export function BookingDialog({ open, onOpenChange, booking, onSuccess }: BookingDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])

  const [formData, setFormData] = useState({
    studentId: '',
    instructorId: '',
    vehicleId: '',
    type: 'DRIVE',
    startTime: '',
    duration: 1,
    status: 'PENDING',
    studentNotes: '',
    adminNotes: '',
  })

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  useEffect(() => {
    if (booking) {
      const startDate = new Date(booking.startTime)
      setFormData({
        studentId: booking.studentId || '',
        instructorId: booking.instructorId || '',
        vehicleId: booking.vehicleId || '',
        type: booking.type || 'DRIVE',
        startTime: startDate.toISOString().slice(0, 16),
        duration: booking.duration || 1,
        status: booking.status || 'PENDING',
        studentNotes: booking.studentNotes || '',
        adminNotes: booking.adminNotes || '',
      })
    } else {
      setFormData({
        studentId: '',
        instructorId: '',
        vehicleId: '',
        type: 'DRIVE',
        startTime: '',
        duration: 1,
        status: 'PENDING',
        studentNotes: '',
        adminNotes: '',
      })
    }
  }, [booking])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const startDate = new Date(formData.startTime)
      const endDate = new Date(startDate.getTime() + formData.duration * 60 * 60 * 1000)

      const payload: any = {
        studentId: formData.studentId,
        instructorId: formData.instructorId || null,
        vehicleId: formData.vehicleId || null,
        type: formData.type,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        duration: parseFloat(formData.duration.toString()),
        status: formData.status,
        studentNotes: formData.studentNotes,
        adminNotes: formData.adminNotes,
      }

      // Bookings cannot be updated directly, only created
      // To modify, use confirm/cancel/convertToLesson actions
      await bookingService.create(payload)
      toast({
        title: 'Succès',
        description: 'Réservation créée avec succès',
      })

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
          <DialogTitle>{booking ? 'Modifier la réservation' : 'Nouvelle réservation'}</DialogTitle>
          <DialogDescription>
            {booking ? 'Modifiez les informations de la réservation' : 'Créez une nouvelle réservation de leçon'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Participants */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Participants</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="studentId">Élève *</Label>
                <Select
                  value={formData.studentId}
                  onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un élève" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.user.firstName} {student.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

          {/* Détails de la réservation */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Détails de la réservation</h3>
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
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                    <SelectItem value="COMPLETED">Effectuée</SelectItem>
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
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Notes</h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="studentNotes">Notes de l'élève</Label>
                <textarea
                  id="studentNotes"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                  value={formData.studentNotes}
                  onChange={(e) => setFormData({ ...formData, studentNotes: e.target.value })}
                  placeholder="Demandes ou préférences de l'élève..."
                />
              </div>
              <div>
                <Label htmlFor="adminNotes">Notes administratives</Label>
                <textarea
                  id="adminNotes"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  placeholder="Notes internes..."
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
              {booking ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
