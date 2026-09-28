import { useEffect, useRef } from "react"

/**
 * Brand starfield backdrop — the Prioritech mark IS a shooting star (a 4-point
 * amber star with a long arcing tail), so this canvas is the living version of
 * the logo:
 *
 *  - a twinkling, mouse-parallaxed starfield in three depth layers
 *  - shooting stars that fall diagonally with tapered tails
 *  - a slow "hero" star that rises to the upper-left on a gentle arc — the
 *    exact vector of the swoosh in the mark — trailing sparks
 *
 * Performance/a11y contract (AGENTS.md): single canvas, DPR capped at 2,
 * ~1 star per 11k px², rAF paused when the tab is hidden, and with
 * prefers-reduced-motion the whole scene renders once as a static frame.
 */

type Star = { x: number; y: number; r: number; base: number; phase: number; speed: number; depth: number }
type Spark = { x: number; y: number; vx: number; vy: number; life: number; ttl: number }
type Trail = { x: number; y: number }
type Streak = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hero: boolean
  age: number
  ttl: number
  trail: Trail[]
  curve: number
}

const GOLD = "#f9b110"
const GOLD_BRIGHT = "#ffc94a"
const CREAM = "#f6f5f0"

/** The brand's 4-point star: sharp tips, concave flanks. */
function starPath(ctx: CanvasRenderingContext2D, R: number) {
  const r = R * 0.26
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i - Math.PI / 2 // start at top tip
    const ax = Math.cos(a) * R
    const ay = Math.sin(a) * R
    if (i === 0) ctx.moveTo(ax, ay)
    else ctx.lineTo(ax, ay)
    const mid = a + Math.PI / 4
    ctx.quadraticCurveTo(Math.cos(mid) * r, Math.sin(mid) * r, Math.cos(a + Math.PI / 2) * R, Math.sin(a + Math.PI / 2) * R)
  }
  ctx.closePath()
}

export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let stars: Star[] = []
    let streaks: Streak[] = []
    let sparks: Spark[] = []
    let nextStreakAt = 1200
    let streakCount = 4 // so the very first event is the rising brand star
    let raf = 0
    let last = performance.now()
    let t = 0
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    const build = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(260, Math.max(90, Math.floor((w * h) / 6500)))
      stars = Array.from({ length: count }, () => {
        const depth = Math.random()
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.5 + depth * 1.4,
          base: 0.25 + depth * 0.5,
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.4, 1.4),
          depth,
        }
      })
    }

    const spawnStreak = (hero: boolean): Streak => {
      streakCount += 1
      if (hero) {
        // the brand vector: rising to the upper-left, long arcing tail
        const speed = rand(260, 360)
        const ang = Math.PI + rand(0.35, 0.55) // up-left
        return {
          x: rand(w * 0.55, w * 1.1),
          y: rand(h * 0.55, h * 1.15),
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          size: rand(15, 22),
          hero: true,
          age: 0,
          ttl: rand(4.2, 5.6),
          trail: [],
          curve: rand(0.16, 0.3),
        }
      }
      const speed = rand(520, 780)
      const ang = rand(0.55, 0.95) // down-right
      return {
        x: rand(-0.1, 0.75) * w,
        y: rand(-0.25, 0.35) * h,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        size: rand(3.5, 6),
        hero: false,
        age: 0,
        ttl: rand(1.1, 1.7),
        trail: [],
        curve: rand(-0.05, 0.05),
      }
    }

    const drawStars = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04
      for (const s of stars) {
        const tw = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase)
        const px = s.x + mouse.x * (4 + s.depth * 14)
        const py = s.y + mouse.y * (4 + s.depth * 14)
        ctx.globalAlpha = s.base * tw
        ctx.fillStyle = s.depth > 0.75 ? CREAM : s.depth > 0.4 ? "#d9cfae" : "#8f8c80"
        ctx.beginPath()
        ctx.arc(px, py, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const drawStreak = (st: Streak) => {
      // tapered tail from trail history
      const n = st.trail.length
      for (let i = 1; i < n; i++) {
        const a = (i / n) ** 1.6
        ctx.strokeStyle = st.hero ? GOLD : GOLD_BRIGHT
        ctx.globalAlpha = a * (st.hero ? 0.5 : 0.4)
        ctx.lineWidth = (st.hero ? 3.2 : 1.6) * a + 0.2
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(st.trail[i - 1].x, st.trail[i - 1].y)
        ctx.lineTo(st.trail[i].x, st.trail[i].y)
        ctx.stroke()
      }
      // star head
      const fade = Math.min(1, st.age / 0.25) * Math.min(1, (st.ttl - st.age) / 0.4)
      ctx.globalAlpha = fade
      if (st.hero) {
        ctx.shadowColor = GOLD
        ctx.shadowBlur = 42
      }
      ctx.save()
      ctx.translate(st.x, st.y)
      ctx.rotate(st.hero ? -0.35 : Math.atan2(st.vy, st.vx) + Math.PI / 2)
      ctx.fillStyle = st.hero ? GOLD : GOLD_BRIGHT
      starPath(ctx, st.size * fade)
      ctx.fill()
      ctx.restore()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    }

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      ctx.clearRect(0, 0, w, h)
      drawStars()

      // shooting stars — punctuation, not confetti (kept lively, not constant)
      if (t * 1000 > nextStreakAt) {
        const hero = streakCount % 4 === 3
        streaks.push(spawnStreak(hero))
        nextStreakAt = t * 1000 + (hero ? rand(5200, 8200) : rand(1800, 3400))
      }
      // slow ambient drift toward the upper-left, like the sky turning
      for (const s of stars) {
        s.x -= (1 + s.depth * 4) * dt
        s.y -= (0.4 + s.depth * 1.6) * dt
        if (s.x < -4) s.x = w + 4
        if (s.y < -4) s.y = h + 4
      }

      streaks = streaks.filter((st) => st.age < st.ttl && st.x > -160 && st.x < w + 160 && st.y > -160 && st.y < h + 160)
      for (const st of streaks) {
        st.age += dt
        // hero stars bend their path like the logo swoosh
        const rot = st.curve * dt
        const cos = Math.cos(rot)
        const sin = Math.sin(rot)
        const nvx = st.vx * cos - st.vy * sin
        st.vy = st.vx * sin + st.vy * cos
        st.vx = nvx
        st.x += st.vx * dt
        st.y += st.vy * dt
        st.trail.push({ x: st.x, y: st.y })
        const max = st.hero ? 140 : 44
        if (st.trail.length > max) st.trail.shift()
        if (st.hero && Math.random() < 0.7) {
          sparks.push({
            x: st.x + rand(-4, 4),
            y: st.y + rand(-4, 4),
            vx: -st.vx * rand(0.02, 0.12) + rand(-18, 18),
            vy: -st.vy * rand(0.02, 0.12) + rand(-18, 18),
            life: 0,
            ttl: rand(0.35, 0.8),
          })
        }
        drawStreak(st)
      }

      sparks = sparks.filter((p) => (p.life += dt) < p.ttl)
      for (const p of sparks) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        ctx.globalAlpha = (1 - p.life / p.ttl) * 0.8
        ctx.fillStyle = GOLD_BRIGHT
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(step)
    }

    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else if (!reduced) {
        last = performance.now()
        raf = requestAnimationFrame(step)
      }
    }

    build()
    if (reduced) {
      // one composed static frame: starfield + a brand swoosh in open sky
      drawStars()
      const hero = spawnStreak(true)
      hero.x = w * 0.82
      hero.y = h * 0.14
      hero.age = hero.ttl / 2
      for (let i = 0; i < 60; i++) {
        hero.trail.push({ x: hero.x + i * 5.6, y: hero.y + i * 3.4 })
      }
      drawStreak(hero)
    } else {
      window.addEventListener("pointermove", onMove)
      document.addEventListener("visibilitychange", onVisibility)
      raf = requestAnimationFrame(step)
    }
    window.addEventListener("resize", build)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", build)
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return <canvas ref={ref} className="starfield" aria-hidden="true" />
}
