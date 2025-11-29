"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { packageService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface PackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  package?: any
  onSuccess: () => void
}

export function PackageDialog({ open, onOpenChange, package: pkg, onSuccess }: PackageDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'COMPLETE',
    codeHours: 0,
    driveHours: 0,
    price: 0,
    validityMonths: 12,
    isPopular: false,
    isActive: true,
  })

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name || '',
        description: pkg.description || '',
        type: pkg.type || 'COMPLETE',
        codeHours: pkg.codeHours || 0,
        driveHours: pkg.driveHours || 0,
        price: pkg.price || 0,
        validityMonths: pkg.validityMonths || 12,
        isPopular: pkg.isPopular || false,
        isActive: pkg.isActive !== undefined ? pkg.isActive : true,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'COMPLETE',
        codeHours: 0,
        driveHours: 0,
        price: 0,
        validityMonths: 12,
        isPopular: false,
        isActive: true,
      })
    }
  }, [pkg])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        codeHours: parseInt(formData.codeHours.toString()),
        driveHours: parseFloat(formData.driveHours.toString()),
        price: parseFloat(formData.price.toString()),
        validityMonths: formData.validityMonths ? parseInt(formData.validityMonths.toString()) : null,
      }

      if (pkg) {
        await packageService.update(pkg.id, payload)
        toast({
          title: 'Succès',
          description: 'Forfait modifié avec succès',
        })
      } else {
        await packageService.create(payload)
        toast({
          title: 'Succès',
          description: 'Forfait créé avec succès',
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
          <DialogTitle>{pkg ? 'Modifier le forfait' : 'Nouveau forfait'}</DialogTitle>
          <DialogDescription>
            {pkg ? 'Modifiez les informations du forfait' : 'Créez un nouveau forfait de formation'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations générales */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Informations générales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nom du forfait *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Forfait complet B"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Formation complète permis B..."
                />
              </div>
              <div>
                <Label htmlFor="type">Type de forfait *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODE_ONLY">Code seul</SelectItem>
                    <SelectItem value="DRIVE_ONLY">Conduite seule</SelectItem>
                    <SelectItem value="COMPLETE">Forfait complet</SelectItem>
                    <SelectItem value="HOURS_PACK">Pack d'heures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contenu du forfait */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Contenu du forfait</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codeHours">Heures de code</Label>
                <Input
                  id="codeHours"
                  type="number"
                  min="0"
                  value={formData.codeHours}
                  onChange={(e) => setFormData({ ...formData, codeHours: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="driveHours">Heures de conduite</Label>
                <Input
                  id="driveHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.driveHours}
                  onChange={(e) => setFormData({ ...formData, driveHours: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Prix et validité */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Prix et validité</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="validityMonths">Validité (mois)</Label>
                <Input
                  id="validityMonths"
                  type="number"
                  min="0"
                  value={formData.validityMonths}
                  onChange={(e) => setFormData({ ...formData, validityMonths: parseInt(e.target.value) || 0 })}
                  placeholder="Laissez vide pour illimité"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Options</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Forfait populaire (mis en avant)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Forfait actif</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pkg ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
