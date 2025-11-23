'use client'

import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/i18n-context'
import { Language } from '@/lib/i18n/translations'

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation()

  const toggleLanguage = () => {
    const newLang: Language = language === 'fr' ? 'en' : 'fr'
    setLanguage(newLang)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
      title={language === 'fr' ? 'Switch to English' : 'Passer en Français'}
    >
      <Globe className="h-4 w-4" />
      <span className="font-semibold uppercase">{language}</span>
    </Button>
  )
}
