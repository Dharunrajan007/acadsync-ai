import { useEffect, useRef, useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { DotLottie } from '@lottiefiles/dotlottie-web'

// The player fetches its renderer WASM from jsDelivr by default. Point it at our
// own copy instead so the app has no third-party runtime dependency and still
// works offline or behind a strict content-security policy.
DotLottie.setWasmUrl('/dotlottie-player.wasm')

/**
 * Lottie wrapper used across AcadSync.
 *
 * Three things every animation on this site has to respect:
 *  - prefers-reduced-motion: the animation mounts on its first frame and does not play.
 *  - Off-screen cost: nothing plays until it scrolls into view.
 *  - Failure: a .lottie that will not load must never leave a blank hole in the layout,
 *    so `fallback` renders in its place.
 *
 * `src` accepts a local file under /public (default) or a remote LottieFiles URL.
 */
export default function Lottie({
  src = '/animations/international-commerce.lottie',
  loop = true,
  autoplay = true,
  speed = 1,
  className = '',
  fallback = null,
  label,
}) {
  const hostRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { rootMargin: '160px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (failed && fallback) return fallback

  return (
    <div
      ref={hostRef}
      className={className}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {inView && !failed && (
        <DotLottieReact
          src={src}
          loop={loop && !reduced}
          autoplay={autoplay && !reduced}
          speed={speed}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  )
}
