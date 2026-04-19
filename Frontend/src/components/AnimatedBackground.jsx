import { useEffect, useRef } from 'react'

const P5_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js'
const VANTA_CDN = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js'

function loadScript(src, testFn) {
  if (typeof window !== 'undefined' && testFn()) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

const AnimatedBackground = () => {
  const vantaRef = useRef(null)
  const effectRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const initBackground = async () => {
      try {
        await loadScript(P5_CDN, () => Boolean(window.p5))
        await loadScript(VANTA_CDN, () => Boolean(window.VANTA?.TOPOLOGY))

        if (cancelled || !vantaRef.current || !window.VANTA?.TOPOLOGY) {
          return
        }

        effectRef.current = window.VANTA.TOPOLOGY({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x41387f,
          backgroundColor: 0x04050a,
        })
      } catch (error) {
        console.warn('Vanta topology background could not be loaded. Falling back to the CSS background.', error)
      }
    }

    void initBackground()

    return () => {
      cancelled = true
      effectRef.current?.destroy?.()
      effectRef.current = null
    }
  }, [])

  return <div ref={vantaRef} className="animated-bg" aria-hidden="true" />
}

export default AnimatedBackground
