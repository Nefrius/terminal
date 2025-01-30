'use client'

import { useEffect, useState } from 'react'

export default function Loading() {
  const [progress, setProgress] = useState(0)
  const [currentService, setCurrentService] = useState('')
  const [loadingDone, setLoadingDone] = useState(false)

  const services = [
    'Starting Kali Linux Desktop...',
    'Loading system configuration...',
    'Starting network services...',
    'Initializing system components...',
    'Starting PostgreSQL database...',
    'Starting Apache2 web server...',
    'Loading terminal services...',
    'Starting SSH server...',
    'Configuring network interfaces...',
    'System initialization complete.'
  ]

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < services.length) {
        setCurrentService(services[currentIndex])
        setProgress((currentIndex + 1) * (100 / services.length))
        currentIndex++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setLoadingDone(true)
        }, 500)
      }
    }, 400)

    return () => clearInterval(interval)
  }, [])

  if (loadingDone) return null

  return (
    <div className="fixed inset-0 bg-black text-[#00FF41] font-mono z-50 p-4">
      <div className="max-w-3xl mx-auto mt-10">
        <pre className="mb-8">
{`
 ██ ▄█▀    ▄▄▄       ██▓     ██▓    
 ██▄█▒    ▒████▄    ▓██▒    ▓██▒    
▓███▄░    ▒██  ▀█▄  ▒██░    ▒██░    
▓██ █▄    ░██▄▄▄▄██ ▒██░    ▒██░    
▒██▒ █▄    ▓█   ▓██▒░██████▒░██████▒
▒ ▒▒ ▓▒    ▒▒   ▓▒█░░ ▒░▓  ░░ ▒░▓  ░
░ ░▒ ▒░     ▒   ▒▒ ░░ ░ ▒  ░░ ░ ▒  ░
░ ░░ ░      ░   ▒     ░ ░     ░ ░   
░  ░            ░  ░    ░  ░    ░  ░
`}
        </pre>
        
        <div className="space-y-2">
          <div className="h-1 w-full bg-gray-800 rounded">
            <div 
              className="h-full bg-[#00FF41] rounded transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Loading... {Math.round(progress)}%</span>
            <span>{currentService}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 