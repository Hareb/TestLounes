'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Download, Mail, Phone } from 'lucide-react'
import { studentService } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function StudentDetailsPage() {
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true)
        const response = await studentService.getById(studentId)
        setStudent(response.data.data)
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

    fetchStudent()
  }, [studentId])

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

  return (
    <div className="space-y-6">
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

      {/* Tabs */}
      <Tabs defaultValue="progression" className="w-full">
        <TabsList>
          <TabsTrigger value="progression">Progression</TabsTrigger>
          <TabsTrigger value="lessons">Leçons</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="info">Informations</TabsTrigger>
        </TabsList>

        {/* Progression Tab */}
        <TabsContent value="progression" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Heures de Formation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Code de la route</span>
                  <span className="text-sm text-gray-600">
                    {student.codeHoursUsed}h / {student.codeHoursPaid}h
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${Math.min((student.codeHoursUsed / student.codeHoursPaid) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Conduite</span>
                  <span className="text-sm text-gray-600">
                    {student.driveHoursUsed}h / {student.driveHoursPaid}h
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${Math.min((student.driveHoursUsed / student.driveHoursPaid) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluations */}
          {student.evaluations && student.evaluations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dernière Évaluation</CardTitle>
                <CardDescription>
                  {formatDate(student.evaluations[0].createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Maîtrise du véhicule', score: student.evaluations[0].competence1 },
                  { name: 'Circulation routière', score: student.evaluations[0].competence2 },
                  { name: 'Conditions difficiles', score: student.evaluations[0].competence3 },
                  { name: 'Conduite autonome', score: student.evaluations[0].competence4 },
                ].map((comp, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{comp.name}</span>
                      <span className="text-sm font-medium">{comp.score}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(comp.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
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
                <p className="text-center text-gray-500 py-4">Aucune leçon enregistrée</p>
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
                      <TableHead>Description</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell>{payment.description || '-'}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Payé</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-4">Aucun paiement enregistré</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {student.documents && student.documents.length > 0 ? (
                <div className="space-y-2">
                  {student.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.type}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Aucun document</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date de naissance</p>
                  <p className="font-medium">{formatDate(student.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lieu de naissance</p>
                  <p className="font-medium">{student.placeOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {student.user.phone || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {student.user.email}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="font-medium">
                    {student.address}, {student.postalCode} {student.city}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date d&apos;inscription</p>
                  <p className="font-medium">{formatDate(student.registrationDate)}</p>
                </div>
                {student.initialEvaluation && (
                  <div>
                    <p className="text-sm text-gray-600">Évaluation initiale</p>
                    <p className="font-medium">{student.initialEvaluation}h estimées</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
