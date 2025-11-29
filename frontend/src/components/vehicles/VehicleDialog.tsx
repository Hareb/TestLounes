"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { vehicleService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface VehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: any
  onSuccess: () => void
}

export function VehicleDialog({ open, onOpenChange, vehicle, onSuccess }: VehicleDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    plateNumber: '',
    type: 'CAR_MANUAL',
    year: new Date().getFullYear(),
    mileage: 0,
    status: 'AVAILABLE',
    insuranceExpiry: '',
    lastMaintenance: '',
    nextMaintenance: '',
    technicalControl: '',
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        plateNumber: vehicle.plateNumber || '',
        type: vehicle.type || 'CAR_MANUAL',
        year: vehicle.year || new Date().getFullYear(),
        mileage: vehicle.mileage || 0,
        status: vehicle.status || 'AVAILABLE',
        insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : '',
        lastMaintenance: vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toISOString().split('T')[0] : '',
        nextMaintenance: vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toISOString().split('T')[0] : '',
        technicalControl: vehicle.technicalControl ? new Date(vehicle.technicalControl).toISOString().split('T')[0] : '',
      })
    } else {
      setFormData({
        brand: '',
        model: '',
        plateNumber: '',
        type: 'CAR_MANUAL',
        year: new Date().getFullYear(),
        mileage: 0,
        status: 'AVAILABLE',
        insuranceExpiry: '',
        lastMaintenance: '',
        nextMaintenance: '',
        technicalControl: '',
      })
    }
  }, [vehicle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        ...formData,
        year: parseInt(formData.year.toString()),
        mileage: parseInt(formData.mileage.toString()),
        insuranceExpiry: new Date(formData.insuranceExpiry).toISOString(),
      }

      if (formData.lastMaintenance) {
        payload.lastMaintenance = new Date(formData.lastMaintenance).toISOString()
      }
      if (formData.nextMaintenance) {
        payload.nextMaintenance = new Date(formData.nextMaintenance).toISOString()
      }
      if (formData.technicalControl) {
        payload.technicalControl = new Date(formData.technicalControl).toISOString()
      }

      if (vehicle) {
        await vehicleService.update(vehicle.id, payload)
        toast({
          title: 'Succès',
          description: 'Véhicule modifié avec succès',
        })
      } else {
        await vehicleService.create(payload)
        toast({
          title: 'Succès',
          description: 'Véhicule créé avec succès',
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
          <DialogTitle>{vehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}</DialogTitle>
          <DialogDescription>
            {vehicle ? 'Modifiez les informations du véhicule' : 'Remplissez les informations pour créer un nouveau véhicule'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations véhicule */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Informations du véhicule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marque *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Renault, Peugeot..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Modèle *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Clio, 208..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="plateNumber">Plaque d'immatriculation *</Label>
                <Input
                  id="plateNumber"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                  placeholder="AB-123-CD"
                  required
                />
              </div>
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
                    <SelectItem value="CAR_MANUAL">Voiture manuelle</SelectItem>
                    <SelectItem value="CAR_AUTOMATIC">Voiture automatique</SelectItem>
                    <SelectItem value="MOTORCYCLE">Moto</SelectItem>
                    <SelectItem value="TRUCK">Poids lourd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Année *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mileage">Kilométrage</Label>
                <Input
                  id="mileage"
                  type="number"
                  min="0"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
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
                    <SelectItem value="AVAILABLE">Disponible</SelectItem>
                    <SelectItem value="IN_USE">En cours d'utilisation</SelectItem>
                    <SelectItem value="MAINTENANCE">En maintenance</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">Hors service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dates importantes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Entretien et contrôles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceExpiry">Échéance assurance *</Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="technicalControl">Contrôle technique</Label>
                <Input
                  id="technicalControl"
                  type="date"
                  value={formData.technicalControl}
                  onChange={(e) => setFormData({ ...formData, technicalControl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastMaintenance">Dernier entretien</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={formData.lastMaintenance}
                  onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nextMaintenance">Prochain entretien</Label>
                <Input
                  id="nextMaintenance"
                  type="date"
                  value={formData.nextMaintenance}
                  onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
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
              {vehicle ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
