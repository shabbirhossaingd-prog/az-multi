import fs from 'node:fs'

const file = new URL('../src/AppFixed.jsx', import.meta.url)
let source = fs.readFileSync(file, 'utf8')

const propsBefore = 'setToast={setToast} publishNow={publishNow}/>'
const propsAfter = 'setToast={setToast} publishNow={publishNow} notifications={notifications} setNotifications={setNotifications}/>'
if (source.includes(propsBefore)) source = source.replace(propsBefore, propsAfter)

const schedulerMarker = "    setToast(liveReady ? 'Demo publish complete. Add backend API for live publishing.' : 'Demo publish complete. Connect selected platform APIs for live publishing.')\n  }\n\n  if (!authReady)"
const schedulerPatch = "    setToast(liveReady ? 'Demo publish complete. Add backend API for live publishing.' : 'Demo publish complete. Connect selected platform APIs for live publishing.')\n  }\n\n  useEffect(() => {\n    if (!session) return\n    const runDuePosts = () => {\n      const now = Date.now()\n      posts.filter((p) => p.status === 'Scheduled' && p.date && p.time && new Date(`${p.date}T${p.time}:00`).getTime() <= now).forEach((p) => publishNow(p))\n    }\n    runDuePosts()\n    const timer = window.setInterval(runDuePosts, 30000)\n    return () => window.clearInterval(timer)\n  }, [session, posts])\n\n  if (!authReady)"
if (source.includes(schedulerMarker)) source = source.replace(schedulerMarker, schedulerPatch)

fs.writeFileSync(file, source)
console.log('Applied AppFixed runtime patches.')
