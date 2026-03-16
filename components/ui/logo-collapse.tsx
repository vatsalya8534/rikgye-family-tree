"use client"

import { useEffect, useState } from "react"
import { useSidebar } from "./sidebar"
import Image from "next/image"

export function Logo() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  const [setting, setSetting] = useState<any>(null)

  const getData = async () => {
    const res = await fetch("/api/settings")
    const data = await res.json()
    if (data) setSetting(data)
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <div className="flex items-center px-2 py-2">
      {collapsed ? (
        <div className="flex w-full justify-center">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
            {setting?.logo && (
              <Image
                src={setting.logo}
                alt="Logo"
                fill
                className="object-contain"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          {setting?.logo && (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md">
              <Image
                src={setting.logo}
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
          )}
          {setting?.siteTitle && (
            <span className="truncate text-sm font-semibold">
              {setting.siteTitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}