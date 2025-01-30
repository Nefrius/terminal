'use client'

import { useState, useEffect } from 'react'

interface NavbarProps {
  onOpenTerminal: () => void
}

export default function Navbar({ onOpenTerminal }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { name: 'Terminal', action: onOpenTerminal },
    { name: 'File System', action: () => {} },
    { name: 'Settings', action: () => {} },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 h-8 bg-[#1A1A1A] text-white z-50 flex items-center px-2">
      {/* Mobil Menü Butonu */}
      <button 
        className="md:hidden p-1 hover:bg-[#333333] rounded"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* Masaüstü Menü */}
      <div className="hidden md:flex items-center space-x-4">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={item.action}
            className="px-3 py-1 hover:bg-[#333333] rounded text-sm transition-colors"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Mobil Menü (Dropdown) */}
      {isMenuOpen && (
        <div className="absolute top-8 left-0 w-48 bg-[#1A1A1A] shadow-lg rounded-b md:hidden">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                item.action()
                setIsMenuOpen(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-[#333333] text-sm transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      {/* Saat - Sağ tarafta */}
      <div className="ml-auto text-sm">
        <Clock />
      </div>
    </nav>
  )
}

function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <span>
      {time.toLocaleTimeString()}
    </span>
  )
} 