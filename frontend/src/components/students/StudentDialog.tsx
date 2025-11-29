"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { studentService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface StudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: any
  onSuccess: () => void
}

export function StudentDialog({ open, onOpenChange, student, onSuccess }: StudentDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // User data
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',

    // Student data
    dateOfBirth: '',
    placeOfBirth: '',
    address: '',
    city: '',
    postalCode: '',
    neph: '',
    formationType: 'TRADITIONAL',
    status: 'ACTIVE',
    codeHoursPaid: 0,
    driveHoursPaid: 0,
  })

  useEffect(() => {
    if (student) {
      setFormData({
        email: student.user.email || '',
        password: '', // Don't populate password for editing
        firstName: student.user.firstName || '',
        lastName: student.user.lastName || '',
        phone: student.user.phone || '',
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
        placeOfBirth: student.placeOfBirth || '',
        address: student.address || '',
        city: student.city || '',
        postalCode: student.postalCode || '',
        neph: student.neph || '',
        formationType: student.formationType || 'TRADITIONAL',
        status: student.status || 'ACTIVE',
        codeHoursPaid: student.codeHoursPaid || 0,
        driveHoursPaid: student.driveHoursPaid || 0,
      })
    } else {
      // Reset form for new student
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        placeOfBirth: '',
        address: '',
        city: '',
        postalCode: '',
        neph: '',
        formationType: 'TRADITIONAL',
        status: 'ACTIVE',
        codeHoursPaid: 0,
        driveHoursPaid: 0,
      })
    }
  }, [student])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        codeHoursPaid: parseInt(formData.codeHoursPaid.toString()),
        driveHoursPaid: parseFloat(formData.driveHoursPaid.toString()),
      }

      // Remove password if editing and it's empty
      if (student && !formData.password) {
        delete (payload as any).password
      }

      if (student) {
        await studentService.update(student.id, payload)
        toast({
          title: 'Succès',
          description: 'Élève modifié avec succès',
        })
      } else {
        await studentService.create(payload)
        toast({
          title: 'Succès',
          description: 'Élève créé avec succès',
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
          <DialogTitle>{student ? 'Modifier l\'élève' : 'Nouvel élève'}</DialogTitle>
          <DialogDescription>
            {student ? 'Modifiez les informations de l\'élève' : 'Remplissez les informations pour créer un nouvel élève'}
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
              {!student && (
                <div className="col-span-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!student}
                    placeholder={student ? 'Laissez vide pour ne pas changer' : ''}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="placeOfBirth">Lieu de naissance *</Label>
                <Input
                  id="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Code postal *</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="neph">Numéro NEPH</Label>
                <Input
                  id="neph"
                  value={formData.neph}
                  onChange={(e) => setFormData({ ...formData, neph: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Informations formation */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Formation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="formationType">Type de formation</Label>
                <Select
                  value={formData.formationType}
                  onValueChange={(value) => setFormData({ ...formData, formationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRADITIONAL">Traditionnelle</SelectItem>
                    <SelectItem value="AAC">Conduite accompagnée (AAC)</SelectItem>
                    <SelectItem value="SUPERVISED">Conduite supervisée</SelectItem>
                    <SelectItem value="ACCELERATED">Stage accéléré</SelectItem>
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
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="codeHoursPaid">Heures de code payées</Label>
                <Input
                  id="codeHoursPaid"
                  type="number"
                  min="0"
                  value={formData.codeHoursPaid}
                  onChange={(e) => setFormData({ ...formData, codeHoursPaid: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="driveHoursPaid">Heures de conduite payées</Label>
                <Input
                  id="driveHoursPaid"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.driveHoursPaid}
                  onChange={(e) => setFormData({ ...formData, driveHoursPaid: parseFloat(e.target.value) || 0 })}
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
              {student ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
