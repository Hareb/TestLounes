"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { paymentService, studentService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment?: any
  onSuccess: () => void
}

export function PaymentDialog({ open, onOpenChange, payment, onSuccess }: PaymentDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])

  const [formData, setFormData] = useState({
    studentId: '',
    amount: 0,
    method: 'CASH',
    status: 'COMPLETED',
    description: '',
  })

  useEffect(() => {
    if (open) {
      loadStudents()
    }
  }, [open])

  useEffect(() => {
    if (payment) {
      setFormData({
        studentId: payment.studentId || '',
        amount: payment.amount || 0,
        method: payment.method || 'CASH',
        status: payment.status || 'COMPLETED',
        description: payment.description || '',
      })
    } else {
      setFormData({
        studentId: '',
        amount: 0,
        method: 'CASH',
        status: 'COMPLETED',
        description: '',
      })
    }
  }, [payment])

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
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount.toString()),
      }

      // Payments cannot be updated, only created
      await paymentService.create(payload)
      toast({
        title: 'Succès',
        description: 'Paiement enregistré avec succès',
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
          <DialogTitle>{payment ? 'Modifier le paiement' : 'Nouveau paiement'}</DialogTitle>
          <DialogDescription>
            {payment ? 'Modifiez les informations du paiement' : 'Enregistrez un nouveau paiement'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection élève */}
          <div>
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

          <div className="grid grid-cols-2 gap-4">
            {/* Montant */}
            <div>
              <Label htmlFor="amount">Montant (€) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                required
              />
            </div>

            {/* Méthode de paiement */}
            <div>
              <Label htmlFor="method">Méthode de paiement *</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData({ ...formData, method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Espèces</SelectItem>
                  <SelectItem value="CARD">Carte bancaire</SelectItem>
                  <SelectItem value="TRANSFER">Virement</SelectItem>
                  <SelectItem value="CHECK">Chèque</SelectItem>
                  <SelectItem value="CPF">CPF</SelectItem>
                  <SelectItem value="INSTALLMENT">Échelonnement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statut */}
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
                <SelectItem value="COMPLETED">Payé</SelectItem>
                <SelectItem value="FAILED">Échoué</SelectItem>
                <SelectItem value="REFUNDED">Remboursé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Forfait conduite 20h..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {payment ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
