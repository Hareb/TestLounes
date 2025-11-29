"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { instructorService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface InstructorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instructor?: any
  onSuccess: () => void
}

export function InstructorDialog({ open, onOpenChange, instructor, onSuccess }: InstructorDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // User data
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',

    // Instructor data
    diploma: '',
    diplomaNumber: '',
    diplomaExpiry: '',
    weeklyHours: 35,
    status: 'ACTIVE',
  })

  useEffect(() => {
    if (instructor) {
      setFormData({
        email: instructor.user.email || '',
        password: '',
        firstName: instructor.user.firstName || '',
        lastName: instructor.user.lastName || '',
        phone: instructor.user.phone || '',
        diploma: instructor.diploma || '',
        diplomaNumber: instructor.diplomaNumber || '',
        diplomaExpiry: instructor.diplomaExpiry ? new Date(instructor.diplomaExpiry).toISOString().split('T')[0] : '',
        weeklyHours: instructor.weeklyHours || 35,
        status: instructor.status || 'ACTIVE',
      })
    } else {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        diploma: '',
        diplomaNumber: '',
        diplomaExpiry: '',
        weeklyHours: 35,
        status: 'ACTIVE',
      })
    }
  }, [instructor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        diplomaExpiry: formData.diplomaExpiry ? new Date(formData.diplomaExpiry).toISOString() : null,
        weeklyHours: parseInt(formData.weeklyHours.toString()),
      }

      if (instructor && !formData.password) {
        delete (payload as any).password
      }

      if (instructor) {
        await instructorService.update(instructor.id, payload)
        toast({
          title: 'Succès',
          description: 'Moniteur modifié avec succès',
        })
      } else {
        await instructorService.create(payload)
        toast({
          title: 'Succès',
          description: 'Moniteur créé avec succès',
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
          <DialogTitle>{instructor ? 'Modifier le moniteur' : 'Nouveau moniteur'}</DialogTitle>
          <DialogDescription>
            {instructor ? 'Modifiez les informations du moniteur' : 'Remplissez les informations pour créer un nouveau moniteur'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations utilisateur */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Informations du compte</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              {!instructor && (
                <div className="col-span-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!instructor}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Qualifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diploma">Diplôme *</Label>
                <Input
                  id="diploma"
                  value={formData.diploma}
                  onChange={(e) => setFormData({ ...formData, diploma: e.target.value })}
                  placeholder="BEPECASER ou Titre Pro"
                  required
                />
              </div>
              <div>
                <Label htmlFor="diplomaNumber">Numéro de diplôme *</Label>
                <Input
                  id="diplomaNumber"
                  value={formData.diplomaNumber}
                  onChange={(e) => setFormData({ ...formData, diplomaNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="diplomaExpiry">Date d'expiration</Label>
                <Input
                  id="diplomaExpiry"
                  type="date"
                  value={formData.diplomaExpiry}
                  onChange={(e) => setFormData({ ...formData, diplomaExpiry: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="weeklyHours">Heures hebdomadaires</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  min="1"
                  max="48"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData({ ...formData, weeklyHours: parseInt(e.target.value) || 35 })}
                />
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
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="ON_LEAVE">En congé</SelectItem>
                    <SelectItem value="INACTIVE">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {instructor ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
