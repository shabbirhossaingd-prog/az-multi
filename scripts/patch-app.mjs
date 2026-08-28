import fs from 'node:fs'

const appFile = new URL('../src/AppFixed.jsx', import.meta.url)
let source = fs.readFileSync(appFile, 'utf8')

const propsBefore = 'setToast={setToast} publishNow={publishNow}/>'
const propsAfter = 'setToast={setToast} publishNow={publishNow} notifications={notifications} setNotifications={setNotifications}/>'
if (source.includes(propsBefore)) source = source.replace(propsBefore, propsAfter)

const schedulerMarker = "    setToast(liveReady ? 'Demo publish complete. Add backend API for live publishing.' : 'Demo publish complete. Connect selected platform APIs for live publishing.')\n  }\n\n  if (!authReady)"
const schedulerPatch = "    setToast(liveReady ? 'Demo publish complete. Add backend API for live publishing.' : 'Demo publish complete. Connect selected platform APIs for live publishing.')\n  }\n\n  useEffect(() => {\n    if (!session) return\n    const runDuePosts = () => {\n      const now = Date.now()\n      posts.filter((p) => p.status === 'Scheduled' && p.date && p.time && new Date(`${p.date}T${p.time}:00`).getTime() <= now).forEach((p) => publishNow(p))\n    }\n    runDuePosts()\n    const timer = window.setInterval(runDuePosts, 30000)\n    return () => window.clearInterval(timer)\n  }, [session, posts])\n\n  if (!authReady)"
if (source.includes(schedulerMarker)) source = source.replace(schedulerMarker, schedulerPatch)

const composerBefore = "const writeAI=()=>{const seed=form.body.trim()||form.title.trim()||'your next campaign';setForm({...form,body:`${seed} — built for ${brand.audience}. ${brand.tone} voice, clear benefit, strong CTA. #${brand.name.replace(/\\s+/g,'')} #SocialMedia #Growth`})}"
const composerAfter = "const writeAI=async()=>{const seed=form.body.trim()||form.title.trim()||'your next campaign';const fallback=`${seed} — built for ${brand.audience}. ${brand.tone} voice, clear benefit, strong CTA. #${brand.name.replace(/\\s+/g,'')} #SocialMedia #Growth`;if(apiBaseConfigured){try{const data=await generateWithAI({type:'Caption',idea:seed,brand,platforms:form.platforms});setForm({...form,body:data.result||data.text||fallback});return}catch{}}setForm({...form,body:fallback})}"
if (source.includes(composerBefore)) source = source.replace(composerBefore, composerAfter)

fs.writeFileSync(appFile, source)

const adsFile = new URL('../src/AdsManagerFixed.jsx', import.meta.url)
let ads = fs.readFileSync(adsFile, 'utf8')

const adsImportBefore = "import { apiBaseConfigured, downloadText, launchAdsCampaign, toCSV } from './lib/platformApi.js'"
const adsImportAfter = "import { apiBaseConfigured, downloadText, generateWithAI, launchAdsCampaign, toCSV } from './lib/platformApi.js'"
if (ads.includes(adsImportBefore)) ads = ads.replace(adsImportBefore, adsImportAfter)

const persistMarker = "  const persist=(next)=>{setCampaigns(next);save(next)}\n"
const analyzePatch = "  const persist=(next)=>{setCampaigns(next);save(next)}\n  const analyze=async()=>{if(apiBaseConfigured){try{const data=await generateWithAI({type:'Ads Strategy',goal,budget:Number(budget)||0,days:Number(days)||0,audience,seed,offer,platforms:selected});setNotice(data.result||data.text||'AI ad strategy generated.');return}catch(e){setNotice(`AI analysis failed: ${e.message}`);return}}setNotice('AI gateway is not connected yet. Current scores use the local planning model; connect AI Core for model-generated strategy.')}\n"
if (ads.includes(persistMarker) && !ads.includes("const analyze=async()=>")) ads = ads.replace(persistMarker, analyzePatch)

const analyzeButtonBefore = "<button className=\"ads-primary\" onClick={()=>setNotice('Media plan refreshed using the latest campaign inputs.')}><Search size={15}/> Analyze best ad mix</button>"
const analyzeButtonAfter = "<button className=\"ads-primary\" onClick={analyze}><Search size={15}/> Analyze best ad mix</button>"
if (ads.includes(analyzeButtonBefore)) ads = ads.replace(analyzeButtonBefore, analyzeButtonAfter)

fs.writeFileSync(adsFile, ads)
console.log('Applied AppFixed + Ads AI runtime patches.')
