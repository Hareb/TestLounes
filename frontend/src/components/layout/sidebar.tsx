'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Car,
  Calendar,
  CreditCard,
  FileText,
  LogOut,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  role: 'ADMIN' | 'SECRETARY' | 'INSTRUCTOR' | 'STUDENT'
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Élèves', href: '/dashboard/students' },
    { icon: GraduationCap, label: 'Moniteurs', href: '/dashboard/instructors' },
    { icon: Car, label: 'Véhicules', href: '/dashboard/vehicles' },
    { icon: Calendar, label: 'Planning', href: '/dashboard/planning' },
    { icon: CreditCard, label: 'Paiements', href: '/dashboard/payments' },
    { icon: FileText, label: 'Factures', href: '/dashboard/invoices' },
  ]

  const instructorMenuItems = [
    { icon: LayoutDashboard, label: 'Mon Tableau de Bord', href: '/dashboard/instructor' },
    { icon: Calendar, label: 'Mon Planning', href: '/dashboard/instructor/planning' },
    { icon: Users, label: 'Mes Élèves', href: '/dashboard/instructor/students' },
  ]

  const studentMenuItems = [
    { icon: LayoutDashboard, label: 'Mon Tableau de Bord', href: '/dashboard/student' },
    { icon: Calendar, label: 'Mes Leçons', href: '/dashboard/student/lessons' },
    { icon: CreditCard, label: 'Mes Paiements', href: '/dashboard/student/payments' },
    { icon: FileText, label: 'Mes Documents', href: '/dashboard/student/documents' },
  ]

  const menuItems =
    role === 'ADMIN' || role === 'SECRETARY' ? adminMenuItems :
    role === 'INSTRUCTOR' ? instructorMenuItems :
    studentMenuItems

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Car className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">Auto-École</h1>
            <p className="text-xs text-gray-400">
              {role === 'ADMIN' ? 'Administrateur' :
               role === 'SECRETARY' ? 'Secrétariat' :
               role === 'INSTRUCTOR' ? 'Moniteur' :
               'Élève'}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-lg font-semibold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Paramètres</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  )
}
