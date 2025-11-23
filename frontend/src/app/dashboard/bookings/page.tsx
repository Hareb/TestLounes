'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/i18n-context'
import { bookingService, instructorService } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function BookingsPage() {
  const { t } = useTranslation()
  const [bookings, setBookings] = useState<any[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedInstructor, setSelectedInstructor] = useState<string>('')
  const [bookingForm, setBookingForm] = useState({
    type: 'DRIVE',
    duration: 1,
    studentNotes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedDate, selectedInstructor])

  const fetchData = async () => {
    try {
      const role = localStorage.getItem('userRole') || 'STUDENT'
      setUserRole(role)

      // Fetch bookings
      const bookingsRes = await bookingService.getAll()
      setBookings(bookingsRes.data.data || [])

      // Fetch instructors
      const instructorsRes = await instructorService.getAll()
      setInstructors(instructorsRes.data.data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const params: any = { date: selectedDate }
      if (selectedInstructor) params.instructorId = selectedInstructor
      if (bookingForm.type) params.type = bookingForm.type

      const slotsRes = await bookingService.getAvailableSlots(params)
      setAvailableSlots(slotsRes.data.data || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, any> = {
      PENDING: {
        variant: 'secondary',
        label: t.bookings.statuses.PENDING,
        icon: Clock,
        color: 'text-yellow-600',
      },
      CONFIRMED: {
        variant: 'default',
        label: t.bookings.statuses.CONFIRMED,
        icon: CheckCircle,
        color: 'text-blue-600',
      },
      COMPLETED: {
        variant: 'default',
        label: t.bookings.statuses.COMPLETED,
        icon: CheckCircle,
        color: 'text-green-600',
      },
      CANCELLED: {
        variant: 'destructive',
        label: t.bookings.statuses.CANCELLED,
        icon: XCircle,
        color: 'text-red-600',
      },
      NO_SHOW: {
        variant: 'destructive',
        label: t.bookings.statuses.NO_SHOW,
        icon: AlertCircle,
        color: 'text-orange-600',
      },
    }

    const config = configs[status] || configs.PENDING
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const handleCreateBooking = async (slot: any) => {
    try {
      const studentId = 'student-123' // TODO: Get from actual auth
      const data = {
        studentId,
        instructorId: selectedInstructor || null,
        type: bookingForm.type,
        startTime: slot.startTime,
        duration: bookingForm.duration,
        studentNotes: bookingForm.studentNotes,
      }

      await bookingService.create(data)
      alert('Réservation créée avec succès !')
      fetchData()
      fetchAvailableSlots()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la réservation')
    }
  }

  const handleConfirm = async (bookingId: string) => {
    try {
      await bookingService.confirm(bookingId, {})
      alert('Réservation confirmée !')
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur')
    }
  }

  const handleCancel = async (bookingId: string) => {
    const reason = prompt('Raison de l\'annulation :')
    if (!reason) return

    try {
      await bookingService.cancel(bookingId, { cancelReason: reason })
      alert('Réservation annulée')
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur')
    }
  }

  const handleConvertToLesson = async (bookingId: string) => {
    if (!confirm('Convertir cette réservation en leçon ?')) return

    try {
      await bookingService.convertToLesson(bookingId)
      alert('Réservation convertie en leçon !')
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur')
    }
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
      <div>
        <h1 className="text-3xl font-bold">{t.bookings.title}</h1>
        <p className="text-gray-500 mt-1">
          {bookings.length} {t.bookings.total}
        </p>
      </div>

      <Tabs defaultValue={userRole === 'STUDENT' ? 'book' : 'list'} className="space-y-4">
        <TabsList>
          {userRole === 'STUDENT' && <TabsTrigger value="book">{t.bookings.book}</TabsTrigger>}
          <TabsTrigger value="list">Mes {t.bookings.title}</TabsTrigger>
        </TabsList>

        {/* Book a Slot Tab (Student) */}
        {userRole === 'STUDENT' && (
          <TabsContent value="book" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.bookings.book}</CardTitle>
                  <CardDescription>Sélectionnez vos préférences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t.bookings.selectDate}</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type de leçon</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={bookingForm.type}
                      onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
                    >
                      <option value="DRIVE">Conduite</option>
                      <option value="CODE">Code</option>
                      <option value="EVALUATION">Évaluation</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.bookings.selectInstructor} (optionnel)</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={selectedInstructor}
                      onChange={(e) => setSelectedInstructor(e.target.value)}
                    >
                      <option value="">Tous les moniteurs</option>
                      {instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.user.firstName} {instructor.user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.bookings.duration}</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={bookingForm.duration}
                      onChange={(e) => setBookingForm({ ...bookingForm, duration: Number(e.target.value) })}
                    >
                      <option value={1}>1 heure</option>
                      <option value={1.5}>1h30</option>
                      <option value={2}>2 heures</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.bookings.studentNotes}</Label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                      placeholder="Notes ou demandes particulières..."
                      value={bookingForm.studentNotes}
                      onChange={(e) => setBookingForm({ ...bookingForm, studentNotes: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Available Slots */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.bookings.availableSlots}</CardTitle>
                  <CardDescription>
                    {selectedDate && new Date(selectedDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableSlots.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">{t.bookings.noSlotsAvailable}</p>
                    ) : (
                      availableSlots.map((slot, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg flex justify-between items-center ${
                            slot.available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {new Date(slot.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              {' - '}
                              {new Date(slot.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {slot.available ? (
                            <Button size="sm" onClick={() => handleCreateBooking(slot)}>
                              Réserver
                            </Button>
                          ) : (
                            <Badge variant="secondary">Occupé</Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* My Bookings List */}
        <TabsContent value="list" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500">{t.common.noData}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {new Date(booking.startTime).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </CardTitle>
                        <CardDescription>
                          {new Date(booking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(booking.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' • '}
                          {booking.duration}h
                        </CardDescription>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium">{booking.type}</p>
                      </div>
                      {booking.instructor && (
                        <div>
                          <span className="text-gray-500">{t.bookings.instructor}:</span>
                          <p className="font-medium">
                            {booking.instructor.user.firstName} {booking.instructor.user.lastName}
                          </p>
                        </div>
                      )}
                      {booking.student && userRole !== 'STUDENT' && (
                        <div>
                          <span className="text-gray-500">Élève:</span>
                          <p className="font-medium">
                            {booking.student.user.firstName} {booking.student.user.lastName}
                          </p>
                        </div>
                      )}
                      {booking.vehicle && (
                        <div>
                          <span className="text-gray-500">Véhicule:</span>
                          <p className="font-medium">
                            {booking.vehicle.brand} {booking.vehicle.model}
                          </p>
                        </div>
                      )}
                    </div>

                    {booking.studentNotes && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-gray-500">{t.bookings.studentNotes}:</span>
                        <p className="text-sm mt-1">{booking.studentNotes}</p>
                      </div>
                    )}

                    {booking.adminNotes && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-gray-500">{t.bookings.adminNotes}:</span>
                        <p className="text-sm mt-1">{booking.adminNotes}</p>
                      </div>
                    )}

                    {booking.cancellationDeadline && booking.status === 'PENDING' && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-gray-500">{t.bookings.cancelDeadline}:</span>
                        <p className="text-sm mt-1">
                          {new Date(booking.cancellationDeadline).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      {booking.status === 'PENDING' && (userRole === 'ADMIN' || userRole === 'INSTRUCTOR') && (
                        <Button size="sm" onClick={() => handleConfirm(booking.id)}>
                          {t.common.confirm}
                        </Button>
                      )}
                      {booking.status === 'CONFIRMED' && (userRole === 'ADMIN' || userRole === 'INSTRUCTOR') && (
                        <Button size="sm" variant="outline" onClick={() => handleConvertToLesson(booking.id)}>
                          Convertir en leçon
                        </Button>
                      )}
                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                        <Button size="sm" variant="destructive" onClick={() => handleCancel(booking.id)}>
                          {t.common.cancel}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
