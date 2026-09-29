// End-to-end check of the teacher capacity-analysis flow against the live
// FastAPI backend. Run with both servers up:
//   node tools/e2e-analysis.mjs ./screenshots
import { chromium } from 'playwright'

const OUT = process.argv[2] || '.'
const b = await chromium.launch()
const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage()

const errs = []
p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)))
p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)))

const apiCalls = []
p.on('request', (r) => r.url().includes('/api/') && apiCalls.push(`${r.method()} ${r.url()}`))

await p.goto('http://localhost:5173/teacher/create', { waitUntil: 'networkidle' })
await p.click('text=Analyze student capacity')
await p.waitForSelector('text=Student Capacity Analysis', { timeout: 20000 })
await p.waitForTimeout(1200)

const summary = await p.evaluate(() => {
  const text = (sel) => [...document.querySelectorAll(sel)].map((e) => e.textContent.trim())
  const body = document.body.innerText
  return {
    badge: body.includes('ML-backed analysis')
      ? 'ML-backed'
      : body.includes('Rule-based simulation')
        ? 'Rule-based'
        : 'unknown',
    headline: text('h1')[0] || '',
    counts: text('.card p[class*="28px"]').slice(0, 4),
    headers: text('thead th'),
    firstRow: text('tbody tr:first-child td'),
  }
})

console.log('API CALLS  :', apiCalls.join(', ') || 'none')
console.log('BADGE      :', summary.badge)
console.log('COUNTS     :', summary.counts.join(' | '))
console.log('COLUMNS    :', summary.headers.join(' | '))
console.log('TOP ROW    :', summary.firstRow.join(' | '))
console.log('ERRORS     :', errs.length ? errs.join(' || ') : 'none')

await p.screenshot({ path: `${OUT}/e2e-analysis.png`, fullPage: true })
await b.close()
