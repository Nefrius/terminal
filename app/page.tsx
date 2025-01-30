'use client'

import { useState, useEffect } from 'react'
import Terminal from '@/components/terminal'
import Navbar from '@/components/navbar'
import Loading from '@/components/loading'
import Image from 'next/image'
import bgImage from '../public/image.png'

// SVG ikonlarını içe aktar
import fileSystemIcon from '@/public/icons/file-system.svg'
import homeIcon from '@/public/icons/home.svg'
import metasploitIcon from '@/public/icons/metasploit.svg'
import trashIcon from '@/public/icons/trash.svg'

interface TerminalWindow {
  id: number;
  x: number;
  y: number;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [terminals, setTerminals] = useState<TerminalWindow[]>([])
  const [nextZIndex, setNextZIndex] = useState(2)
  const [showBackground, setShowBackground] = useState(false)
  const [showNavbar, setShowNavbar] = useState(false)
  const [showIcons, setShowIcons] = useState(false)

  const calculateCenterPosition = () => {
    if (typeof window === 'undefined') return { x: 0, y: 0 }
    
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const navbarHeight = 32

    // Mobil için tam ekran, masaüstü için 800x500
    const terminalWidth = screenWidth < 768 ? screenWidth - 40 : 800
    const terminalHeight = screenWidth < 768 ? screenHeight - navbarHeight - 40 : 500

    // Merkez hesaplama
    const centerX = (screenWidth - terminalWidth) / 2
    const centerY = (screenHeight - terminalHeight) / 2

    return {
      x: centerX,
      y: centerY
    }
  }

  // Terminal state'ini güncelleyen fonksiyon
  const updateTerminalPosition = () => {
    const position = calculateCenterPosition()
    setTerminals(prev => prev.map(terminal => {
      if (terminal.id === 1) {
        return { ...terminal, x: position.x, y: position.y }
      }
      return terminal
    }))
  }

  // Ekran boyutu değiştiğinde terminal pozisyonunu güncelle
  useEffect(() => {
    window.addEventListener('resize', updateTerminalPosition)
    return () => window.removeEventListener('resize', updateTerminalPosition)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      
      setTimeout(() => setShowBackground(true), 100)
      setTimeout(() => setShowNavbar(true), 600)
      setTimeout(() => setShowIcons(true), 1100)
      
      setTimeout(() => {
        const position = calculateCenterPosition()
        setTerminals([{
          id: 1,
          x: position.x,
          y: position.y,
          isMaximized: false,
          isMinimized: false,
          zIndex: 30
        }])
      }, 1600)
    }, 4500)

    return () => clearTimeout(timer)
  }, [])

  const addNewTerminal = () => {
    const position = calculateCenterPosition()
    const offset = terminals.length * 25
    
    setTerminals(prev => [...prev, {
      id: prev.length + 1,
      x: position.x + offset,
      y: position.y + offset,
      isMaximized: false,
      isMinimized: false,
      zIndex: nextZIndex
    }])
    setNextZIndex(prev => prev + 1)
  }

  const closeTerminal = (id: number) => {
    setTerminals(prev => prev.filter(terminal => terminal.id !== id))
  }

  const updateTerminal = (id: number, updates: Partial<TerminalWindow>) => {
    setTerminals(prev => prev.map(terminal => 
      terminal.id === id ? { ...terminal, ...updates } : terminal
    ))
  }

  const bringToFront = (id: number) => {
    setTerminals(prev => prev.map(terminal => ({
      ...terminal,
      zIndex: terminal.id === id ? nextZIndex : terminal.zIndex
    })))
    setNextZIndex(prev => prev + 1)
  }

  const desktopIcons = [
    {
      name: 'Terminal',
      icon: '/icons/terminal.svg',
      action: addNewTerminal
    },
    { 
      name: 'File System', 
      icon: fileSystemIcon, 
      action: () => {}
    },
    { 
      name: 'Home', 
      icon: homeIcon, 
      action: () => {}
    },
    { 
      name: 'Metasploit Framework', 
      icon: metasploitIcon, 
      action: () => {}
    },
    { 
      name: 'Trash', 
      icon: trashIcon, 
      action: () => {}
    }
  ]

  return (
    <main className="min-h-screen">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {/* Navbar - En üst katman */}
          <div className={`transition-opacity duration-1000 ${showNavbar ? 'opacity-100' : 'opacity-0'} z-40`}>
            <Navbar onOpenTerminal={addNewTerminal} />
          </div>
          
          {/* Arkaplan - En alt katman */}
          <div className={`fixed inset-0 -z-10 transition-opacity duration-1000 ${showBackground ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src={bgImage}
              alt="Kali Linux Background"
              fill
              className="object-cover w-full h-full"
              quality={100}
              loading="eager"
              sizes="(max-width: 768px) 100vw,
                     (max-width: 1200px) 100vw,
                     100vw"
            />
          </div>

          {/* Masaüstü İkonları - Orta katman */}
          <div className={`fixed left-4 top-12 z-20 flex flex-col space-y-4 transition-all duration-1000 ${
            showIcons ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            {desktopIcons.map((icon) => (
              <button
                key={icon.name}
                onClick={icon.action}
                className="flex flex-col items-center w-20 md:w-24 p-2 rounded hover:bg-white/10 text-white transition-colors group"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-[#2B2B2B] rounded mb-1 group-hover:bg-[#3D3D3D]">
                  <Image 
                    src={icon.icon}
                    alt={icon.name}
                    width={20}
                    height={20}
                    className="invert md:w-6 md:h-6"
                  />
                </div>
                <span className="text-[10px] md:text-xs text-center break-words w-full group-hover:text-[#00FF41]">
                  {icon.name}
                </span>
              </button>
            ))}
          </div>

          {/* Terminaller - İkonların üstünde, navbar'ın altında */}
          <div className="fixed inset-0 pointer-events-none z-30">
            {terminals.map((terminal) => (
              <div 
                key={terminal.id}
                style={{ 
                  position: 'absolute',
                  left: terminal.x,
                  top: terminal.y,
                  zIndex: terminal.zIndex,
                }}
                className="pointer-events-auto transition-all duration-500 opacity-100 translate-y-0 w-full md:w-auto"
                onClick={() => bringToFront(terminal.id)}
              >
                <Terminal 
                  onClose={() => closeTerminal(terminal.id)}
                  initialPosition={{ x: terminal.x, y: terminal.y }}
                  defaultIsMaximized={terminal.isMaximized}
                  defaultIsMinimized={terminal.isMinimized}
                  onPositionChange={(x, y) => updateTerminal(terminal.id, { x, y })}
                  onMaximize={(isMaximized) => updateTerminal(terminal.id, { isMaximized })}
                  onMinimize={(isMinimized) => updateTerminal(terminal.id, { isMinimized })}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}

