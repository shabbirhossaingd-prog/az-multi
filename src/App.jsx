import { useMemo, useState } from 'react'
import {
  Activity, BarChart3, Bell, Bot, CalendarClock, CalendarDays, Check, ChevronDown,
  CircleUserRound, Clock3, Command, ContactRound, Database, Edit3, Eye, FileImage,
  FileText, Gauge, Globe2, Image, KeyRound, LayoutDashboard, Link2, LockKeyhole,
  LogOut, Mail, Menu, MessageCircle, MessageSquareReply, Moon, Plus, RefreshCw,
  Save, Search, Send, Settings, ShieldCheck, Sparkles, Sun, Target, Trash2, Upload,
  UserRound, Users, Video, WandSparkles, X, Zap,
} from 'lucide-react'

const STORAGE = {
  theme: 'az-theme', session: 'az-session', brand: 'az-brand', posts: 'az-posts', integrations: 'az-integrations',
}
const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const navItems = [
  ['Dashboard', LayoutDashboard], ['Analytics', BarChart3], ['Scheduler', CalendarDays], ['Inbox', Mail, '12'],
  ['AI Studio', Sparkles], ['Content', FileText], ['Campaigns', Zap], ['Contacts', ContactRound],
  ['Integrations', Link2], ['Settings', Settings],
]

const accounts = [
  { name: 'Instagram', handle: '@az.multi', icon: 'IG', tone: 'pink' },
  { name: 'Facebook', handle: 'AZ Multi', icon: 'f', tone: 'blue' },
  { name: 'TikTok', handle: '@az.multi', icon: '♪', tone: 'dark' },
  { name: 'X', handle: '@az_multi', icon: '𝕏', tone: 'dark' },
]

const defaultBrand = {
  name: 'AZ Multi', industry: 'Digital & Social Media', audience: 'Modern brands, creators and growing businesses',
  tone: 'Clear, confident, modern and helpful', description: 'AI-powered social media management and automation platform.',
  goals: 'Save time, grow engagement and keep every social channel organized.',
}

const seedPosts = [
  { id: 1, date: '2026-08-29', time: '09:00', title: 'Weekend product highlight', platforms: ['Instagram', 'Facebook'], status: 'Scheduled' },
  { id: 2, date: '2026-08-29', time: '13:30', title: 'Behind the scenes reel', platforms: ['TikTok', 'Instagram'], status: 'Scheduled' },
  { id: 3, date: '2026-08-30', time: '18:00', title: 'Growth tip carousel', platforms: ['X', 'Facebook'], status: 'Draft' },
]

const inboxSeed = [
  ['Sarah Wilson', 'Instagram', 'Love this! Where can I buy it?', '2m'],
  ['Mike Chen', 'X', 'Thanks for the tip! Super helpful 🙌', '10m'],
  ['@design.lovers', 'TikTok', 'Do you offer custom designs?', '1h'],
  ['Emily Johnson', 'Facebook', 'Amazing work as always! 🔥', '2h'],
]

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE.theme) || 'future')
  const [session, setSession] = useState(() => readJSON(STORAGE.session, null))
  const [brand, setBrand] = useState(() => readJSON(STORAGE.brand, defaultBrand))
  const [posts, setPosts] = useState(() => readJSON(STORAGE.posts, seedPosts))
  const [active, setActive] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [brandOpen, setBrandOpen] = useState(false)

  const switchTheme = (next) => { setTheme(next); localStorage.setItem(STORAGE.theme, next) }
  const saveBrand = (next) => { setBrand(next); writeJSON(STORAGE.brand, next); setBrandOpen(false) }
  const savePosts = (next) => { setPosts(next); writeJSON(STORAGE.posts, next) }
  const addPost = (post) => savePosts([{ ...post, id: Date.now() }, ...posts])
  const logout = () => { localStorage.removeItem(STORAGE.session); setSession(null) }

  if (!session) return <LoginScreen theme={theme} switchTheme={switchTheme} onLogin={(user) => { writeJSON(STORAGE.session, user); setSession(user) }} />

  return (
    <div className={`app theme-${theme}`}>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand-wrap">
          <div className="brand-mark"><span>A</span><span>Z</span></div>
          <div><strong>AZ MULTI</strong><small>AI SOCIAL SUITE</small></div>
          <button className="icon-btn sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button>
        </div>
        <nav className="nav-list">
          {navItems.map(([label, Icon, badge]) => <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); setSidebarOpen(false) }}><Icon size={18}/><span>{label}</span>{badge && <b className="nav-badge">{badge}</b>}</button>)}
        </nav>
        <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={22}/></div><strong>Workspace ready</strong><p>Frontend flows are live. Connect API credentials when available.</p><button onClick={() => setActive('Integrations')}>Open integrations →</button></div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button>
          <div className="search-box"><Search size={17}/><input placeholder="Search workspace..."/><kbd>⌘ K</kbd></div>
          <button className="integration-btn" onClick={() => setActive('Integrations')}><Link2 size={17}/> Integrations</button>
          <div className="theme-switcher">{['light','dark','future'].map((mode) => <button key={mode} className={theme === mode ? 'selected' : ''} onClick={() => switchTheme(mode)}>{mode === 'future' ? 'Future' : mode[0].toUpperCase()+mode.slice(1)}</button>)}</div>
          <button className="icon-btn"><Bell size={19}/><span className="notif-dot">3</span></button>
          <button className="profile-btn" onClick={() => setActive('Settings')}><CircleUserRound size={27}/><span>{session.name || 'James'}</span><ChevronDown size={15}/></button>
        </header>

        <WorkspacePage active={active} theme={theme} brand={brand} posts={posts} setPosts={savePosts} setActive={setActive} openComposer={() => setComposerOpen(true)} openBrand={() => setBrandOpen(true)} />
      </main>

      {composerOpen && <Composer onClose={() => setComposerOpen(false)} onSave={addPost} />}
      {brandOpen && <BrandModal brand={brand} onClose={() => setBrandOpen(false)} onSave={saveBrand} />}
      <button className="floating-logout" title="Log out" onClick={logout}><LogOut size={17}/></button>
    </div>
  )
}

function LoginScreen({ theme, switchTheme, onLogin }) {
  const [name, setName] = useState('James')
  const [email, setEmail] = useState('demo@azmulti.app')
  return <div className={`login-shell theme-${theme}`}>
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <section className="login-card card">
      <div className="login-brand"><div className="brand-mark"><span>A</span><span>Z</span></div><div><strong>AZ MULTI</strong><small>AI SOCIAL SUITE</small></div></div>
      <span className="eyebrow"><ShieldCheck size={14}/> Secure workspace preview</span>
      <h1>Manage every channel from one place.</h1>
      <p className="login-copy">Sign in to the current frontend workspace. Production authentication can be connected to Supabase/Auth0/Firebase later.</p>
      <label>Your name<input value={name} onChange={(e)=>setName(e.target.value)}/></label>
      <label>Email<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}/></label>
      <label>Password<div className="password-field"><LockKeyhole size={16}/><input type="password" defaultValue="demo12345"/></div></label>
      <button className="primary-btn login-btn" onClick={() => onLogin({ name: name || 'User', email })}><KeyRound size={17}/> Enter workspace</button>
      <div className="login-theme">{['light','dark','future'].map((mode)=><button key={mode} onClick={()=>switchTheme(mode)} className={theme===mode?'selected':''}>{mode}</button>)}</div>
      <small className="demo-note">Demo authentication only — no password is stored.</small>
    </section>
  </div>
}

function WorkspacePage(props) {
  const map = {
    Dashboard: <Dashboard {...props}/>, Analytics: <Analytics/>, Scheduler: <Scheduler {...props}/>, Inbox: <Inbox/>,
    'AI Studio': <AIStudio brand={props.brand} openBrand={props.openBrand}/>, Content: <ContentLibrary openComposer={props.openComposer}/>,
    Campaigns: <Campaigns/>, Contacts: <Contacts/>, Integrations: <Integrations/>, Settings: <SettingsPage brand={props.brand} openBrand={props.openBrand}/>,
  }
  return map[props.active] || map.Dashboard
}

function PageHead({ eyebrow='AZ Multi workspace', title, copy, action }) {
  return <div className="page-heading"><div><span className="eyebrow"><Sparkles size={14}/>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</div>
}

function Dashboard({ theme, brand, posts, setActive, openComposer, openBrand }) {
  const stats = [
    ['Total Followers','128.4K','+12.5%',Users], ['Engagement Rate','6.83%','+18.7%',Activity], ['Impressions','2.45M','+21.3%',Gauge], ['Profile Clicks','24.6K','+15.4%',Command],
  ]
  const ThemeIcon = useMemo(() => ({light:Sun,dark:Moon,future:Sparkles}[theme]), [theme])
  return <div className="page dashboard-page">
    <PageHead eyebrow={`${theme} workspace`} title={`Hi, ${brand.name}! 👋`} copy="Here’s the current social media workspace overview." action={<button className="primary-btn" onClick={openComposer}><Plus size={18}/> Create Post</button>}/>
    <div className="notice-bar"><Database size={16}/><span><b>Demo data mode.</b> UI workflows are functional; live social data starts after API credentials are connected.</span><button onClick={()=>setActive('Integrations')}>Connect APIs</button></div>
    <section className="stats-grid">{stats.map(([label,value,change,Icon])=><article className="card stat-card" key={label}><div className="stat-head"><span>{label}</span><span className="stat-icon"><Icon size={19}/></span></div><strong>{value}</strong><small><b>↑ {change}</b> vs last 30 days</small></article>)}</section>
    <section className="dashboard-grid phase-grid">
      <article className="card performance-card"><div className="card-title-row"><div><h3>Performance Overview</h3><p>Demo engagement trend</p></div><button className="ghost-btn" onClick={()=>setActive('Analytics')}>Full analytics</button></div><div className="fake-chart"><div className="chart-grid-lines"/><svg viewBox="0 0 700 220" preserveAspectRatio="none"><path className="line main-line" d="M0,168 C70,134 104,153 152,116 C218,65 240,120 300,85 C360,50 390,85 442,70 C500,54 532,82 575,45 C622,7 650,50 700,18"/><path className="line second-line" d="M0,190 C60,172 110,180 155,151 C210,123 247,165 306,134 C360,103 398,127 450,108 C508,85 550,111 603,80 C645,58 671,75 700,55"/></svg><div className="chart-labels"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div></div></article>
      <article className="card"><div className="card-title-row"><div><h3>Upcoming Posts</h3><p>{posts.length} items in workspace</p></div><CalendarDays size={18}/></div><div className="compact-list">{posts.slice(0,4).map(p=><div className="compact-row" key={p.id}><div className="mini-date">{p.date.slice(5)}</div><div><strong>{p.title}</strong><small>{p.time} · {p.platforms.join(', ')}</small></div><b className={`status ${p.status.toLowerCase()}`}>{p.status}</b></div>)}</div><button className="wide-ghost" onClick={()=>setActive('Scheduler')}>Open Scheduler</button></article>
      <article className="card"><div className="card-title-row"><div><h3>Brand Context</h3><p>Used by AI content tools</p></div><Target size={18}/></div><div className="brand-summary"><strong>{brand.name}</strong><span>{brand.industry}</span><p>{brand.description}</p><small>Tone: {brand.tone}</small></div><button className="wide-ghost" onClick={openBrand}><Edit3 size={15}/> Edit brand profile</button></article>
    </section>
    <section className="dashboard-grid phase-grid bottom"><article className="card"><div className="card-title-row"><div><h3>Connected Accounts</h3><p>UI prepared for 4 platforms</p></div><Link2 size={18}/></div><div className="account-grid">{accounts.map(a=><div className="account-tile" key={a.name}><div className={`social-logo ${a.tone}`}>{a.icon}</div><strong>{a.name}</strong><small>API setup required</small><i className="offline-dot"/></div>)}</div></article><article className="card quick-ai"><div className="ai-orb"><Bot size={26}/></div><h3>AI Content Studio</h3><p>Generate brand-aware captions, content prompts and image prompts.</p><button className="primary-btn" onClick={()=>setActive('AI Studio')}><WandSparkles size={16}/> Open AI Studio</button></article><article className="card"><div className="card-title-row"><div><h3>Unified Inbox</h3><p>Message workflow preview</p></div><MessageCircle size={18}/></div><div className="message-list">{inboxSeed.slice(0,3).map(([name,platform,text,time])=><div className="message-row" key={name}><div className="avatar">{name[0]}</div><div><strong>{name}<small>{platform}</small></strong><p>{text}</p></div><time>{time}</time></div>)}</div><button className="wide-ghost" onClick={()=>setActive('Inbox')}>Open Inbox</button></article></section>
  </div>
}

function Analytics() {
  const cards = [['Reach','484K','+21%'],['Engagements','74.2K','+18%'],['Video Views','192K','+31%'],['Link Clicks','18.6K','+9%']]
  return <div className="page"><PageHead title="Analytics" copy="Cross-channel performance dashboard prepared for live API data."/><section className="stats-grid">{cards.map(([a,b,c])=><article className="card stat-card" key={a}><div className="stat-head"><span>{a}</span><BarChart3 size={18}/></div><strong>{b}</strong><small><b>{c}</b> demo trend</small></article>)}</section><section className="two-col"><article className="card module-card"><div className="card-title-row"><div><h3>Channel comparison</h3><p>Demo distribution</p></div><RefreshCw size={17}/></div>{[['Instagram',82],['Facebook',68],['TikTok',91],['X',54]].map(([name,val])=><div className="metric-line" key={name}><span>{name}</span><div><i style={{width:`${val}%`}}/></div><b>{val}%</b></div>)}</article><article className="card module-card"><h3>What will become live</h3><div className="check-list">{['Follower growth by platform','Reach, impressions and engagement','Best posting time','Top content ranking','Campaign and click performance'].map(x=><span key={x}><Check size={16}/>{x}</span>)}</div></article></section></div>
}

function Scheduler({ posts, setPosts, openComposer }) {
  const remove = id => setPosts(posts.filter(p=>p.id!==id))
  return <div className="page"><PageHead title="Scheduler" copy="Plan, review and manage multi-platform publishing." action={<button className="primary-btn" onClick={openComposer}><Plus size={17}/> Schedule Post</button>}/><section className="scheduler-layout"><article className="card module-card calendar-panel"><div className="calendar-head"><div><h3>August 2026</h3><p>Content calendar</p></div><CalendarClock size={20}/></div><div className="calendar-grid">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=><b key={x}>{x}</b>)}{Array.from({length:35},(_,i)=>i<3?'':i-2).map((d,i)=><span className={d===29?'today':''} key={i}>{d || ''}</span>)}</div></article><article className="card module-card"><div className="card-title-row"><div><h3>Publishing queue</h3><p>{posts.length} saved items</p></div><Clock3 size={18}/></div><div className="post-queue">{posts.map(p=><div className="queue-item" key={p.id}><div className="queue-time"><b>{p.time}</b><span>{p.date}</span></div><div className="queue-copy"><strong>{p.title}</strong><small>{p.platforms.join(' · ')}</small></div><b className={`status ${p.status.toLowerCase()}`}>{p.status}</b><button className="icon-btn" onClick={()=>remove(p.id)}><Trash2 size={15}/></button></div>)}</div></article></section></div>
}

function Inbox() {
  const [selected, setSelected] = useState(0); const [reply, setReply] = useState(''); const [sent, setSent] = useState('')
  const current = inboxSeed[selected]
  return <div className="page"><PageHead title="Unified Inbox" copy="One interface for social messages and replies. Live sync requires supported platform messaging APIs."/><section className="inbox-layout"><article className="card conversation-list"><div className="inbox-search"><Search size={16}/><input placeholder="Search conversations"/></div>{inboxSeed.map((m,i)=><button className={`conversation ${selected===i?'selected':''}`} key={m[0]} onClick={()=>setSelected(i)}><div className="avatar">{m[0][0]}</div><div><strong>{m[0]}<small>{m[1]}</small></strong><p>{m[2]}</p></div><time>{m[3]}</time></button>)}</article><article className="card chat-panel"><div className="chat-head"><div className="avatar">{current[0][0]}</div><div><strong>{current[0]}</strong><small>{current[1]} · Demo conversation</small></div></div><div className="chat-body"><div className="bubble incoming">{current[2]}</div>{sent&&<div className="bubble outgoing">{sent}</div>}</div><div className="reply-box"><textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Write a reply..."/><button className="primary-btn" onClick={()=>{if(reply.trim()){setSent(reply);setReply('')}}}><MessageSquareReply size={16}/> Reply</button></div></article></section></div>
}

function AIStudio({ brand, openBrand }) {
  const [idea,setIdea]=useState('Launch our new social media automation service for small businesses')
  const [type,setType]=useState('Caption'); const [result,setResult]=useState('')
  const generate=()=>{ const base=`Brand: ${brand.name}. Tone: ${brand.tone}. Audience: ${brand.audience}.`; if(type==='Image Prompt') setResult(`${base} Create a polished social media visual for: ${idea}. Premium digital workspace, modern composition, strong focal point, clean brand-safe typography area, platform-ready 4:5 ratio.`); else if(type==='Video Concept') setResult(`${base} Video concept: Hook with the problem in the first 2 seconds, show the unified dashboard workflow, demonstrate AI content + scheduling, end with a clear CTA. Topic: ${idea}.`); else setResult(`${idea} — simplify your workflow, create smarter content and manage every channel from one place. Built for ${brand.audience}. #SocialMedia #Automation #AI`)}
  return <div className="page"><PageHead title="AI Studio" copy="Brand-aware prompt, caption, image-prompt and video-concept workspace." action={<button className="ghost-btn" onClick={openBrand}><Target size={16}/> Brand Setup</button>}/><section className="ai-studio-grid"><article className="card module-card ai-workbench"><div className="card-title-row"><div><h3>What do you want to create?</h3><p>Current brand: {brand.name}</p></div><Bot size={21}/></div><div className="segment-control">{['Caption','Image Prompt','Video Concept'].map(x=><button key={x} className={type===x?'active':''} onClick={()=>setType(x)}>{x==='Caption'?<FileText size={15}/>:x==='Image Prompt'?<FileImage size={15}/>:<Video size={15}/>} {x}</button>)}</div><textarea className="big-input" value={idea} onChange={e=>setIdea(e.target.value)}/><div className="ai-footer"><span><Sparkles size={15}/> Uses saved brand context</span><button className="primary-btn" onClick={generate}><WandSparkles size={16}/> Generate</button></div></article><article className="card module-card result-panel"><div className="card-title-row"><div><h3>AI output</h3><p>Frontend demo generator</p></div><button className="icon-btn" onClick={()=>setResult('')}><RefreshCw size={16}/></button></div>{result?<div className="result-copy">{result}</div>:<div className="empty-state"><Sparkles size={34}/><strong>Your generated result appears here</strong><p>When an AI API is connected, this panel can return real generated content or images.</p></div>}<div className="api-note"><KeyRound size={16}/><span>No AI API key is stored in the frontend. Add keys through deployment environment variables/server functions.</span></div></article></section></div>
}

function ContentLibrary({ openComposer }) {
  const items=[['Weekend product highlight','Post','Draft'],['Growth tip carousel','Carousel','Ready'],['Behind the scenes','Video','Scheduled'],['Automation launch','Campaign post','Draft']]
  return <div className="page"><PageHead title="Content" copy="Drafts, media and reusable social content in one library." action={<button className="primary-btn" onClick={openComposer}><Plus size={17}/> New Content</button>}/><div className="content-library">{items.map(([name,type,status],i)=><article className="card content-card" key={name}><div className="content-preview">{i%2?<Video size={28}/>:<Image size={28}/>}</div><div><small>{type}</small><h3>{name}</h3><span className={`status ${status.toLowerCase()}`}>{status}</span></div><div className="content-actions"><button className="icon-btn"><Eye size={16}/></button><button className="icon-btn"><Edit3 size={16}/></button></div></article>)}</div></div>
}

function Campaigns(){ const rows=[['Summer Launch','4 channels','78%','Active'],['Brand Awareness','3 channels','100%','Completed'],['Product Teasers','2 channels','25%','Draft']]; return <div className="page"><PageHead title="Campaigns" copy="Group cross-platform posts into measurable campaigns." action={<button className="primary-btn"><Plus size={17}/> New Campaign</button>}/><div className="campaign-board">{rows.map(r=><article className="card campaign-tile" key={r[0]}><div className="campaign-icon"><Zap size={20}/></div><small>{r[1]}</small><h3>{r[0]}</h3><div className="progress-wrap"><span><i style={{width:r[2]}}/></span><small>{r[2]}</small></div><b className={`status ${r[3].toLowerCase()}`}>{r[3]}</b></article>)}</div></div> }

function Contacts(){ const people=[['Sarah Wilson','Customer','Instagram'],['Mike Chen','Lead','X'],['Emily Johnson','Creator','Facebook'],['Design Lovers','Partner','TikTok']]; return <div className="page"><PageHead title="Contacts" copy="Simple social CRM view prepared for future conversation history and tagging."/><article className="card module-card"><div className="contact-table">{people.map((p,i)=><div className="contact-row" key={p[0]}><div className="avatar">{p[0][0]}</div><div><strong>{p[0]}</strong><small>{p[2]}</small></div><span>{p[1]}</span><b>{i%2?'Warm':'Active'}</b><button className="ghost-btn">View</button></div>)}</div></article></div> }

function Integrations(){
  const [states,setStates]=useState(()=>readJSON(STORAGE.integrations,{Instagram:false,Facebook:false,TikTok:false,X:false}))
  const toggle=name=>{const next={...states,[name]:!states[name]};setStates(next);writeJSON(STORAGE.integrations,next)}
  return <div className="page"><PageHead title="Integrations" copy="Prepare social channels and external services. OAuth/API credentials are still required for production."/><div className="integration-grid">{accounts.map(a=><article className="card integration-card" key={a.name}><div className={`social-logo ${a.tone}`}>{a.icon}</div><div><h3>{a.name}</h3><p>{states[a.name]?'Demo connection enabled':'Not connected to live API'}</p></div><button className={states[a.name]?'ghost-btn connected':'primary-btn'} onClick={()=>toggle(a.name)}>{states[a.name]?<><Check size={15}/> Demo connected</>:<><Link2 size={15}/> Connect</>}</button></article>)}<article className="card integration-card infra"><Database size={25}/><div><h3>Database</h3><p>Ready to connect Supabase / Firebase / another backend.</p></div><span className="status draft">Environment needed</span></article><article className="card integration-card infra"><Sparkles size={25}/><div><h3>AI Provider</h3><p>Server-side OpenAI or other provider key can power real generation.</p></div><span className="status draft">Environment needed</span></article></div><article className="card module-card security-card"><ShieldCheck size={24}/><div><h3>Production security rule</h3><p>Never place social access tokens or AI secret keys in browser code. Store them in server-side environment variables and exchange OAuth tokens through protected backend routes.</p></div></article></div>
}

function SettingsPage({ brand, openBrand }) { return <div className="page"><PageHead title="Settings" copy="Workspace preferences, brand context and production setup checklist."/><section className="settings-grid"><article className="card module-card"><UserRound size={22}/><h3>Workspace profile</h3><p>Brand: <b>{brand.name}</b></p><p>Industry: {brand.industry}</p><button className="ghost-btn" onClick={openBrand}><Edit3 size={15}/> Edit Brand Setup</button></article><article className="card module-card"><ShieldCheck size={22}/><h3>Authentication</h3><p>Current login is a local demo session. Production should use a real authentication provider.</p><span className="status draft">Backend required</span></article><article className="card module-card"><Database size={22}/><h3>Data storage</h3><p>Current drafts/settings persist in localStorage. Database adapters can replace this without redesigning the UI.</p><span className="status active">Frontend persistence live</span></article></section></div> }

function Composer({ onClose, onSave }) {
  const [selected,setSelected]=useState(['Instagram','Facebook']); const [title,setTitle]=useState(''); const [date,setDate]=useState('2026-08-29'); const [time,setTime]=useState('10:00'); const [status,setStatus]=useState('Scheduled')
  const toggle=name=>setSelected(c=>c.includes(name)?c.filter(x=>x!==name):[...c,name])
  const submit=()=>{if(!title.trim())return;onSave({title,date,time,status,platforms:selected});onClose()}
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="composer" onMouseDown={e=>e.stopPropagation()}><div className="composer-head"><div><span className="eyebrow"><Sparkles size={14}/> Multi-platform composer</span><h2>Create / schedule post</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div><label>Publish to</label><div className="platform-selector">{accounts.map(a=><button key={a.name} className={selected.includes(a.name)?'selected':''} onClick={()=>toggle(a.name)}><span className={`social-logo ${a.tone}`}>{a.icon}</span>{a.name}</button>)}</div><label>Post title / content</label><textarea value={title} onChange={e=>setTitle(e.target.value)} placeholder="Write once. Publish everywhere..."/><div className="composer-tools"><button className="ghost-btn"><Upload size={16}/> Add media</button><button className="ghost-btn"><Sparkles size={16}/> Write with AI</button></div><div className="form-row"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Time<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label><label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option>Scheduled</option><option>Draft</option></select></label></div><div className="composer-footer"><button className="ghost-btn" onClick={onClose}>Cancel</button><button className="primary-btn" onClick={submit}><Save size={16}/> Save for {selected.length} channels</button></div></div></div>
}

function BrandModal({ brand, onClose, onSave }) {
  const [form,setForm]=useState(brand); const field=(key)=><input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="composer brand-modal" onMouseDown={e=>e.stopPropagation()}><div className="composer-head"><div><span className="eyebrow"><Target size={14}/> AI brand context</span><h2>Brand Setup</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div><div className="brand-form"><label>Brand name{field('name')}</label><label>Industry{field('industry')}</label><label>Target audience{field('audience')}</label><label>Brand tone{field('tone')}</label><label className="wide">Brand description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label className="wide">Main goals<textarea value={form.goals} onChange={e=>setForm({...form,goals:e.target.value})}/></label></div><div className="composer-footer"><button className="ghost-btn" onClick={onClose}>Cancel</button><button className="primary-btn" onClick={()=>onSave(form)}><Save size={16}/> Save Brand Context</button></div></div></div>
}

export default App
