'use client'

import { useState, useEffect, useRef } from 'react'
import Draggable, { DraggableEventHandler } from 'react-draggable'

interface Command {
  command: string
  output: string
  isTyping?: boolean
  typedOutput?: string
}

interface TerminalProps {
  onClose?: () => void;
  initialPosition?: { x: number; y: number };
  defaultIsMaximized?: boolean;
  defaultIsMinimized?: boolean;
  onPositionChange?: (x: number, y: number) => void;
  onMaximize?: (isMaximized: boolean) => void;
  onMinimize?: (isMinimized: boolean) => void;
}

const TYPING_SPEED = 35
const COMMAND_DELAY = 500
const LINE_DELAY = 150
const INITIAL_MESSAGE = `┌──(kali㉿enes-bas)-[~]
└─$ Terminal Portfolio v1.0.0
[*] Komutları görmek için 'help' yazın.`

const COMMANDS: Record<string, string> = {
  'help': `[+] Mevcut komutlar:
  
[*] help     : Bu yardım mesajını gösterir
[*] about    : Hakkımda bilgi
[*] skills   : Yeteneklerim
[*] exp      : İş deneyimim
[*] edu      : Eğitim bilgilerim
[*] contact  : İletişim bilgilerim
[*] clear    : Terminali temizler`,

  'about': `[*] Kimlik Taraması Başlatılıyor...
[+] Bilgiler Bulundu:

[*] İsim: Enes Baş
[*] Rol: Full Stack Developer
[*] Uzmanlık: Modern web ve mobil uygulamalar geliştirme
[*] İlgi Alanları: Frontend, Backend, Yapay Zeka
[*] Tech Stack: React, Next.js, Node.js, AI Integration`,

  'skills': `[*] Yetenek Taraması Başlatılıyor...
[+] Yetenekler Tespit Edildi:

[*] Frontend Geliştirme:
  └─⫸ Modern JavaScript (ES6+) ve TypeScript
  └─⫸ React, Next.js ve Vue.js ile SPA/SSR
  └─⫸ TailwindCSS, SASS ve CSS Modules
  └─⫸ State yönetimi (Redux, Zustand, Context API)
  └─⫸ Test yazımı (Jest, React Testing Library)

[*] Backend Geliştirme:
  └─⫸ Node.js ve Express.js ile RESTful API
  └─⫸ GraphQL API tasarımı ve implementasyonu
  └─⫸ Mikroservis mimarisi ve Docker
  └─⫸ AWS servisleri (EC2, S3, Lambda, RDS)
  └─⫸ API güvenliği ve performans optimizasyonu

[*] Mobil Geliştirme:
  └─⫸ React Native ile cross-platform geliştirme
  └─⫸ Native modül entegrasyonu
  └─⫸ Push notification ve real-time veri
  └─⫸ Offline-first ve local storage
  └─⫸ App Store ve Play Store süreçleri

[*] Veritabanı & DevOps:
  └─⫸ PostgreSQL ve MongoDB tasarımı
  └─⫸ Firebase ve Supabase
  └─⫸ CI/CD pipeline (GitHub Actions)
  └─⫸ Kubernetes ile konteyner orkestrasyon
  └─⫸ Monitoring ve logging (ELK Stack)

[*] Yapay Zeka & ML:
  └─⫸ TensorFlow ve PyTorch ile derin öğrenme
  └─⫸ Doğal dil işleme ve bilgisayarlı görü
  └─⫸ ML modellerinin web entegrasyonu
  └─⫸ Veri analizi ve görselleştirme
  └─⫸ Model optimizasyonu ve deployment`,

  'exp': `[*] Deneyim Taraması Başlatılıyor...
[+] Deneyimler Bulundu:

[*] Yazılım Geliştirme
[*] Pozisyon: Freelancer
[*] Süre: 2022 - Günümüz
[*] Görevler:
  └─⫸ Web uygulamaları geliştirme
  └─⫸ Modern teknolojiler kullanımı
  └─⫸ Yapay zeka entegrasyonları
  └─⫸ Next.js, React, TypeScript, AI

[*] Web Geliştirme
[*] Pozisyon: Kişisel Projeler
[*] Süre: 2021 - 2022
[*] Görevler:
  └─⫸ Frontend geliştirme
  └─⫸ Responsive tasarım
  └─⫸ Kullanıcı deneyimi
  └─⫸ HTML, CSS, JavaScript, React`,

  'edu': `[*] Eğitim Geçmişi Taranıyor...
[+] Kayıtlar Bulundu:

[*] Lise Eğitimi
[*] Kurum: Mustafa Barut Anadolu Lisesi
[*] Dönem: 2023 - 2027
[*] Bölüm: Sayısal

[*] Ortaokul Eğitimi
[*] Kurum: TOKİ Avrupa Konutları Ortaokulu
[*] Dönem: 2019 - 2023`,

  'contact': `[*] İletişim Bilgileri Taranıyor...
[+] Bilgiler Bulundu:

[*] Website  : enesbas.vercel.app
[*] Portfolio: enesbas.vercel.app/about
[*] GitHub   : github.com/enesbass
[*] LinkedIn : linkedin.com/in/enes-baş-8430b81b1`,

  'clear': 'CLEAR'
}

export default function Terminal({ 
  onClose,
  initialPosition,
  defaultIsMaximized = false,
  defaultIsMinimized = false,
  onPositionChange,
  onMaximize,
  onMinimize
}: TerminalProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Command[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [currentPosition, setCurrentPosition] = useState(initialPosition || { x: 0, y: 0 })
  const [prevSize, setPrevSize] = useState({ x: 0, y: 0, width: 800, height: 400 })
  const [isMaximizedState, setIsMaximizedState] = useState(defaultIsMaximized)
  const [isMinimizedState, setIsMinimizedState] = useState(defaultIsMinimized)
  const [isVisible, setIsVisible] = useState(true)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  // Başlangıç mesajı animasyonu
  useEffect(() => {
    let isMounted = true
    let currentText = ''
    let currentIndex = 0

    const typeChar = () => {
      if (!isMounted) return
      
      if (currentIndex < INITIAL_MESSAGE.length) {
        currentText += INITIAL_MESSAGE[currentIndex]
        setWelcomeMessage(currentText)
        currentIndex++
        setTimeout(typeChar, TYPING_SPEED)
      }
    }

    typeChar()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [history])

  const handleDrag: DraggableEventHandler = (_e, data) => {
    const newPosition = { x: data.x, y: data.y }
    setCurrentPosition(newPosition)
    onPositionChange?.(newPosition.x, newPosition.y)
  }

  const handleMaximize = () => {
    if (isMaximizedState) {
      setCurrentPosition({ x: prevSize.x, y: prevSize.y })
      setIsMaximizedState(false)
      onMaximize?.(false)
    } else {
      setPrevSize({
        x: currentPosition.x,
        y: currentPosition.y,
        width: 800,
        height: 400
      })
      setCurrentPosition({ x: 0, y: 0 })
      setIsMaximizedState(true)
      onMaximize?.(true)
    }
  }

  const handleMinimize = () => {
    const newIsMinimized = !isMinimizedState
    setIsMinimizedState(newIsMinimized)
    onMinimize?.(newIsMinimized)
  }

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return
    
    const command = input.trim().toLowerCase()
    setInput('')
    
    if (command === 'clear') {
      setHistory([])
      return
    }

    setIsProcessing(true)
    const newCommand: Command = {
      command: input,
      output: COMMANDS[command] || `[-] Komut bulunamadı: ${command}\n[*] Kullanılabilir komutları görmek için 'help' yazın.`,
      isTyping: true,
      typedOutput: ''
    }
    
    setHistory(prev => [...prev, newCommand])
    
    const typeOutput = (index: number) => {
      setHistory(prev => {
        if (!prev[index] || !prev[index].isTyping) return prev
        
        const command = prev[index]
        const output = command.output
        const currentTyped = command.typedOutput || ''
        
        if (currentTyped.length < output.length) {
          const newTyped = output.slice(0, currentTyped.length + 1)
          const newHistory = [...prev]
          newHistory[index] = {
            ...command,
            typedOutput: newTyped
          }
          
          const nextChar = output[currentTyped.length]
          const delay = nextChar === '\n' ? LINE_DELAY : TYPING_SPEED
          
          setTimeout(() => typeOutput(index), delay)
          return newHistory
        } else {
          const newHistory = [...prev]
          newHistory[index] = {
            ...command,
            isTyping: false
          }
          setIsProcessing(false)
          return newHistory
        }
      })
    }
    
    setTimeout(() => typeOutput(history.length), COMMAND_DELAY)
  }

  if (!isVisible) return null

  return (
    <Draggable
      handle=".terminal-header"
      position={currentPosition}
      onDrag={handleDrag}
      nodeRef={nodeRef}
      disabled={isMaximizedState}
    >
      <div 
        ref={nodeRef}
        className={`terminal-window bg-black/90 backdrop-blur-sm text-[#00FF41] font-mono 
          ${isMaximizedState ? 'w-full h-full' : 'w-full md:w-[800px]'} 
          ${isMinimizedState ? 'h-[40px] overflow-hidden' : 'h-[calc(100vh-80px)] md:h-[500px]'}`}
      >
        {/* Terminal Başlığı */}
        <div className="terminal-header h-8 md:h-10 bg-[#1A1A1A] flex items-center justify-between px-2 md:px-4 cursor-move">
          <div className="flex items-center space-x-1 md:space-x-2">
            <button 
              className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500 hover:bg-red-600"
              onClick={handleClose}
            />
            <button 
              className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500 hover:bg-yellow-600"
              onClick={handleMinimize}
            />
            <button 
              className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 hover:bg-green-600"
              onClick={handleMaximize}
            />
          </div>
          <div className="text-xs md:text-sm text-gray-400">Terminal</div>
          <div className="w-16 md:w-20"></div>
        </div>

        {/* Terminal İçeriği */}
        <div 
          ref={containerRef}
          className="terminal-body h-[calc(100%-2rem)] md:h-[calc(100%-2.5rem)] overflow-auto p-2 md:p-4 font-mono text-xs md:text-sm"
        >
          {welcomeMessage && (
            <p className="mb-4">
              {welcomeMessage}
              {welcomeMessage.length < INITIAL_MESSAGE.length && (
                <span className="inline-block w-2 h-4 ml-1 bg-green-400 animate-pulse" />
              )}
            </p>
          )}

          {history.map((item, i) => (
            <div key={i} className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[#00FF41]">┌──(</span>
                <span className="text-red-500">kali㉿enes-bas</span>
                <span className="text-[#00FF41]">)-[</span>
                <span className="text-blue-500">~</span>
                <span className="text-[#00FF41]">]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00FF41]">└─$</span>
                <span className="text-white ml-1">{item.command}</span>
              </div>
              {item.output && (
                <pre className="mt-2 whitespace-pre-wrap">
                  {item.isTyping ? item.typedOutput : item.output}
                  {item.isTyping && (
                    <span className="inline-block w-2 h-4 ml-1 bg-[#00FF41] animate-pulse" />
                  )}
                </pre>
              )}
            </div>
          ))}

          {!isProcessing && (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-2">
                <span className="text-[#00FF41]">┌──(</span>
                <span className="text-red-500">kali㉿enes-bas</span>
                <span className="text-[#00FF41]">)-[</span>
                <span className="text-blue-500">~</span>
                <span className="text-[#00FF41]">]</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00FF41]">└─$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white ml-1"
                  autoFocus
                  disabled={isProcessing}
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </Draggable>
  )
} 