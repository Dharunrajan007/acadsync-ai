// Generates the small, purpose-built Lottie animations used inside the app.
// These are hand-authored rather than downloaded: each one says something about
// the screen it sits on (capacity, time, submitted, scanning), stays in the brand
// palette, and weighs a couple of KB instead of a few hundred.
//
//   node tools/make-lotties.mjs
//
// Output: public/animations/*.json

import { writeFileSync, mkdirSync } from 'node:fs'

const OUT = 'public/animations'
const FR = 60
const DUR = 120 // 2s loop

// Brand palette as Lottie normalised RGBA.
const rgb = (hex) => {
  const n = hex.replace('#', '')
  return [parseInt(n.slice(0, 2), 16) / 255, parseInt(n.slice(2, 4), 16) / 255, parseInt(n.slice(4, 6), 16) / 255, 1]
}
const C = {
  brand: rgb('#4444D6'),
  violet: rgb('#7642DA'),
  teal: rgb('#0E9BA8'),
  safe: rgb('#10906B'),
  warn: rgb('#C3820B'),
  risk: rgb('#D14343'),
  muted: rgb('#A6ACBB'),
  faint: rgb('#D8DCE6'),
}

const EASE_OUT = { i: { x: [0.32], y: [1] }, o: { x: [0.36], y: [0] } }

// ---- primitives -----------------------------------------------------------
const still = (v) => ({ a: 0, k: v })

// Keyframed scalar/vector. `frames` = [[t, value], ...]
const anim = (frames) => ({
  a: 1,
  k: frames.map(([t, s], idx) =>
    idx === frames.length - 1 ? { t, s: [].concat(s) } : { t, s: [].concat(s), ...EASE_OUT }
  ),
})

const transform = ({ p = [0, 0], a = [0, 0], s = [100, 100], r = 0, o = 100 }) => ({
  ty: 'tr',
  p: Array.isArray(p) ? still(p) : p,
  a: Array.isArray(a) ? still(a) : a,
  s: Array.isArray(s) ? still(s) : s,
  r: typeof r === 'number' ? still(r) : r,
  o: typeof o === 'number' ? still(o) : o,
  nm: 'Transform',
})

const fill = (color, opacity = 100) => ({ ty: 'fl', c: still(color), o: still(opacity), r: 1, nm: 'Fill' })
const stroke = (color, width, opacity = 100) => ({
  ty: 'st', c: still(color), o: still(opacity), w: still(width), lc: 2, lj: 2, nm: 'Stroke',
})

const rect = (size, pos = [0, 0], radius = 4) => ({
  ty: 'rc', d: 1, s: Array.isArray(size) ? still(size) : size, p: still(pos), r: still(radius), nm: 'Rect',
})
const ellipse = (size, pos = [0, 0]) => ({
  ty: 'el', d: 1, s: Array.isArray(size) ? still(size) : size, p: still(pos), nm: 'Ellipse',
})
// Open path from a list of points.
const path = (pts, closed = false) => ({
  ty: 'sh', d: 1, nm: 'Path',
  ks: still({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: closed }),
})
const trim = (endFrames) => ({ ty: 'tm', s: still(0), e: endFrames, o: still(0), m: 1, nm: 'Trim' })

const group = (items, tr = {}) => ({ ty: 'gr', it: [...items, transform(tr)], nm: 'Group' })

const layer = (ind, name, shapes, ks = {}) => ({
  ddd: 0, ind, ty: 4, nm: name, sr: 1, ao: 0,
  ks: {
    o: ks.o !== undefined ? (typeof ks.o === 'number' ? still(ks.o) : ks.o) : still(100),
    r: ks.r !== undefined ? (typeof ks.r === 'number' ? still(ks.r) : ks.r) : still(0),
    p: ks.p ? (Array.isArray(ks.p) ? still([...ks.p, 0]) : ks.p) : still([100, 100, 0]),
    a: still([0, 0, 0]),
    s: ks.s ? (Array.isArray(ks.s) ? still([...ks.s, 100]) : ks.s) : still([100, 100, 100]),
  },
  shapes, ip: 0, op: DUR, st: 0, bm: 0,
})

const doc = (name, layers, size = 200) => ({
  v: '5.7.4', fr: FR, ip: 0, op: DUR, w: size, h: size, nm: name, ddd: 0, assets: [], layers,
})

// ---------------------------------------------------------------------------
// 1. capacity-bars — three bars breathing against a baseline.
//    Used where the subject is workload volume.
// ---------------------------------------------------------------------------
const capacityBars = () => {
  const cols = [
    { x: -34, color: C.teal, peak: 46, delay: 0 },
    { x: 0, color: C.brand, peak: 70, delay: 14 },
    { x: 34, color: C.violet, peak: 34, delay: 28 },
  ]
  const layers = cols.map((c, i) => {
    const t0 = c.delay
    // Scale about the bar's bottom edge so it grows upward.
    const sy = anim([[t0, [100, 26]], [t0 + 34, [100, 100]], [t0 + 74, [100, 42]], [DUR, [100, 26]]])
    return layer(i + 1, `bar-${i}`, [
      group(
        [rect([18, c.peak], [0, -c.peak / 2], 5), fill(c.color)],
        { p: [0, 0], a: [0, 0], s: sy }
      ),
    ], { p: [100 + c.x, 138] })
  })
  // baseline
  layers.push(layer(9, 'base', [group([rect([120, 3], [0, 0], 2), fill(C.faint)])], { p: [100, 140] }))
  return doc('capacity-bars', layers)
}

// ---------------------------------------------------------------------------
// 2. clock — a sweeping hand. Used wherever the subject is available time.
// ---------------------------------------------------------------------------
const clockAnim = () => {
  const hand = layer(1, 'hand', [
    group([path([[0, 0], [0, -34]]), stroke(C.brand, 7)], { p: [0, 0] }),
  ], { p: [100, 100], r: anim([[0, 0], [DUR, 360]]) })

  const tick = layer(2, 'tick', [
    group([path([[0, 0], [0, -18]]), stroke(C.violet, 7)], { p: [0, 0] }),
  ], { p: [100, 100], r: anim([[0, 90], [DUR, 210]]) })

  const dial = layer(3, 'dial', [
    group([ellipse([116, 116]), stroke(C.faint, 7)]),
    group([ellipse([10, 10]), fill(C.brand)]),
  ], { p: [100, 100] })

  const pulse = layer(4, 'pulse', [
    group([ellipse([116, 116]), stroke(C.brand, 4)]),
  ], {
    p: [100, 100],
    s: anim([[0, [100, 100]], [70, [128, 128]], [DUR, [128, 128]]]),
    o: anim([[0, [42]], [70, [0]], [DUR, [0]]]),
  })

  return doc('clock', [hand, tick, dial, pulse])
}

// ---------------------------------------------------------------------------
// 3. check — a tick drawing itself inside a ring. Success and empty-inbox states.
// ---------------------------------------------------------------------------
const checkAnim = () => {
  const tick = layer(1, 'tick', [
    group([
      path([[-24, 2], [-7, 20], [26, -20]]),
      trim(anim([[6, [0]], [46, [100]], [DUR, [100]]])),
      stroke(C.safe, 9),
    ], { p: [0, 0] }),
  ], { p: [100, 100] })

  const ring = layer(2, 'ring', [
    group([ellipse([120, 120]), stroke(C.safe, 6, 26)]),
  ], {
    p: [100, 100],
    s: anim([[0, [72, 72]], [34, [104, 104]], [50, [100, 100]], [DUR, [100, 100]]]),
  })

  const halo = layer(3, 'halo', [group([ellipse([120, 120]), fill(C.safe, 10)])], {
    p: [100, 100],
    s: anim([[0, [70, 70]], [80, [126, 126]], [DUR, [126, 126]]]),
    o: anim([[0, [70]], [80, [0]], [DUR, [0]]]),
  })

  return doc('check', [tick, ring, halo])
}

// ---------------------------------------------------------------------------
// 4. calendar — a grid of day cells, one lighting up. Empty timeline / schedule.
// ---------------------------------------------------------------------------
const calendarAnim = () => {
  const layers = []
  let ind = 1
  const startX = 62, startY = 74, gap = 26
  const lit = [4, 9, 6, 11] // which cells pulse, in order

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c
      const order = lit.indexOf(idx)
      const isLit = order !== -1
      const t0 = order * 26
      const opacity = isLit
        ? anim([[t0, [22]], [t0 + 16, [100]], [t0 + 46, [22]], [DUR, [22]]])
        : still(22)
      const scale = isLit
        ? anim([[t0, [100, 100]], [t0 + 16, [116, 116]], [t0 + 46, [100, 100]], [DUR, [100, 100]]])
        : still([100, 100])
      layers.push(
        layer(ind++, `cell-${idx}`, [
          group([rect([18, 18], [0, 0], 5), fill(isLit ? C.brand : C.muted)], { p: [0, 0], s: scale }),
        ], { p: [startX + c * gap, startY + r * gap], o: opacity })
      )
    }
  }

  // header bar of the calendar card
  layers.push(layer(ind++, 'header', [
    group([rect([124, 10], [0, 0], 5), fill(C.violet, 60)]),
  ], { p: [100, 44] }))

  layers.push(layer(ind++, 'frame', [
    group([rect([150, 132], [0, 0], 14), stroke(C.faint, 5)]),
  ], { p: [100, 100] }))

  return doc('calendar', layers)
}

// ---------------------------------------------------------------------------
// 5. scan — a rotating arc over a dotted field. The capacity-analysis wait state.
// ---------------------------------------------------------------------------
const scanAnim = () => {
  const layers = []
  let ind = 1

  layers.push(layer(ind++, 'sweep', [
    group([
      path([[0, -46], [32, -32], [46, 0]]),
      stroke(C.violet, 8),
    ], { p: [0, 0] }),
  ], { p: [100, 100], r: anim([[0, 0], [DUR, 360]]) }))

  layers.push(layer(ind++, 'track', [group([ellipse([92, 92]), stroke(C.faint, 8)])], { p: [100, 100] }))

  // three sampled points that blink as the sweep passes
  const dots = [[100, 54, 0], [140, 118, 40], [62, 122, 80]]
  dots.forEach(([x, y, t0], i) => {
    layers.push(layer(ind++, `dot-${i}`, [
      group([ellipse([13, 13]), fill(C.brand)], {
        s: anim([[t0, [60, 60]], [t0 + 14, [118, 118]], [t0 + 34, [60, 60]], [DUR, [60, 60]]]),
      }),
    ], { p: [x, y], o: anim([[t0, [30]], [t0 + 14, [100]], [t0 + 34, [30]], [DUR, [30]]]) }))
  })

  return doc('scan', layers)
}

// ---------------------------------------------------------------------------
// 6. search — a magnifier drifting over a list. No-results state.
// ---------------------------------------------------------------------------
const searchAnim = () => {
  const layers = []
  let ind = 1

  const drift = anim([[0, [86, 96]], [40, [116, 108]], [80, [92, 116]], [DUR, [86, 96]]])

  layers.push(layer(ind++, 'glass', [
    group([ellipse([54, 54]), stroke(C.brand, 8)]),
    group([path([[19, 19], [34, 34]]), stroke(C.brand, 8)]),
  ], { p: drift }))

  // list rows behind it
  const rows = [[70, 150], [92, 118], [114, 138]]
  rows.forEach(([y, w], i) => {
    layers.push(layer(ind++, `row-${i}`, [
      group([rect([w, 11], [0, 0], 5), fill(C.faint)]),
    ], { p: [100, y] }))
  })

  return doc('search', layers)
}

// ---------------------------------------------------------------------------
// 7. alert — a warning mark with a breathing halo. Overload / risk states.
// ---------------------------------------------------------------------------
const alertAnim = () => {
  const layers = []
  let ind = 1

  layers.push(layer(ind++, 'bar', [
    group([rect([9, 34], [0, 0], 5), fill(C.warn)]),
  ], { p: [100, 90] }))

  layers.push(layer(ind++, 'dot', [
    group([ellipse([11, 11]), fill(C.warn)]),
  ], { p: [100, 121] }))

  layers.push(layer(ind++, 'ring', [
    group([ellipse([108, 108]), stroke(C.warn, 6, 34)]),
  ], {
    p: [100, 100],
    s: anim([[0, [96, 96]], [60, [106, 106]], [DUR, [96, 96]]]),
  }))

  layers.push(layer(ind++, 'halo', [group([ellipse([108, 108]), fill(C.warn, 12)])], {
    p: [100, 100],
    s: anim([[0, [90, 90]], [DUR, [136, 136]]]),
    o: anim([[0, [60]], [DUR, [0]]]),
  }))

  return doc('alert', layers)
}

// ---------------------------------------------------------------------------
const FILES = {
  'capacity-bars.json': capacityBars(),
  'clock.json': clockAnim(),
  'check.json': checkAnim(),
  'calendar.json': calendarAnim(),
  'scan.json': scanAnim(),
  'search.json': searchAnim(),
  'alert.json': alertAnim(),
}

mkdirSync(OUT, { recursive: true })
for (const [name, data] of Object.entries(FILES)) {
  const json = JSON.stringify(data)
  writeFileSync(`${OUT}/${name}`, json)
  console.log(`${name.padEnd(22)} ${(json.length / 1024).toFixed(1)} KB`)
}
