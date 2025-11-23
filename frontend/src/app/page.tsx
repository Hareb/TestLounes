import Link from 'next/link'
import { Car, Users, Calendar, CreditCard, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Car className="w-20 h-20 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Système de Gestion d'Auto-École
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Solution complète et conforme à la réglementation française
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Inscription
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Gestion des Élèves"
            description="Inscription, dossier complet, suivi de progression, NEPH, et livret d'apprentissage numérique"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Planning Intelligent"
            description="Réservation de créneaux, gestion des moniteurs et véhicules, rappels automatiques"
          />
          <FeatureCard
            icon={<CreditCard className="w-8 h-8" />}
            title="Facturation & Paiements"
            description="Forfaits, paiements échelonnés, intégration CPF, factures conformes"
          />
          <FeatureCard
            icon={<Car className="w-8 h-8" />}
            title="Parc Automobile"
            description="Gestion des véhicules, entretien, contrôles techniques, assurances"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Statistiques Avancées"
            description="Taux de réussite, chiffre d'affaires, performance des moniteurs"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Conformité Légale"
            description="Label qualité, RGPD, contrats conformes Loi Hamon, agrément préfectoral"
          />
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Technologies Utilisées
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">Backend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Node.js + Express</li>
                <li>• PostgreSQL + Prisma ORM</li>
                <li>• TypeScript</li>
                <li>• JWT Authentication</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Frontend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Next.js 14+ (App Router)</li>
                <li>• React + TypeScript</li>
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• React Query + Zustand</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
