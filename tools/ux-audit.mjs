// Verifies the minimal-UX redesign against its own rules:
//   - nav is 4 items, not 8
//   - Home shows one priority card plus at most 3 secondary rows
//   - every previously-navigable screen is still reachable
//   - global search finds relocated features
//   - no console errors, no horizontal overflow at 375px
import { chromium } from 'playwright'

const OUT = process.argv[2] || '.'
const BASE = 'http://localhost:5173'

// Every route that existed before the redesign must still work.
const ROUTES = [
  '/student', '/student/timeline', '/student/assignments', '/student/assignments/asg-01',
  '/student/availability', '/student/workload', '/student/submissions',
  '/student/notifications', '/student/settings',
  '/teacher', '/teacher/assignments', '/teacher/create', '/teacher/students',
  '/teacher/students/stu-01', '/teacher/workload', '/teacher/submissions',
  '/teacher/notifications', '/teacher/settings',
  '/admin', '/admin/students', '/admin/teachers', '/admin/subjects', '/admin/analytics',
  '/admin/assignments', '/admin/departments', '/admin/notifications', '/admin/settings',
]

const browser = await chromium.launch()
const failures = []

// --- 1. every route still renders ------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  for (const route of ROUTES) {
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)))
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(250)
    const info = await page.evaluate(() => ({
      text: document.body.innerText.length,
      notFound: document.body.innerText.includes("doesn't exist"),
    }))
    if (info.notFound) failures.push(`${route}: routed to 404`)
    if (info.text < 60) failures.push(`${route}: rendered almost nothing`)
    if (errors.length) failures.push(`${route}: ${errors[0]}`)
    page.removeAllListeners('pageerror')
  }
  await ctx.close()
}

// --- 2. nav item count + Home discipline -----------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  for (const home of ['/student', '/teacher', '/admin']) {
    await page.goto(BASE + home, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    const shape = await page.evaluate(() => {
      const rail = document.querySelector('aside nav[aria-label="Primary"]')
      const navCount = rail ? rail.children.length : -1
      const upNext = [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Up next')
      const secondary = upNext ? upNext.closest('section').querySelectorAll('a[href]').length - 1 : 0
      return { navCount, secondary }
    })
    if (shape.navCount !== 3) failures.push(`${home}: rail has ${shape.navCount} items, expected 3 + profile`)
    if (shape.secondary > 3) failures.push(`${home}: ${shape.secondary} secondary activities, cap is 3`)
    console.log(`${home.padEnd(9)} rail=${shape.navCount}+profile  secondary=${shape.secondary}`)
  }
  await page.screenshot({ path: `${OUT}/ux-admin-home.png` })
  await ctx.close()
}

// --- 3. search finds relocated features ------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/student', { waitUntil: 'networkidle' })

  const probes = ['availability', 'marks', 'workload', 'submit', 'machine']
  for (const probe of probes) {
    await page.keyboard.press('Control+k')
    await page.waitForSelector('input[aria-label="Search anything in AcadSync"]', { timeout: 5000 })
    await page.fill('input[aria-label="Search anything in AcadSync"]', probe)
    await page.waitForTimeout(280)
    const hits = await page.evaluate(() =>
      [...document.querySelectorAll('[role="dialog"] button[data-active]')].length
    )
    if (hits === 0) failures.push(`search "${probe}": no results`)
    console.log(`search "${probe}"`.padEnd(24), `${hits} results`)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
  }
  await page.keyboard.press('Control+k')
  await page.fill('input[aria-label="Search anything in AcadSync"]', 'availability')
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/ux-search.png` })
  await ctx.close()
}

// --- 4. mobile: bottom nav present, no overflow ----------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 780 } })
  const page = await ctx.newPage()
  for (const home of ['/student', '/teacher', '/admin']) {
    await page.goto(BASE + home, { waitUntil: 'networkidle' })
    await page.waitForTimeout(350)
    const m = await page.evaluate(() => {
      const de = document.documentElement
      const tabs = document.querySelectorAll('nav[aria-label="Primary"] > div > *').length
      return { overflow: de.scrollWidth > de.clientWidth + 1, scrollWidth: de.scrollWidth, tabs }
    })
    if (m.overflow) failures.push(`${home} @375: horizontal overflow ${m.scrollWidth}px`)
    if (m.tabs !== 4) failures.push(`${home} @375: ${m.tabs} bottom tabs, expected 4`)
  }
  await page.goto(BASE + '/student', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/ux-mobile-home.png` })
  await ctx.close()
}

await browser.close()

console.log('\n' + (failures.length ? `FAILURES (${failures.length}):\n  ` + failures.join('\n  ') : 'ALL UX CHECKS PASSED'))
process.exit(failures.length ? 1 : 0)
