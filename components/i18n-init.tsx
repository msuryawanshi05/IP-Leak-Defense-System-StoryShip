"use client"

import { useEffect } from "react"
import { initI18n } from "@/lib/i18n"

export function I18nInit() {
  useEffect(() => {
    initI18n()
  }, [])
  return null
}

