import fs from 'node:fs'

const file = new URL('../src/AppFixed.jsx', import.meta.url)
let source = fs.readFileSync(file, 'utf8')

const before = 'setToast={setToast} publishNow={publishNow}/>'
const after = 'setToast={setToast} publishNow={publishNow} notifications={notifications} setNotifications={setNotifications}/>'

if (source.includes(before)) {
  source = source.replace(before, after)
  fs.writeFileSync(file, source)
  console.log('Applied AppFixed notification props patch.')
} else {
  console.log('AppFixed notification props patch already applied.')
}
