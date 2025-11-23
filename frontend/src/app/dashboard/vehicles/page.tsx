'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Eye, Edit, Trash2, Wrench } from 'lucide-react'
import { vehicleService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/lib/i18n/i18n-context'

interface Vehicle {
  id: string
  brand: string
  model: string
  plateNumber: string
  type: string
  year: number
  status: string
  mileage: number
  instructor?: {
    user: {
      firstName: string
      lastName: string
    }
  }
  _count?: {
    lessons: number
  }
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toast } = useToast()
  const { t } = useTranslation()

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await vehicleService.getAll()
      setVehicles(response.data.data)
    } catch (error) {
      toast({
        title: t.messages.error,
        description: 'Failed to load vehicles',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      AVAILABLE: { variant: 'success', label: 'Available' },
      IN_USE: { variant: 'default', label: 'In Use' },
      MAINTENANCE: { variant: 'warning', label: 'Maintenance' },
      OUT_OF_SERVICE: { variant: 'destructive', label: 'Out of Service' },
    }
    const config = variants[status] || { variant: 'outline', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      CAR_MANUAL: 'Manual',
      CAR_AUTOMATIC: 'Automatic',
      MOTORCYCLE: 'Motorcycle',
      TRUCK: 'Truck',
    }
    return <Badge variant="outline">{labels[type] || type}</Badge>
  }

  const filteredVehicles = vehicles.filter(v =>
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.plateNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t.vehicles.title}</h1>
          <p className="text-gray-600">{vehicles.length} {t.vehicles.total}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.vehicles.add}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.vehicles.search}
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
          <CardTitle>{t.vehicles.fleet}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.common.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>{t.vehicles.plateNumber}</TableHead>
                  <TableHead>{t.vehicles.type}</TableHead>
                  <TableHead>{t.vehicles.year}</TableHead>
                  <TableHead>{t.vehicles.mileage}</TableHead>
                  <TableHead>{t.vehicles.assignedInstructor}</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-semibold">
                        {vehicle.plateNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(vehicle.type)}
                    </TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>
                      {vehicle.mileage.toLocaleString('fr-FR')} km
                    </TableCell>
                    <TableCell>
                      {vehicle.instructor ? (
                        <span className="text-sm">
                          {vehicle.instructor.user.firstName} {vehicle.instructor.user.lastName}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {vehicle._count?.lessons || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(vehicle.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" title={t.vehicles.maintenance}>
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t.common.view}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t.common.edit}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t.common.delete}>
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
    </div>
  )
}
