'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/i18n-context'
import { packageService } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Package, TrendingUp, ShoppingCart, Clock, CheckCircle } from 'lucide-react'

export default function PackagesPage() {
  const { t } = useTranslation()
  const [packages, setPackages] = useState<any[]>([])
  const [myPackages, setMyPackages] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('')
  const [studentId, setStudentId] = useState<string>('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'COMPLETE' as 'CODE_ONLY' | 'DRIVE_ONLY' | 'COMPLETE' | 'HOURS_PACK',
    codeHours: 0,
    driveHours: 0,
    price: 0,
    validityMonths: 12,
    isPopular: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get user role from localStorage
      const role = localStorage.getItem('userRole') || 'STUDENT'
      const userId = localStorage.getItem('userId') || ''
      setUserRole(role)

      // Fetch packages
      const packagesRes = await packageService.getAll({ active: true })
      setPackages(packagesRes.data.data || [])

      // Fetch stats for admin
      if (role === 'ADMIN' || role === 'SECRETARY') {
        const statsRes = await packageService.getStats()
        setStats(statsRes.data.data)
      }

      // Fetch student packages if student
      if (role === 'STUDENT') {
        // TODO: Get actual student ID from profile
        const mockStudentId = 'student-123'
        setStudentId(mockStudentId)
        try {
          const myPackagesRes = await packageService.getStudentPackages(mockStudentId)
          setMyPackages(myPackagesRes.data.data || [])
        } catch (error) {
          console.error('Error fetching student packages:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPackageTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CODE_ONLY: t.packages.types.CODE_ONLY,
      DRIVE_ONLY: t.packages.types.DRIVE_ONLY,
      COMPLETE: t.packages.types.COMPLETE,
      HOURS_PACK: t.packages.types.HOURS_PACK,
    }
    return types[type] || type
  }

  const getPackageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CODE_ONLY: 'bg-blue-100 text-blue-800',
      DRIVE_ONLY: 'bg-green-100 text-green-800',
      COMPLETE: 'bg-purple-100 text-purple-800',
      HOURS_PACK: 'bg-orange-100 text-orange-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const handlePurchase = async (packageId: string, price: number) => {
    if (!studentId) {
      alert('Student ID not found')
      return
    }

    try {
      await packageService.purchase(packageId, {
        studentId,
        pricePaid: price,
      })
      alert('Forfait acheté avec succès !')
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'achat')
    }
  }

  const handleCreatePackage = async () => {
    try {
      // Validate form
      if (!formData.name || !formData.description) {
        alert('Nom et description requis')
        return
      }
      if (formData.price <= 0) {
        alert('Le prix doit être supérieur à 0')
        return
      }
      if (formData.codeHours === 0 && formData.driveHours === 0) {
        alert('Au moins un type d\'heures (code ou conduite) doit être supérieur à 0')
        return
      }

      await packageService.create(formData)
      alert('Forfait créé avec succès !')
      setCreateModalOpen(false)
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'COMPLETE',
        codeHours: 0,
        driveHours: 0,
        price: 0,
        validityMonths: 12,
        isPopular: false,
      })
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.packages.title}</h1>
          <p className="text-gray-500 mt-1">
            {packages.length} {t.packages.total}
          </p>
        </div>
        {(userRole === 'ADMIN' || userRole === 'SECRETARY') && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.packages.add}
          </Button>
        )}
      </div>

      {/* Stats Cards (Admin only) */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total {t.packages.title}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPackages}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activePackages} {t.status.active}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.packages.purchases}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPurchases}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activePurchases} {t.status.active}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.payments.totalCollected}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</div>
              <p className="text-xs text-muted-foreground">Revenus forfaits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.packages.popular}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.popularPackages?.[0]?._count?.purchases || 0}</div>
              <p className="text-xs text-muted-foreground">{stats.popularPackages?.[0]?.name || '-'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Student View */}
      {userRole === 'STUDENT' ? (
        <Tabs defaultValue="available" className="space-y-4">
          <TabsList>
            <TabsTrigger value="available">Forfaits Disponibles</TabsTrigger>
            <TabsTrigger value="my-packages">{t.packages.myPackages}</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="relative overflow-hidden">
                  {pkg.isPopular && (
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-none rounded-bl-lg bg-yellow-500">
                        {t.packages.popular}
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Badge className={getPackageTypeColor(pkg.type)}>
                      {getPackageTypeLabel(pkg.type)}
                    </Badge>

                    <div className="space-y-2">
                      {pkg.codeHours > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>{t.packages.codeHours}</span>
                          <span className="font-semibold">{pkg.codeHours}h</span>
                        </div>
                      )}
                      {pkg.driveHours > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>{t.packages.driveHours}</span>
                          <span className="font-semibold">{pkg.driveHours}h</span>
                        </div>
                      )}
                      {pkg.validityMonths && (
                        <div className="flex justify-between text-sm">
                          <span>{t.packages.validity}</span>
                          <span className="font-semibold">{pkg.validityMonths} {t.packages.months}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold">{pkg.price} €</span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(pkg.id, pkg.price)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {t.packages.purchase}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-packages" className="space-y-4">
            {myPackages.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-gray-500">Aucun forfait acheté</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myPackages.map((purchase: any) => {
                  const isExpired = purchase.isExpired || (purchase.expiryDate && new Date(purchase.expiryDate) < new Date())
                  const codeRemaining = purchase.codeHoursBought - purchase.codeHoursUsed
                  const driveRemaining = purchase.driveHoursBought - purchase.driveHoursUsed

                  return (
                    <Card key={purchase.id} className={isExpired ? 'opacity-60' : ''}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{purchase.package.name}</CardTitle>
                            <CardDescription>
                              Acheté le {new Date(purchase.purchaseDate).toLocaleDateString('fr-FR')}
                            </CardDescription>
                          </div>
                          {isExpired && (
                            <Badge variant="destructive">{t.packages.expired}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {purchase.codeHoursBought > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Code - {t.packages.hoursRemaining}</span>
                              <span className={`font-semibold ${codeRemaining < 5 ? 'text-orange-600' : ''}`}>
                                {codeRemaining}h / {purchase.codeHoursBought}h
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(purchase.codeHoursUsed / purchase.codeHoursBought) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {purchase.driveHoursBought > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Conduite - {t.packages.hoursRemaining}</span>
                              <span className={`font-semibold ${driveRemaining < 5 ? 'text-orange-600' : ''}`}>
                                {driveRemaining}h / {purchase.driveHoursBought}h
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${(purchase.driveHoursUsed / purchase.driveHoursBought) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Prix payé</span>
                            <span className="font-semibold">{purchase.pricePaid} €</span>
                          </div>
                          {purchase.expiryDate && (
                            <div className="flex justify-between text-sm">
                              <span>{t.packages.expiresOn}</span>
                              <span className={isExpired ? 'text-red-600' : ''}>
                                {new Date(purchase.expiryDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        /* Admin View - All Packages */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </div>
                  {pkg.isPopular && (
                    <Badge className="bg-yellow-500">{t.packages.popular}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={getPackageTypeColor(pkg.type)}>
                  {getPackageTypeLabel(pkg.type)}
                </Badge>

                <div className="space-y-2 text-sm">
                  {pkg.codeHours > 0 && (
                    <div className="flex justify-between">
                      <span>{t.packages.codeHours}</span>
                      <span className="font-semibold">{pkg.codeHours}h</span>
                    </div>
                  )}
                  {pkg.driveHours > 0 && (
                    <div className="flex justify-between">
                      <span>{t.packages.driveHours}</span>
                      <span className="font-semibold">{pkg.driveHours}h</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t.packages.price}</span>
                    <span className="font-bold text-lg">{pkg.price} €</span>
                  </div>
                  {pkg.validityMonths && (
                    <div className="flex justify-between">
                      <span>{t.packages.validity}</span>
                      <span>{pkg.validityMonths} {t.packages.months}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t.packages.purchases}</span>
                    <span className="font-semibold">{pkg._count?.purchases || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    {t.common.edit}
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1">
                    {t.common.delete}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Package Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouveau forfait</DialogTitle>
            <DialogDescription>
              Définissez les détails du forfait qui sera disponible à l'achat par les élèves
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du forfait *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                placeholder="Ex: Forfait Code + Conduite"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => updateFormField('description', e.target.value)}
                placeholder="Description détaillée du forfait"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type de forfait *</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['CODE_ONLY', 'DRIVE_ONLY', 'COMPLETE', 'HOURS_PACK'] as const).map((type) => (
                  <label
                    key={type}
                    className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition ${
                      formData.type === type
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => updateFormField('type', e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="text-sm font-medium">{getPackageTypeLabel(type)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Code Hours */}
              <div className="space-y-2">
                <Label htmlFor="codeHours">Heures de code</Label>
                <Input
                  id="codeHours"
                  type="number"
                  min="0"
                  value={formData.codeHours}
                  onChange={(e) => updateFormField('codeHours', parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Drive Hours */}
              <div className="space-y-2">
                <Label htmlFor="driveHours">Heures de conduite</Label>
                <Input
                  id="driveHours"
                  type="number"
                  min="0"
                  value={formData.driveHours}
                  onChange={(e) => updateFormField('driveHours', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => updateFormField('price', parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Validity Months */}
              <div className="space-y-2">
                <Label htmlFor="validityMonths">Validité (mois)</Label>
                <Input
                  id="validityMonths"
                  type="number"
                  min="1"
                  value={formData.validityMonths}
                  onChange={(e) => updateFormField('validityMonths', parseInt(e.target.value) || 12)}
                />
              </div>
            </div>

            {/* Is Popular */}
            <div className="flex items-center space-x-2">
              <input
                id="isPopular"
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => updateFormField('isPopular', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isPopular" className="cursor-pointer">
                Marquer comme forfait populaire
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePackage}>
              Créer le forfait
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
