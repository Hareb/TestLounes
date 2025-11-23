'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Download, Mail, Package, Calendar, Award, BookOpen, AlertTriangle } from 'lucide-react'
import { studentService, packageService, bookingService, logbookService, examService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/i18n-context'
import Link from 'next/link'

export default function StudentDetailsPage() {
  const params = useParams()
  const studentId = params.id as string
  const { t } = useTranslation()
  const [student, setStudent] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [logbook, setLogbook] = useState<any>(null)
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAllData()
  }, [studentId])

  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Fetch student data
      const studentRes = await studentService.getById(studentId)
      setStudent(studentRes.data.data)

      // Fetch packages
      try {
        const packagesRes = await packageService.getStudentPackages(studentId)
        setPackages(packagesRes.data.data || [])
      } catch (error) {
        console.error('Error fetching packages:', error)
      }

      // Fetch bookings
      try {
        const bookingsRes = await bookingService.getAll({ studentId })
        setBookings(bookingsRes.data.data || [])
      } catch (error) {
        console.error('Error fetching bookings:', error)
      }

      // Fetch logbook
      try {
        const logbookRes = await logbookService.getByStudentId(studentId)
        setLogbook(logbookRes.data.data)
      } catch (error) {
        console.error('Error fetching logbook:', error)
      }

      // Fetch exams
      try {
        const examsRes = await examService.getAll({ studentId })
        setExams(examsRes.data.data || [])
      } catch (error) {
        console.error('Error fetching exams:', error)
      }

    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails de l\'élève',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return <div className="text-center text-red-600">Élève non trouvé</div>
  }

  // Calculate hours summary from packages
  const totalCodeHours = packages.reduce((sum, p) => sum + (p.codeHoursBought - p.codeHoursUsed), 0)
  const totalDriveHours = packages.reduce((sum, p) => sum + (p.driveHoursBought - p.driveHoursUsed), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/students">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {student.user.firstName} {student.user.lastName}
            </h1>
            <p className="text-gray-600">{student.user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Envoyer Email
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Contrat PDF
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={student.status === 'ACTIVE' ? 'success' : 'outline'}>
              {student.status === 'ACTIVE' ? 'Actif' : student.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Type Formation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold">
              {student.formationType === 'AAC' ? 'Conduite Accompagnée' :
               student.formationType === 'TRADITIONAL' ? 'Classique' :
               student.formationType}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={student.codeExamPassed ? 'success' : 'warning'}>
              {student.codeExamPassed ? 'Réussi ✓' : 'En cours'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">NEPH</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono font-semibold">
              {student.neph || 'Non renseigné'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hours Summary */}
      {packages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t.packages.hoursRemaining}
                </CardTitle>
                <CardDescription>{packages.length} forfait(s) actif(s)</CardDescription>
              </div>
              <Link href="/dashboard/packages">
                <Button variant="outline" size="sm">
                  Voir forfaits
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Code</span>
                <span className={`text-lg font-bold ${totalCodeHours < 5 ? 'text-orange-600' : ''}`}>
                  {totalCodeHours}h restantes
                </span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Conduite</span>
                <span className={`text-lg font-bold ${totalDriveHours < 5 ? 'text-orange-600' : ''}`}>
                  {totalDriveHours}h restantes
                </span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="packages">Forfaits</TabsTrigger>
          <TabsTrigger value="bookings">Réservations</TabsTrigger>
          <TabsTrigger value="logbook">Livret GDE</TabsTrigger>
          <TabsTrigger value="exams">Examens</TabsTrigger>
          <TabsTrigger value="lessons">Leçons</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          {packages.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500">Aucun forfait acheté</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/packages">Acheter un forfait</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {packages.map((pkg: any) => {
                const isExpired = pkg.isExpired || (pkg.expiryDate && new Date(pkg.expiryDate) < new Date())
                const codeRemaining = pkg.codeHoursBought - pkg.codeHoursUsed
                const driveRemaining = pkg.driveHoursBought - pkg.driveHoursUsed

                return (
                  <Card key={pkg.id} className={isExpired ? 'opacity-60' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{pkg.package.name}</CardTitle>
                          <CardDescription>
                            Acheté le {new Date(pkg.purchaseDate).toLocaleDateString('fr-FR')}
                          </CardDescription>
                        </div>
                        {isExpired && <Badge variant="destructive">Expiré</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pkg.codeHoursBought > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Code</span>
                            <span className="font-semibold">{codeRemaining}h / {pkg.codeHoursBought}h</span>
                          </div>
                          <Progress value={(pkg.codeHoursUsed / pkg.codeHoursBought) * 100} />
                        </div>
                      )}
                      {pkg.driveHoursBought > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Conduite</span>
                            <span className="font-semibold">{driveRemaining}h / {pkg.driveHoursBought}h</span>
                          </div>
                          <Progress value={(pkg.driveHoursUsed / pkg.driveHoursBought) * 100} />
                        </div>
                      )}
                      <div className="pt-2 border-t text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Prix payé:</span>
                          <span className="font-semibold">{pkg.pricePaid} €</span>
                        </div>
                        {pkg.expiryDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Expire le:</span>
                            <span className={isExpired ? 'text-red-600' : ''}>
                              {new Date(pkg.expiryDate).toLocaleDateString('fr-FR')}
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

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500">Aucune réservation</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
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
                        </CardDescription>
                      </div>
                      <Badge variant={
                        booking.status === 'CONFIRMED' ? 'default' :
                        booking.status === 'PENDING' ? 'secondary' :
                        booking.status === 'COMPLETED' ? 'success' : 'destructive'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{booking.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Durée:</span>
                      <span className="font-medium">{booking.duration}h</span>
                    </div>
                    {booking.instructor && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Moniteur:</span>
                        <span className="font-medium">
                          {booking.instructor.user.firstName} {booking.instructor.user.lastName}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Logbook Tab */}
        <TabsContent value="logbook">
          {logbook ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Progression Globale</CardTitle>
                      <CardDescription>Grille GDE - 28 compétences</CardDescription>
                    </div>
                    <div className="text-3xl font-bold">{Math.round(logbook.overallProgress)}%</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={logbook.overallProgress} className="h-3" />
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {[1, 2, 3, 4].map((comp) => {
                  const validated = logbook[`comp${comp}_validated`]
                  // Calculate progress for this competence
                  let totalScore = 0
                  for (let skill = 1; skill <= 7; skill++) {
                    totalScore += logbook[`comp${comp}_skill${skill}`] || 0
                  }
                  const progress = (totalScore / 35) * 100

                  return (
                    <Card key={comp}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Compétence {comp}</CardTitle>
                          {validated && (
                            <Badge className="bg-green-600">✓ Validée</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progression</span>
                            <span className="font-semibold">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Link href="/dashboard/logbook">
                <Button className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Voir livret complet
                </Button>
              </Link>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500">Livret d'apprentissage non disponible</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-4">
          {exams.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500">Aucun examen planifié</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {exams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          {exam.type === 'CODE' ? 'Examen Code' : 'Examen Conduite'}
                        </CardTitle>
                        <CardDescription>
                          {new Date(exam.examDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        exam.status === 'PASSED' ? 'success' :
                        exam.status === 'FAILED' ? 'destructive' :
                        exam.status === 'SCHEDULED' ? 'secondary' : 'outline'
                      }>
                        {exam.status === 'PASSED' ? '✓ Réussi' :
                         exam.status === 'FAILED' ? '✗ Échoué' :
                         exam.status === 'SCHEDULED' ? 'Planifié' : exam.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {exam.examCenter && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Centre:</span>
                        <span className="font-medium">{exam.examCenter}</span>
                      </div>
                    )}
                    {exam.score !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Score:</span>
                        <span className="font-bold text-lg">{exam.score}/{exam.maxScore || 40}</span>
                      </div>
                    )}
                    {exam.convocationSent && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Mail className="h-4 w-4" />
                        <span>Convocation envoyée</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Leçons</CardTitle>
            </CardHeader>
            <CardContent>
              {student.lessons && student.lessons.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Moniteur</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.lessons.map((lesson: any) => (
                      <TableRow key={lesson.id}>
                        <TableCell>{formatDate(lesson.startTime)}</TableCell>
                        <TableCell>
                          <Badge variant={lesson.type === 'DRIVE' ? 'default' : 'secondary'}>
                            {lesson.type === 'DRIVE' ? 'Conduite' : 'Code'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lesson.instructor?.user.firstName} {lesson.instructor?.user.lastName}
                        </TableCell>
                        <TableCell>{lesson.duration}h</TableCell>
                        <TableCell>
                          <Badge variant={lesson.status === 'COMPLETED' ? 'success' : 'outline'}>
                            {lesson.status === 'COMPLETED' ? 'Terminée' : lesson.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">Aucune leçon enregistrée</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Paiements</CardTitle>
            </CardHeader>
            <CardContent>
              {student.payments && student.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.method === 'CARD' ? 'Carte' :
                             payment.method === 'CASH' ? 'Espèces' :
                             payment.method === 'TRANSFER' ? 'Virement' :
                             payment.method === 'CPF' ? 'CPF' : payment.method}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.description || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">Aucun paiement enregistré</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
