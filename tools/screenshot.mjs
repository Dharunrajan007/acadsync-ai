import { chromium } from 'playwright'
const OUT = process.argv[2]
const pages = [
  ['landing', 'http://localhost:5173/'],
  ['login', 'http://localhost:5173/login'],
  ['student', 'http://localhost:5173/student'],
  ['workload', 'http://localhost:5173/student/workload'],
  ['timeline', 'http://localhost:5173/student/timeline'],
  ['teacher', 'http://localhost:5173/teacher'],
  ['create', 'http://localhost:5173/teacher/create'],
  ['admin-analytics', 'http://localhost:5173/admin/analytics'],
]
const sizes = [['desktop', 1440, 900], ['mobile', 375, 780]]
const browser = await chromium.launch()
const issues = []
for (const [sname, w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
  for (const [name, url] of pages) {
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${OUT}/${sname}-${name}.png`, fullPage: sname === 'desktop' })
    const overflow = await page.evaluate(() => {
      const de = document.documentElement
      const bad = []
      if (de.scrollWidth > de.clientWidth + 1) {
        for (const el of document.querySelectorAll('*')) {
          const r = el.getBoundingClientRect()
          if (r.right > de.clientWidth + 1 && r.width > 8) {
            bad.push(`${el.tagName}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`)
            if (bad.length > 4) break
          }
        }
        return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, bad }
      }
      return null
    })
    if (overflow) issues.push(`${sname}/${name}: H-OVERFLOW ${overflow.scrollWidth}>${overflow.clientWidth} :: ${overflow.bad.join(' | ')}`)
    if (errors.length) { issues.push(`${sname}/${name}: CONSOLE ${errors.slice(0,3).join(' | ')}`); errors.length = 0 }
  }
  await ctx.close()
}
await browser.close()
console.log(issues.length ? issues.join('\n') : 'NO ISSUES FOUND')
