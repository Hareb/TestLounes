"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { examService, studentService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface ExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exam?: any
  onSuccess: () => void
}

export function ExamDialog({ open, onOpenChange, exam, onSuccess }: ExamDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])

  const [formData, setFormData] = useState({
    studentId: '',
    type: 'CODE',
    examDate: '',
    examCenter: '',
    examAddress: '',
    status: 'SCHEDULED',
    passed: false,
    score: 0,
    notes: '',
  })

  useEffect(() => {
    if (open) {
      loadStudents()
    }
  }, [open])

  useEffect(() => {
    if (exam) {
      const examDateObj = exam.examDate ? new Date(exam.examDate) : new Date()
      setFormData({
        studentId: exam.studentId || '',
        type: exam.type || 'CODE',
        examDate: examDateObj.toISOString().slice(0, 16),
        examCenter: exam.examCenter || '',
        examAddress: exam.examAddress || '',
        status: exam.status || 'SCHEDULED',
        passed: exam.passed || false,
        score: exam.score || 0,
        notes: exam.notes || '',
      })
    } else {
      setFormData({
        studentId: '',
        type: 'CODE',
        examDate: '',
        examCenter: '',
        examAddress: '',
        status: 'SCHEDULED',
        passed: false,
        score: 0,
        notes: '',
      })
    }
  }, [exam])

  const loadStudents = async () => {
    try {
      const response = await studentService.getAll({ limit: 100 })
      setStudents(response.data.data.students || response.data.data)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        studentId: formData.studentId,
        type: formData.type,
        examDate: new Date(formData.examDate).toISOString(),
        examCenter: formData.examCenter,
        examAddress: formData.examAddress,
        status: formData.status,
        notes: formData.notes,
      }

      if (formData.status === 'PASSED' || formData.status === 'FAILED') {
        payload.passed = formData.status === 'PASSED'
        if (formData.type === 'CODE') {
          payload.score = parseInt(formData.score.toString())
        }
      }

      if (exam) {
        await examService.update(exam.id, payload)
        toast({
          title: 'Succès',
          description: 'Examen modifié avec succès',
        })
      } else {
        await examService.create(payload)
        toast({
          title: 'Succès',
          description: 'Examen programmé avec succès',
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
          <DialogTitle>{exam ? 'Modifier l\'examen' : 'Programmer un examen'}</DialogTitle>
          <DialogDescription>
            {exam ? 'Modifiez les informations de l\'examen' : 'Programmez un nouvel examen pour un élève'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations de base */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Informations de l'examen</h3>
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
                <Label htmlFor="type">Type d'examen *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODE">Examen du code</SelectItem>
                    <SelectItem value="DRIVE">Examen de conduite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="examDate">Date et heure *</Label>
                <Input
                  id="examDate"
                  type="datetime-local"
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Lieu de l'examen */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Lieu de l'examen</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="examCenter">Centre d'examen *</Label>
                <Input
                  id="examCenter"
                  value={formData.examCenter}
                  onChange={(e) => setFormData({ ...formData, examCenter: e.target.value })}
                  placeholder="Centre d'examen de..."
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="examAddress">Adresse</Label>
                <Input
                  id="examAddress"
                  value={formData.examAddress}
                  onChange={(e) => setFormData({ ...formData, examAddress: e.target.value })}
                  placeholder="123 Rue de..."
                />
              </div>
            </div>
          </div>

          {/* Statut et résultat */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Statut et résultat</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Statut *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Programmé</SelectItem>
                    <SelectItem value="PASSED">Réussi</SelectItem>
                    <SelectItem value="FAILED">Échoué</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                    <SelectItem value="NO_SHOW">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.status === 'PASSED' || formData.status === 'FAILED') && formData.type === 'CODE' && (
                <div>
                  <Label htmlFor="score">Score (sur 40)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="40"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes supplémentaires..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {exam ? 'Modifier' : 'Programmer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
