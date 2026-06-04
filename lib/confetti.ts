"use client"

import confetti from "canvas-confetti"

/** Burst of confetti from the center — used on first IP upload */
export function fireConfetti() {
  const count = 220
  const defaults = { origin: { y: 0.7 } }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  fire(0.25, { spread: 26, startVelocity: 55, colors: ["#a855f7", "#8b5cf6"] })
  fire(0.2, { spread: 60, colors: ["#22d3ee", "#06b6d4"] })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#c4b5fd", "#818cf8"] })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ["#fff", "#e2e8f0"] })
  fire(0.1, { spread: 120, startVelocity: 45, colors: ["#a855f7", "#22d3ee"] })
}

/** Subtle side cannons — used for subsequent uploads */
export function fireSideCannons() {
  const end = Date.now() + 800
  const colors = ["#a855f7", "#22d3ee", "#8b5cf6"]
  ;(function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors })
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}
