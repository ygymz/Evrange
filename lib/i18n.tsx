'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'tr'

type Translations = Record<string, string>

const en: Translations = {
  // layout/page.tsx
  'app.title': 'EV Range Hero',
  'app.subtitle': 'Real-World Calculator',
  'app.reset': 'Reset',
  'section.vehicle': 'Vehicle',
  'section.speedTemp': 'Speed & Temperature',
  'section.drivingMix': 'Driving Mix',
  'section.envLoad': 'Environment & Load',
  'badge.total100': 'Must total 100%',
  'footer.disclaimer': 'All calculations are estimates based on physics-based aerodynamic and resistance modeling. Actual range varies with driving style and road conditions.',
  'footer.credits': 'EV Range Hero · Physics-based range modeling',
  'sidebar.activeConditions': 'Active Conditions',
  
  // Mix
  'mix.city': 'City',
  'mix.city.sub': 'Regen braking',
  'mix.city.badge': 'Regen',
  'mix.highway': 'Highway',
  'mix.highway.sub': 'Aero drag',
  'mix.highway.badge': 'Aero',
  'mix.rough': 'Rough Road',
  'mix.rough.sub': 'Resistance',
  'mix.rough.badge': 'Resist.',
  'mix.total.ok': 'Total: 100%',
  'mix.total.error': 'Total: {val}% — must equal 100%',

  // FactorControls
  'factor.climate': 'Climate Control',
  'factor.climate.on': 'AC/Heat active (~0.8–3 kW)',
  'factor.climate.off': 'Off',
  'factor.load': 'Extra Load',
  'factor.load.empty': '0 kg (empty)',
  'factor.load.full': '300 kg (full load)',
  'factor.rims': 'Rim Size',
  'factor.rims.18': 'Efficient',
  'factor.rims.19': 'Standard',
  'factor.rims.20': 'Performance',

  // RangeDisplay
  'range.estimated': 'Estimated Range',
  'range.ideal': 'Ideal',
  'range.utilization': 'Utilization',
  'range.rating': 'Rating',
  'rating.Excellent': 'Excellent',
  'rating.Good': 'Good',
  'rating.Fair': 'Fair',
  'rating.Poor': 'Poor',
  
  // Common terms / conditions
  'term.speed': 'Speed',
  'term.temp': 'Temp',
  'term.city': 'City',
  'term.highway': 'Highway',
  'term.load': 'Load',
  'term.climate': 'Climate',
  'term.rims': 'Rims',
  'term.on': 'On',
  'term.off': 'Off'
}

const tr: Translations = {
  'app.title': 'EV Range Hero',
  'app.subtitle': 'Gerçek Dünya Hesaplayıcısı',
  'app.reset': 'Sıfırla',
  'section.vehicle': 'Araç',
  'section.speedTemp': 'Hız ve Sıcaklık',
  'section.drivingMix': 'Sürüş Dağılımı',
  'section.envLoad': 'Çevre ve Yük',
  'badge.total100': 'Toplam 100% olmalı',
  'footer.disclaimer': 'Tüm hesaplamalar aerodinamik ve fizik tabanlı direnç modellemelerine dayalı tahminlerdir. Gerçek menzil sürüş stiline ve yol koşullarına göre değişiklik gösterir.',
  'footer.credits': 'EV Range Hero · Fizik tabanlı menzil hesaplama',
  'sidebar.activeConditions': 'Aktif Koşullar',
  
  'mix.city': 'Şehir İçi',
  'mix.city.sub': 'Fren geri kazanımı',
  'mix.city.badge': 'Regen',
  'mix.highway': 'Otoyol',
  'mix.highway.sub': 'Hava sürtünmesi',
  'mix.highway.badge': 'Aero',
  'mix.rough': 'Bozuk Yol',
  'mix.rough.sub': 'Yuvarlanma',
  'mix.rough.badge': 'Direnç',
  'mix.total.ok': 'Toplam: 100%',
  'mix.total.error': 'Toplam: {val}% — 100% olmalı',

  'factor.climate': 'Klima / Isıtma',
  'factor.climate.on': 'Klima/Isıtma aktif (~0.8-3 kW)',
  'factor.climate.off': 'Kapalı',
  'factor.load': 'Ek Yük',
  'factor.load.empty': '0 kg (boş)',
  'factor.load.full': '300 kg (tam yük)',
  'factor.rims': 'Jant Boyutu',
  'factor.rims.18': 'Verimli',
  'factor.rims.19': 'Standart',
  'factor.rims.20': 'Performans',

  'range.estimated': 'Tahmini Menzil',
  'range.ideal': 'İdeal',
  'range.utilization': 'Kullanım',
  'range.rating': 'Derece',
  'rating.Excellent': 'Mükemmel',
  'rating.Good': 'İyi',
  'rating.Fair': 'Orta',
  'rating.Poor': 'Zayıf',

  'term.speed': 'Hız',
  'term.temp': 'Sıcaklık',
  'term.city': 'Şehir İçi',
  'term.highway': 'Otoyol',
  'term.load': 'Yük',
  'term.climate': 'Klima',
  'term.rims': 'Jant',
  'term.on': 'Açık',
  'term.off': 'Kapalı'
}

const dictionaries = { en, tr }

interface LanguageContextProps {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const stored = localStorage.getItem('ev-range-lang') as Language
    if (stored === 'en' || stored === 'tr') {
      setLanguageState(stored)
    } else if (navigator.language.startsWith('tr')) {
      setLanguageState('tr')
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('ev-range-lang', lang)
  }

  const t = (key: string, params?: Record<string, string | number>) => {
    // Before client hydrates, default to 'en' to match server render and prevent hydration mismatch
    const dict = dictionaries[isClient ? language : 'en']
    let str = dict[key] || en[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v))
      })
    }
    return str
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
