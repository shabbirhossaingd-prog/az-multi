import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, BarChart3, Bell, Bot, CalendarDays, Check, ChevronDown, CircleUserRound,
  Clock3, Command, ContactRound, Database, Download, Edit3, Eye, FileImage, FileText,
  Filter, Gauge, Image, KeyRound, LayoutDashboard, Link2, LockKeyhole, LogOut, Mail,
  Menu, MessageCircle, MessageSquareReply, Moon, MoreHorizontal, Pause, Play, Plus,
  RefreshCw, Save, Search, Send, Settings, ShieldCheck, Sparkles, Sun, Tag, Target,
  Trash2, Upload, UserPlus, UserRound, Users, Video, WandSparkles, X, Zap,
} from 'lucide-react'
import { isSupabaseConfigured } from './lib/supabase.js'
import { getCurrentSession, onAuthStateChange, resetPassword, signIn, signOut, signUp } from './lib/auth.js'
import { apiBaseConfigured, downloadText, generateWithAI, oauthUrl, publishSocialPost, toCSV } from './lib/platformApi.js'

const STORAGE = {
  theme: 'az-theme', session: 'az-session', brand: 'az-brand', posts: 'az-posts', integrations: 'az-integrations',
  content: 'az-content', campaigns: 'az-campaigns', contacts: 'az-contacts', notifications: 'az-notifications', demoUsers: 'az-demo-users',
}
const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

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
  { id: 'p1', date: '2026-08-29', time: '09:00', title: 'Weekend product highlight', body: 'Weekend product highlight', platforms: ['Instagram','Facebook'], status: 'Scheduled', mediaName: '' },
  { id: 'p2', date: '2026-08-29', time: '13:30', title: 'Behind the scenes reel', body: 'Behind the scenes reel', platforms: ['TikTok','Instagram'], status: 'Scheduled', mediaName: '' },
  { id: 'p3', date: '2026-08-30', time: '18:00', title: 'Growth tip carousel', body: 'Growth tip carousel', platforms: ['X','Facebook'], status: 'Draft', mediaName: '' },
]
const seedContent = [
  { id:'c1', title:'Weekend product highlight', type:'Post', status:'Draft', body:'A product-focused social post with a clear CTA.', platforms:['Instagram','Facebook'] },
  { id:'c2', title:'Growth tip carousel', type:'Carousel', status:'Ready', body:'Five practical growth tips for modern brands.', platforms:['Instagram','Facebook','X'] },
  { id:'c3', title:'Behind the scenes', type:'Video', status:'Scheduled', body:'Short-form behind-the-scenes video concept.', platforms:['TikTok','Instagram'] },
  { id:'c4', title:'Automation launch', type:'Campaign post', status:'Draft', body:'Launch announcement for the automation suite.', platforms:['Facebook','Instagram','X'] },
]
const seedCampaigns = [
  { id:'g1', name:'Summer Launch', goal:'Sales', platforms:['Instagram','Facebook','TikTok','X'], progress:78, status:'Active', budget:1200, start:'2026-08-10', end:'2026-08-31' },
  { id:'g2', name:'Brand Awareness', goal:'Awareness', platforms:['Instagram','Facebook','TikTok'], progress:100, status:'Completed', budget:800, start:'2026-07-01', end:'2026-07-31' },
  { id:'g3', name:'Product Teasers', goal:'Traffic', platforms:['Instagram','TikTok'], progress:25, status:'Draft', budget:500, start:'2026-09-01', end:'2026-09-15' },
]
const seedContacts = [
  { id:'u1', name:'Sarah Wilson', email:'sarah@example.com', phone:'+1 555 0101', source:'Instagram', status:'Customer', temperature:'Active', tags:['buyer','engaged'], notes:'Interested in the premium plan.', followUp:'2026-09-02', lastInteraction:'2m' },
  { id:'u2', name:'Mike Chen', email:'mike@example.com', phone:'+1 555 0102', source:'X', status:'Lead', temperature:'Warm', tags:['lead'], notes:'Asked about team collaboration.', followUp:'2026-09-04', lastInteraction:'10m' },
  { id:'u3', name:'Emily Johnson', email:'emily@example.com', phone:'+1 555 0103', source:'Facebook', status:'Creator', temperature:'Active', tags:['creator'], notes:'Potential creator partnership.', followUp:'2026-09-01', lastInteraction:'2h' },
  { id:'u4', name:'Design Lovers', email:'hello@designlovers.test', phone:'', source:'TikTok', status:'Partner', temperature:'Warm', tags:['partner'], notes:'Possible content collaboration.', followUp:'2026-09-07', lastInteraction:'1h' },
]
const inboxSeed = [
  ['Sarah Wilson','Instagram','Love this! Where can I buy it?','2m'], ['Mike Chen','X','Thanks for the tip! Super helpful 🙌','10m'],
  ['@design.lovers','TikTok','Do you offer custom designs?','1h'], ['Emily Johnson','Facebook','Amazing work as always! 🔥','2h'],
]
const seedNotifications = [
  { id:'n1', title:'3 posts scheduled today', copy:'Review today’s publishing queue.', time:'5m', read:false },
  { id:'n2', title:'AI Studio ready', copy:'Brand context is available for generation.', time:'1h', read:false },
  { id:'n3', title:'Integrations need credentials', copy:'Connect platform OAuth to publish live.', time:'3h', read:true },
]

function useStoredState(key, initial) {
  const [value, setValue] = useState(() => readJSON(key, initial))
  const save = (next) => {
    setValue((current) => {
      const resolved = typeof next === 'function' ? next(current) : next
      writeJSON(key, resolved)
      return resolved
    })
  }
  return [value, save]
}

async function hashText(value) {
  if (!window.crypto?.subtle) return btoa(unescape(encodeURIComponent(value)))
  const bytes = new TextEncoder().encode(value)
  const hash = await window.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2,'0')).join('')
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE.theme) || 'future')
  const [session, setSession] = useState(() => isSupabaseConfigured ? null : readJSON(STORAGE.session, null))
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [brand, setBrand] = useStoredState(STORAGE.brand, defaultBrand)
  const [posts, setPosts] = useStoredState(STORAGE.posts, seedPosts)
  const [content, setContent] = useStoredState(STORAGE.content, seedContent)
  const [campaigns, setCampaigns] = useStoredState(STORAGE.campaigns, seedCampaigns)
  const [contacts, setContacts] = useStoredState(STORAGE.contacts, seedContacts)
  const [notifications, setNotifications] = useStoredState(STORAGE.notifications, seedNotifications)
  const [integrations, setIntegrations] = useStoredState(STORAGE.integrations, {Instagram:false,Facebook:false,TikTok:false,X:false})
  const [active, setActive] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [composer, setComposer] = useState(null)
  const [brandOpen, setBrandOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) return
    getCurrentSession().then((s) => { setSession(s ? { name:s.user.user_metadata?.name || s.user.email, email:s.user.email, supabase:true } : null); setAuthReady(true) }).catch(() => setAuthReady(true))
    return onAuthStateChange((s) => setSession(s ? { name:s.user.user_metadata?.name || s.user.email, email:s.user.email, supabase:true } : null))
  }, [])

  useEffect(() => {
    const key = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) } }
    const nav = (e) => { setActive(e.detail); setSearchOpen(false) }
    window.addEventListener('keydown', key)
    window.addEventListener('az:navigate', nav)
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('az:navigate', nav) }
  }, [])

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2800); return () => clearTimeout(t) }, [toast])

  const switchTheme = (next) => { setTheme(next); localStorage.setItem(STORAGE.theme,next) }
  const logout = async () => {
    if (isSupabaseConfigured && session?.supabase) { try { await signOut() } catch {} }
    localStorage.removeItem(STORAGE.session); setSession(null); setProfileOpen(false)
  }
  const savePost = (post) => {
    setPosts((current) => post.id ? current.map((p) => p.id === post.id ? post : p) : [{...post,id:uid()},...current])
    setComposer(null); setToast(post.id ? 'Post updated.' : 'Post saved to scheduler.')
  }
  const publishNow = async (post) => {
    const liveReady = post.platforms.every((p) => integrations[p])
    if (apiBaseConfigured && liveReady) {
      try { await publishSocialPost(post); savePost({...post,status:'Published'}); setToast('Published through connected backend.') }
      catch (e) { setToast(e.message) }
      return
    }
    savePost({...post,status:'Demo Published'})
    setToast(liveReady ? 'Demo publish complete. Add backend API for live publishing.' : 'Demo publish complete. Connect selected platform APIs for live publishing.')
  }

  if (!authReady) return <div className={`login-shell theme-${theme}`}><div className="login-card card"><span className="eyebrow"><RefreshCw size={14}/> Loading secure session</span><h2>Checking authentication…</h2></div></div>
  if (!session) return <AuthScreen theme={theme} switchTheme={switchTheme} onLogin={(user) => { if (!user.supabase) writeJSON(STORAGE.session,user); setSession(user) }} />

  return <div className={`app theme-${theme}`}>
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <aside className={`sidebar ${sidebarOpen?'open':''}`}>
      <div className="brand-wrap"><div className="brand-mark"><span>A</span><span>Z</span></div><div><strong>AZ MULTI</strong><small>AI SOCIAL SUITE</small></div><button className="icon-btn sidebar-close" onClick={()=>setSidebarOpen(false)}><X size={18}/></button></div>
      <nav className="nav-list">{navItems.map(([label,Icon,badge])=><button key={label} className={`nav-item ${active===label?'active':''}`} onClick={()=>{setActive(label);setSidebarOpen(false)}}><Icon size={18}/><span>{label}</span>{badge&&<b className="nav-badge">{badge}</b>}</button>)}</nav>
      <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={22}/></div><strong>{isSupabaseConfigured?'Backend connected':'Demo workspace'}</strong><p>{isSupabaseConfigured?'Supabase auth is enabled.':'Connect Supabase and social APIs when credentials are ready.'}</p><button onClick={()=>setActive('Integrations')}>Open integrations →</button></div>
    </aside>

    <main className="main-shell">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={()=>setSidebarOpen(true)}><Menu size={20}/></button>
        <button className="search-box search-trigger" onClick={()=>setSearchOpen(true)}><Search size={17}/><span>Search workspace...</span><kbd>⌘ K</kbd></button>
        <button className="integration-btn" onClick={()=>setActive('Integrations')}><Link2 size={17}/> Integrations</button>
        <div className="theme-switcher">{['light','dark','future'].map((mode)=><button key={mode} className={theme===mode?'selected':''} onClick={()=>switchTheme(mode)}>{mode[0].toUpperCase()+mode.slice(1)}</button>)}</div>
        <div className="top-pop-wrap"><button className="icon-btn" onClick={()=>{setNotificationOpen(!notificationOpen);setProfileOpen(false)}}><Bell size={19}/>{notifications.some(n=>!n.read)&&<span className="notif-dot">{notifications.filter(n=>!n.read).length}</span>}</button>{notificationOpen&&<NotificationMenu notifications={notifications} setNotifications={setNotifications} onClose={()=>setNotificationOpen(false)} />}</div>
        <div className="top-pop-wrap"><button className="profile-btn" onClick={()=>{setProfileOpen(!profileOpen);setNotificationOpen(false)}}><CircleUserRound size={27}/><span>{session.name || 'User'}</span><ChevronDown size={15}/></button>{profileOpen&&<ProfileMenu session={session} onSettings={()=>{setActive('Settings');setProfileOpen(false)}} onLogout={logout}/>}</div>
      </header>

      <WorkspacePage active={active} theme={theme} brand={brand} posts={posts} setPosts={setPosts} content={content} setContent={setContent} campaigns={campaigns} setCampaigns={setCampaigns} contacts={contacts} setContacts={setContacts} integrations={integrations} setIntegrations={setIntegrations} setActive={setActive} openComposer={(item)=>setComposer(item || {})} openBrand={()=>setBrandOpen(true)} setToast={setToast} publishNow={publishNow}/>
    </main>

    {composer!==null&&<Composer initial={composer} brand={brand} onClose={()=>setComposer(null)} onSave={savePost} onPublish={publishNow}/>} 
    {brandOpen&&<BrandModal brand={brand} onClose={()=>setBrandOpen(false)} onSave={(next)=>{setBrand(next);setBrandOpen(false);setToast('Brand context saved.')}}/>}
    {searchOpen&&<GlobalSearch posts={posts} contacts={contacts} content={content} campaigns={campaigns} onClose={()=>setSearchOpen(false)} onNavigate={(page)=>{setActive(page);setSearchOpen(false)}}/>}
    {toast&&<div className="app-toast"><Check size={15}/>{toast}</div>}
  </div>
}

function AuthScreen({ theme, switchTheme, onLogin }) {
  const [mode,setMode]=useState('signin'); const [name,setName]=useState('James'); const [email,setEmail]=useState('demo@azmulti.app'); const [password,setPassword]=useState('demo12345'); const [newPassword,setNewPassword]=useState(''); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false)
  const submit=async()=>{
    setBusy(true);setMessage('')
    try {
      if (isSupabaseConfigured) {
        if(mode==='signup'){ const data=await signUp({name,email,password}); setMessage(data.session?'Account created and signed in.':'Account created. Check your email if confirmation is enabled.'); if(data.session) onLogin({name:name||email,email,supabase:true}) }
        else if(mode==='forgot'){ await resetPassword(email); setMessage('Password reset email sent.') }
        else { const data=await signIn({email,password}); onLogin({name:data.user?.user_metadata?.name || data.user?.email,email:data.user?.email,supabase:true}) }
      } else {
        const users=readJSON(STORAGE.demoUsers,[])
        if(mode==='signup'){ if(!email||password.length<6) throw new Error('Use a valid email and a password with at least 6 characters.'); const hash=await hashText(password); const next=[...users.filter(u=>u.email!==email),{name:name||'User',email,hash}];writeJSON(STORAGE.demoUsers,next);setMessage('Demo account created. You can sign in now.');setMode('signin') }
        else if(mode==='forgot'){ if(email==='demo@azmulti.app'){setMessage('Default demo password is demo12345.');} else { const hash=await hashText(newPassword); if(!newPassword||newPassword.length<6) throw new Error('Enter a new password with at least 6 characters.'); const found=users.some(u=>u.email===email); if(!found) throw new Error('Demo account not found.');writeJSON(STORAGE.demoUsers,users.map(u=>u.email===email?{...u,hash}:u));setMessage('Demo password reset. You can sign in now.');setMode('signin') } }
        else { if(email==='demo@azmulti.app'&&password==='demo12345') onLogin({name:name||'James',email}); else { const hash=await hashText(password); const found=users.find(u=>u.email===email&&u.hash===hash); if(!found) throw new Error('Email or password is incorrect.');onLogin({name:found.name,email:found.email}) } }
      }
    } catch(e){setMessage(e.message)} finally{setBusy(false)}
  }
  return <div className={`login-shell theme-${theme}`}><div className="ambient ambient-one"/><div className="ambient ambient-two"/><section className="login-card card">
    <div className="login-brand"><div className="brand-mark"><span>A</span><span>Z</span></div><div><strong>AZ MULTI</strong><small>AI SOCIAL SUITE</small></div></div>
    <span className="eyebrow"><ShieldCheck size={14}/>{isSupabaseConfigured?'Secure Supabase authentication':'Functional demo authentication'}</span>
    <h1>{mode==='signup'?'Create your workspace.':mode==='forgot'?'Reset your password.':'Manage every channel from one place.'}</h1>
    <p className="login-copy">{isSupabaseConfigured?'Authentication is connected to Supabase.':'Demo mode validates passwords locally. Default: demo@azmulti.app / demo12345'}</p>
    {mode!=='forgot'&&<label>Your name<input value={name} onChange={e=>setName(e.target.value)}/></label>}
    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
    {mode!=='forgot'&&<label>Password<div className="password-field"><LockKeyhole size={16}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></div></label>}
    {mode==='forgot'&&!isSupabaseConfigured&&email!=='demo@azmulti.app'&&<label>New demo password<div className="password-field"><LockKeyhole size={16}/><input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></div></label>}
    <button className="primary-btn login-btn" disabled={busy} onClick={submit}><KeyRound size={17}/>{busy?'Please wait…':mode==='signup'?'Create account':mode==='forgot'?'Reset password':'Enter workspace'}</button>
    {message&&<div className="auth-message">{message}</div>}
    <div className="auth-links">{mode!=='signin'&&<button onClick={()=>setMode('signin')}>Sign in</button>}{mode!=='signup'&&<button onClick={()=>setMode('signup')}>Create account</button>}{mode!=='forgot'&&<button onClick={()=>setMode('forgot')}>Forgot password</button>}</div>
    <div className="login-theme">{['light','dark','future'].map(m=><button key={m} onClick={()=>switchTheme(m)} className={theme===m?'selected':''}>{m}</button>)}</div>
  </section></div>
}

function WorkspacePage(props){
  const map={ Dashboard:<Dashboard {...props}/>, Analytics:<Analytics {...props}/>, Scheduler:<Scheduler {...props}/>, Inbox:<Inbox {...props}/>, 'AI Studio':<AIStudio {...props}/>, Content:<ContentLibrary {...props}/>, Campaigns:<Campaigns {...props}/>, Contacts:<Contacts {...props}/>, Integrations:<Integrations {...props}/>, Settings:<SettingsPage {...props}/> }
  return map[props.active] || map.Dashboard
}
function PageHead({eyebrow='AZ Multi workspace',title,copy,action}){return <div className="page-heading"><div><span className="eyebrow"><Sparkles size={14}/>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</div>}

function Dashboard({theme,brand,posts,setActive,openComposer,openBrand,integrations}){
  const stats=[['Total Followers','128.4K','+12.5%',Users],['Engagement Rate','6.83%','+18.7%',Activity],['Impressions','2.45M','+21.3%',Gauge],['Profile Clicks','24.6K','+15.4%',Command]]
  const ThemeIcon=useMemo(()=>({light:Sun,dark:Moon,future:Sparkles}[theme]),[theme])
  return <div className="page dashboard-page"><PageHead eyebrow={`${theme} workspace`} title={`Hi, ${brand.name}! 👋`} copy="Your social media command center is ready." action={<button className="primary-btn" onClick={()=>openComposer({})}><Plus size={18}/> Create Post</button>}/>
    <div className="notice-bar"><Database size={16}/><span><b>{apiBaseConfigured?'Backend API configured.':'Demo/local mode.'}</b> Live social publishing needs connected OAuth accounts.</span><button onClick={()=>setActive('Integrations')}>Manage APIs</button></div>
    <section className="stats-grid">{stats.map(([label,value,change,Icon])=><article className="card stat-card" key={label}><div className="stat-head"><span>{label}</span><span className="stat-icon"><Icon size={19}/></span></div><strong>{value}</strong><small><b>↑ {change}</b> vs last 30 days</small></article>)}</section>
    <section className="dashboard-grid phase-grid"><article className="card performance-card"><div className="card-title-row"><div><h3>Performance Overview</h3><p>Cross-channel trend</p></div><button className="ghost-btn" onClick={()=>setActive('Analytics')}>Full analytics</button></div><div className="fake-chart"><div className="chart-grid-lines"/><svg viewBox="0 0 700 220" preserveAspectRatio="none"><path className="line main-line" d="M0,168 C70,134 104,153 152,116 C218,65 240,120 300,85 C360,50 390,85 442,70 C500,54 532,82 575,45 C622,7 650,50 700,18"/><path className="line second-line" d="M0,190 C60,172 110,180 155,151 C210,123 247,165 306,134 C360,103 398,127 450,108 C508,85 550,111 603,80 C645,58 671,75 700,55"/></svg><div className="chart-labels"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div></div></article>
      <article className="card phase-card"><div className="card-title-row"><div><h3>Upcoming Posts</h3><p>{posts.length} items</p></div><CalendarDays size={18}/></div><div className="compact-list">{posts.slice(0,4).map(p=><div className="compact-row" key={p.id}><div className="mini-date">{p.date?.slice(5)||'—'}</div><div><strong>{p.title}</strong><small>{p.time} · {p.platforms.join(', ')}</small></div><b className={`status ${String(p.status).toLowerCase().replace(' ','-')}`}>{p.status}</b></div>)}</div><button className="wide-ghost" onClick={()=>setActive('Scheduler')}>Open Scheduler</button></article>
      <article className="card phase-card"><div className="card-title-row"><div><h3>Brand Context</h3><p>Used by AI tools</p></div><Target size={18}/></div><div className="brand-summary"><strong>{brand.name}</strong><span>{brand.industry}</span><p>{brand.description}</p><small>Tone: {brand.tone}</small></div><button className="wide-ghost" onClick={openBrand}><Edit3 size={15}/> Edit brand profile</button></article></section>
    <section className="dashboard-grid phase-grid bottom"><article className="card phase-card"><div className="card-title-row"><div><h3>Connected Accounts</h3><p>{Object.values(integrations).filter(Boolean).length} of 4 connected</p></div><Link2 size={18}/></div><div className="account-grid">{accounts.map(a=><div className="account-tile" key={a.name}><div className={`social-logo ${a.tone}`}>{a.icon}</div><strong>{a.name}</strong><small>{integrations[a.name]?'Connected':'Setup required'}</small><i className={integrations[a.name]?'online-dot':'offline-dot'}/></div>)}</div></article><article className="card quick-ai"><div className="ai-orb"><Bot size={26}/></div><h3>AI Content Studio</h3><p>Generate captions, image prompts and video concepts.</p><button className="primary-btn" onClick={()=>setActive('AI Studio')}><WandSparkles size={16}/> Open AI Studio</button></article><article className="card phase-card"><div className="card-title-row"><div><h3>Unified Inbox</h3><p>Message workflow</p></div><MessageCircle size={18}/></div><div className="message-list">{inboxSeed.slice(0,3).map(([name,platform,text,time])=><div className="message-row" key={name}><div className="avatar">{name[0]}</div><div><strong>{name}<small>{platform}</small></strong><p>{text}</p></div><time>{time}</time></div>)}</div><button className="wide-ghost" onClick={()=>setActive('Inbox')}>Open Inbox</button></article></section>
  </div>
}

function Analytics({posts,campaigns}){
  const rows=[{metric:'Reach',value:'484K',change:'+21%'},{metric:'Engagements',value:'74.2K',change:'+18%'},{metric:'Video Views',value:'192K',change:'+31%'},{metric:'Link Clicks',value:'18.6K',change:'+9%'}]
  const exportReport=()=>downloadText('az-multi-analytics.csv',toCSV(rows.map(r=>({...r,scheduled_posts:posts.length,campaigns:campaigns.length}))),'text/csv;charset=utf-8')
  return <div className="page"><PageHead title="Analytics" copy="Cross-channel performance and downloadable reporting." action={<button className="ghost-btn" onClick={exportReport}><Download size={16}/> Export CSV</button>}/><section className="stats-grid">{rows.map(r=><article className="card stat-card" key={r.metric}><div className="stat-head"><span>{r.metric}</span><BarChart3 size={18}/></div><strong>{r.value}</strong><small><b>{r.change}</b> current trend</small></article>)}</section><section className="two-col"><article className="card module-card"><div className="card-title-row"><div><h3>Channel comparison</h3><p>Current demo distribution</p></div><Filter size={17}/></div>{[['Instagram',82],['Facebook',68],['TikTok',91],['X',54]].map(([name,val])=><div className="metric-line" key={name}><span>{name}</span><div><i style={{width:`${val}%`}}/></div><b>{val}%</b></div>)}</article><article className="card module-card"><h3>Report status</h3><div className="check-list">{['CSV export works now','Organic vs paid layout ready','Best-post ranking ready','Live metrics switch on after API sync','Campaign and ad reporting can share one data layer'].map(x=><span key={x}><Check size={16}/>{x}</span>)}</div></article></section></div>
}

function Scheduler({posts,setPosts,openComposer,publishNow}){
  const remove=id=>setPosts(posts.filter(p=>p.id!==id)); const [filter,setFilter]=useState('All'); const visible=filter==='All'?posts:posts.filter(p=>p.status===filter)
  return <div className="page"><PageHead title="Scheduler" copy="Create, edit, publish and manage multi-platform posts." action={<button className="primary-btn" onClick={()=>openComposer({})}><Plus size={17}/> Schedule Post</button>}/><div className="toolbar-row"><div className="segment-control compact-segments">{['All','Scheduled','Draft','Published','Demo Published'].map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}</button>)}</div></div><section className="scheduler-layout"><article className="card module-card calendar-panel"><div className="calendar-head"><div><h3>August 2026</h3><p>Content calendar</p></div><CalendarDays size={20}/></div><div className="calendar-grid">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=><b key={x}>{x}</b>)}{Array.from({length:35},(_,i)=>i<3?'':i-2).map((d,i)=><span className={d===29?'today':''} key={i}>{d||''}</span>)}</div></article><article className="card module-card"><div className="card-title-row"><div><h3>Publishing queue</h3><p>{visible.length} items</p></div><Clock3 size={18}/></div><div className="post-queue">{visible.map(p=><div className="queue-item queue-actions" key={p.id}><div className="queue-time"><b>{p.time}</b><span>{p.date}</span></div><div className="queue-copy"><strong>{p.title}</strong><small>{p.platforms.join(' · ')}{p.mediaName?` · ${p.mediaName}`:''}</small></div><b className={`status ${String(p.status).toLowerCase().replace(' ','-')}`}>{p.status}</b><div className="row-action-buttons"><button className="icon-btn" title="Edit" onClick={()=>openComposer(p)}><Edit3 size={14}/></button><button className="icon-btn" title="Publish now" onClick={()=>publishNow(p)}><Send size={14}/></button><button className="icon-btn danger" title="Delete" onClick={()=>remove(p.id)}><Trash2 size={14}/></button></div></div>)}</div></article></section></div>
}

function Inbox(){
  const [selected,setSelected]=useState(0);const [query,setQuery]=useState('');const [reply,setReply]=useState('');const [sent,setSent]=useState({});const filtered=inboxSeed.map((m,i)=>({m,i})).filter(({m})=>`${m[0]} ${m[1]} ${m[2]}`.toLowerCase().includes(query.toLowerCase()));const current=inboxSeed[selected]
  return <div className="page"><PageHead title="Unified Inbox" copy="Search conversations and reply from one interface."/><section className="inbox-layout"><article className="card conversation-list"><div className="inbox-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search conversations"/></div>{filtered.length?filtered.map(({m,i})=><button className={`conversation ${selected===i?'selected':''}`} key={m[0]} onClick={()=>setSelected(i)}><div className="avatar">{m[0][0]}</div><div><strong>{m[0]}<small>{m[1]}</small></strong><p>{m[2]}</p></div><time>{m[3]}</time></button>):<div className="empty-mini">No conversations found.</div>}</article><article className="card chat-panel"><div className="chat-head"><div className="avatar">{current[0][0]}</div><div><strong>{current[0]}</strong><small>{current[1]} · {apiBaseConfigured?'Backend ready':'Demo conversation'}</small></div></div><div className="chat-body"><div className="bubble incoming">{current[2]}</div>{sent[selected]&&<div className="bubble outgoing">{sent[selected]}</div>}</div><div className="reply-box"><textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Write a reply..."/><button className="primary-btn" onClick={()=>{if(reply.trim()){setSent({...sent,[selected]:reply.trim()});setReply('')}}}><MessageSquareReply size={16}/> Reply</button></div></article></section></div>
}

function AIStudio({brand,openBrand,setToast}){
  const [idea,setIdea]=useState('Launch our new social media automation service for small businesses');const [type,setType]=useState('Caption');const [result,setResult]=useState('');const [busy,setBusy]=useState(false)
  const localGenerate=()=>{const base=`Brand: ${brand.name}. Tone: ${brand.tone}. Audience: ${brand.audience}.`;if(type==='Image Prompt')return `${base} Create a polished social media visual for: ${idea}. Premium digital workspace, modern composition, strong focal point, clean typography area, platform-ready 4:5 ratio.`;if(type==='Video Concept')return `${base} Video concept: Hook the problem in the first 2 seconds, demonstrate the workflow, show AI content + scheduling, and end with a clear CTA. Topic: ${idea}.`;return `${idea} — simplify your workflow, create smarter content and manage every channel from one place. Built for ${brand.audience}. #SocialMedia #Automation #AI`}
  const generate=async()=>{setBusy(true);try{if(apiBaseConfigured){const data=await generateWithAI({type,idea,brand});setResult(data.result||data.text||localGenerate());setToast('AI response generated through backend.')}else{setResult(localGenerate());setToast('Generated with local smart template. Connect an AI backend for model output.')}}catch(e){setResult(localGenerate());setToast(`Backend unavailable; local generator used. ${e.message}`)}finally{setBusy(false)}}
  return <div className="page"><PageHead title="AI Studio" copy="Brand-aware caption, image-prompt and video-concept workspace." action={<button className="ghost-btn" onClick={openBrand}><Target size={16}/> Brand Setup</button>}/><section className="ai-studio-grid"><article className="card module-card ai-workbench"><div className="card-title-row"><div><h3>What do you want to create?</h3><p>Current brand: {brand.name}</p></div><Bot size={21}/></div><div className="segment-control">{['Caption','Image Prompt','Video Concept'].map(x=><button key={x} className={type===x?'active':''} onClick={()=>setType(x)}>{x==='Caption'?<FileText size={15}/>:x==='Image Prompt'?<FileImage size={15}/>:<Video size={15}/>} {x}</button>)}</div><textarea className="big-input" value={idea} onChange={e=>setIdea(e.target.value)}/><div className="ai-footer"><span><Sparkles size={15}/> Uses saved brand context</span><button className="primary-btn" disabled={busy} onClick={generate}><WandSparkles size={16}/>{busy?'Generating…':'Generate'}</button></div></article><article className="card module-card result-panel"><div className="card-title-row"><div><h3>AI output</h3><p>{apiBaseConfigured?'Backend-capable':'Local fallback active'}</p></div><button className="icon-btn" onClick={()=>setResult('')}><RefreshCw size={16}/></button></div>{result?<><div className="result-copy">{result}</div><button className="wide-ghost result-download" onClick={()=>downloadText(`az-${type.toLowerCase().replace(' ','-')}.txt`,result)}><Download size={15}/> Download result</button></>:<div className="empty-state"><Sparkles size={34}/><strong>Your generated result appears here</strong><p>Connect a backend AI provider when ready; local generation remains usable without a key.</p></div>}</article></section></div>
}

function ContentLibrary({content,setContent,openComposer}){
  const [preview,setPreview]=useState(null);const [edit,setEdit]=useState(null);const save=(item)=>{setContent(content.map(c=>c.id===item.id?item:c));setEdit(null)}
  return <div className="page"><PageHead title="Content" copy="Preview, edit and reuse social content." action={<button className="primary-btn" onClick={()=>openComposer({})}><Plus size={17}/> New Content</button>}/><div className="content-library">{content.map((item,i)=><article className="card content-card" key={item.id}><div className="content-preview">{item.type==='Video'?<Video size={28}/>:<Image size={28}/>}</div><div><small>{item.type}</small><h3>{item.title}</h3><span className={`status ${item.status.toLowerCase()}`}>{item.status}</span></div><div className="content-actions"><button className="icon-btn" onClick={()=>setPreview(item)}><Eye size={16}/></button><button className="icon-btn" onClick={()=>setEdit(item)}><Edit3 size={16}/></button><button className="icon-btn danger" onClick={()=>setContent(content.filter(c=>c.id!==item.id))}><Trash2 size={15}/></button></div></article>)}</div>{preview&&<SimpleModal title={preview.title} onClose={()=>setPreview(null)}><div className="preview-block"><span className="status active">{preview.type}</span><p>{preview.body}</p><small>Platforms: {preview.platforms.join(', ')}</small><button className="primary-btn" onClick={()=>{openComposer({title:preview.title,body:preview.body,platforms:preview.platforms,status:'Draft'});setPreview(null)}}><Send size={15}/> Use in post</button></div></SimpleModal>}{edit&&<ContentEdit item={edit} onClose={()=>setEdit(null)} onSave={save}/>}</div>
}

function Campaigns({campaigns,setCampaigns}){
  const [modal,setModal]=useState(null);const [details,setDetails]=useState(null);const toggle=id=>setCampaigns(campaigns.map(c=>c.id===id?{...c,status:c.status==='Active'?'Paused':'Active'}:c));const remove=id=>setCampaigns(campaigns.filter(c=>c.id!==id));const save=item=>{setCampaigns(item.id?campaigns.map(c=>c.id===item.id?item:c):[{...item,id:uid(),progress:0},...campaigns]);setModal(null)}
  return <div className="page"><PageHead title="Campaigns" copy="Create, inspect, pause and manage cross-platform campaigns." action={<button className="primary-btn" onClick={()=>setModal({})}><Plus size={17}/> New Campaign</button>}/><div className="campaign-board">{campaigns.map(c=><article className="card campaign-tile" key={c.id}><div className="campaign-icon"><Zap size={20}/></div><small>{c.platforms.length} channels · ${Number(c.budget||0).toLocaleString()}</small><h3>{c.name}</h3><div className="progress-wrap"><span><i style={{width:`${c.progress||0}%`}}/></span><small>{c.progress||0}%</small></div><b className={`status ${c.status.toLowerCase()}`}>{c.status}</b><div className="campaign-actions"><button className="ghost-btn" onClick={()=>setDetails(c)}><Eye size={14}/> Details</button><button className="icon-btn" onClick={()=>toggle(c.id)}>{c.status==='Active'?<Pause size={14}/>:<Play size={14}/>}</button><button className="icon-btn" onClick={()=>setModal(c)}><Edit3 size={14}/></button><button className="icon-btn danger" onClick={()=>remove(c.id)}><Trash2 size={14}/></button></div></article>)}</div>{modal&&<CampaignModal item={modal} onClose={()=>setModal(null)} onSave={save}/>} {details&&<SimpleModal title={details.name} onClose={()=>setDetails(null)}><div className="details-grid"><p><b>Goal:</b> {details.goal}</p><p><b>Status:</b> {details.status}</p><p><b>Platforms:</b> {details.platforms.join(', ')}</p><p><b>Budget:</b> ${details.budget}</p><p><b>Dates:</b> {details.start} → {details.end}</p><p><b>Progress:</b> {details.progress}%</p></div></SimpleModal>}</div>
}

function Contacts({contacts,setContacts}){
  const [query,setQuery]=useState('');const [modal,setModal]=useState(null);const [view,setView]=useState(null);const visible=contacts.filter(c=>`${c.name} ${c.email} ${c.source} ${c.status} ${c.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));const save=item=>{setContacts(item.id?contacts.map(c=>c.id===item.id?item:c):[{...item,id:uid(),lastInteraction:'now'},...contacts]);setModal(null);setView(null)}
  return <div className="page"><PageHead title="Contacts" copy="Social CRM with profiles, notes, tags and follow-up dates." action={<button className="primary-btn" onClick={()=>setModal({})}><UserPlus size={16}/> Add Contact</button>}/><article className="card module-card"><div className="list-toolbar"><div className="inbox-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search contacts, tags or source"/></div><span>{visible.length} contacts</span></div><div className="contact-table">{visible.map(c=><div className="contact-row contact-row-wide" key={c.id}><div className="avatar">{c.name[0]}</div><div><strong>{c.name}</strong><small>{c.source} · {c.email}</small></div><span>{c.status}</span><b>{c.temperature}</b><div className="tag-mini">{c.tags.slice(0,2).map(t=><em key={t}>{t}</em>)}</div><button className="ghost-btn" onClick={()=>setView(c)}>View</button></div>)}</div></article>{view&&<SimpleModal title={view.name} onClose={()=>setView(null)}><div className="contact-detail"><p><b>Email:</b> {view.email||'—'}</p><p><b>Phone:</b> {view.phone||'—'}</p><p><b>Source:</b> {view.source}</p><p><b>Status:</b> {view.status}</p><p><b>Follow-up:</b> {view.followUp||'—'}</p><div className="detail-tags">{view.tags.map(t=><span key={t}><Tag size={12}/>{t}</span>)}</div><p className="notes-box">{view.notes||'No notes yet.'}</p><button className="primary-btn" onClick={()=>{setModal(view);setView(null)}}><Edit3 size={15}/> Edit contact</button></div></SimpleModal>}{modal&&<ContactModal item={modal} onClose={()=>setModal(null)} onSave={save}/>}</div>
}

function Integrations({integrations,setIntegrations,setToast}){
  const connect=(name)=>{const url=oauthUrl(name);if(url){window.location.href=url;return}setIntegrations({...integrations,[name]:!integrations[name]});setToast(`${name} ${integrations[name]?'disconnected':'enabled in demo mode'}. Add backend OAuth for a real connection.`)}
  return <div className="page"><PageHead title="Integrations" copy="Connect social channels and infrastructure."/><div className="integration-grid">{accounts.map(a=><article className="card integration-card" key={a.name}><div className={`social-logo ${a.tone}`}>{a.icon}</div><div><h3>{a.name}</h3><p>{integrations[a.name]?(apiBaseConfigured?'Connected/authorized':'Demo connection enabled'):'Not connected'}</p></div><button className={integrations[a.name]?'ghost-btn connected':'primary-btn'} onClick={()=>connect(a.name)}>{integrations[a.name]?<><Check size={15}/> {apiBaseConfigured?'Connected':'Demo connected'}</>:<><Link2 size={15}/> Connect</>}</button></article>)}<article className="card integration-card infra"><Database size={25}/><div><h3>Database</h3><p>{isSupabaseConfigured?'Supabase environment detected.':'Add Supabase URL and anon key.'}</p></div><span className={`status ${isSupabaseConfigured?'active':'draft'}`}>{isSupabaseConfigured?'Configured':'Environment needed'}</span></article><article className="card integration-card infra"><Sparkles size={25}/><div><h3>Backend API</h3><p>{apiBaseConfigured?'API base URL configured.':'Set VITE_API_BASE_URL for server actions.'}</p></div><span className={`status ${apiBaseConfigured?'active':'draft'}`}>{apiBaseConfigured?'Configured':'Environment needed'}</span></article></div><article className="card module-card security-card"><ShieldCheck size={24}/><div><h3>Production security</h3><p>OAuth tokens and secret keys stay server-side. Frontend buttons now redirect to backend OAuth routes when VITE_API_BASE_URL is configured; otherwise they operate in clearly labeled demo mode.</p></div></article></div>
}

function SettingsPage({brand,openBrand,notifications,setNotifications}){
  return <div className="page"><PageHead title="Settings" copy="Workspace preferences and production setup."/><section className="settings-grid"><article className="card module-card"><UserRound size={22}/><h3>Workspace profile</h3><p>Brand: <b>{brand.name}</b></p><p>Industry: {brand.industry}</p><button className="ghost-btn" onClick={openBrand}><Edit3 size={15}/> Edit Brand Setup</button></article><article className="card module-card"><ShieldCheck size={22}/><h3>Authentication</h3><p>{isSupabaseConfigured?'Supabase authentication is active.':'Functional demo auth is active. Add Supabase credentials for production auth.'}</p><span className={`status ${isSupabaseConfigured?'active':'draft'}`}>{isSupabaseConfigured?'Live':'Demo'}</span></article><article className="card module-card"><Bell size={22}/><h3>Notifications</h3><p>{notifications.filter(n=>!n.read).length} unread notifications.</p><button className="ghost-btn" onClick={()=>setNotifications(notifications.map(n=>({...n,read:true})))}><Check size={15}/> Mark all read</button></article></section></div>
}

function Composer({initial,brand,onClose,onSave,onPublish}){
  const mediaRef=useRef(null);const [form,setForm]=useState({id:initial.id||'',title:initial.title||'',body:initial.body||initial.title||'',date:initial.date||'2026-08-29',time:initial.time||'10:00',status:initial.status||'Scheduled',platforms:initial.platforms||['Instagram','Facebook'],mediaName:initial.mediaName||'',mediaType:initial.mediaType||''});const [preview,setPreview]=useState('')
  const toggle=name=>setForm({...form,platforms:form.platforms.includes(name)?form.platforms.filter(x=>x!==name):[...form.platforms,name]});const writeAI=()=>{const seed=form.body.trim()||form.title.trim()||'your next campaign';setForm({...form,body:`${seed} — built for ${brand.audience}. ${brand.tone} voice, clear benefit, strong CTA. #${brand.name.replace(/\s+/g,'')} #SocialMedia #Growth`})};const pickMedia=e=>{const file=e.target.files?.[0];if(!file)return;setForm({...form,mediaName:file.name,mediaType:file.type});setPreview(URL.createObjectURL(file))};const valid=()=>form.title.trim()&&form.platforms.length
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="composer composer-wide" onMouseDown={e=>e.stopPropagation()}><div className="composer-head"><div><span className="eyebrow"><Sparkles size={14}/> Multi-platform composer</span><h2>{form.id?'Edit post':'Create / schedule post'}</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div><label>Publish to</label><div className="platform-selector">{accounts.map(a=><button key={a.name} className={form.platforms.includes(a.name)?'selected':''} onClick={()=>toggle(a.name)}><span className={`social-logo ${a.tone}`}>{a.icon}</span>{a.name}</button>)}</div><label>Post title<input className="composer-title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Post title"/></label><label>Post content</label><textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write once. Publish everywhere..."/><div className="composer-tools"><input ref={mediaRef} type="file" accept="image/*,video/*" hidden onChange={pickMedia}/><button className="ghost-btn" onClick={()=>mediaRef.current?.click()}><Upload size={16}/> {form.mediaName?'Change media':'Add media'}</button><button className="ghost-btn" onClick={writeAI}><Sparkles size={16}/> Write with AI</button>{form.mediaName&&<span className="media-chip">{form.mediaName}</span>}</div>{preview&&<div className="media-preview">{form.mediaType.startsWith('image')?<img src={preview} alt="Selected media preview"/>:<video src={preview} controls/>}</div>}<div className="form-row"><label>Date<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Time<input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Scheduled</option><option>Draft</option></select></label></div><div className="composer-footer"><button className="ghost-btn" onClick={onClose}>Cancel</button><button className="ghost-btn" disabled={!valid()} onClick={()=>onSave({...form,status:'Draft'})}><Save size={16}/> Save Draft</button><button className="primary-btn" disabled={!valid()} onClick={()=>form.status==='Draft'?onSave(form):onPublish(form)}><Send size={16}/>{form.status==='Draft'?'Save':'Publish / Queue'} to {form.platforms.length}</button></div></div></div>
}

function BrandModal({brand,onClose,onSave}){const [form,setForm]=useState(brand);const field=k=><input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>;return <div className="modal-backdrop" onMouseDown={onClose}><div className="composer brand-modal" onMouseDown={e=>e.stopPropagation()}><div className="composer-head"><div><span className="eyebrow"><Target size={14}/> AI brand context</span><h2>Brand Setup</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div><div className="brand-form"><label>Brand name{field('name')}</label><label>Industry{field('industry')}</label><label>Target audience{field('audience')}</label><label>Brand tone{field('tone')}</label><label className="wide">Brand description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label className="wide">Main goals<textarea value={form.goals} onChange={e=>setForm({...form,goals:e.target.value})}/></label></div><div className="composer-footer"><button className="ghost-btn" onClick={onClose}>Cancel</button><button className="primary-btn" onClick={()=>onSave(form)}><Save size={16}/> Save Brand Context</button></div></div></div>}

function GlobalSearch({posts,contacts,content,campaigns,onClose,onNavigate}){const [q,setQ]=useState('');const input=useRef(null);useEffect(()=>input.current?.focus(),[]);const pages=navItems.map(([label,Icon])=>({type:'Page',title:label,page:label,Icon}));const data=[...pages,...posts.map(x=>({type:'Post',title:x.title,page:'Scheduler',Icon:CalendarDays})),...contacts.map(x=>({type:'Contact',title:x.name,page:'Contacts',Icon:ContactRound})),...content.map(x=>({type:'Content',title:x.title,page:'Content',Icon:FileText})),...campaigns.map(x=>({type:'Campaign',title:x.name,page:'Campaigns',Icon:Zap}))];const results=data.filter(x=>`${x.type} ${x.title}`.toLowerCase().includes(q.toLowerCase())).slice(0,12);return <div className="modal-backdrop search-backdrop" onMouseDown={onClose}><div className="global-search card" onMouseDown={e=>e.stopPropagation()}><div className="global-search-input"><Search size={19}/><input ref={input} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search pages, posts, contacts, campaigns..."/><button className="icon-btn" onClick={onClose}><X size={17}/></button></div><div className="search-results">{results.map((r,i)=><button key={`${r.type}-${r.title}-${i}`} onClick={()=>onNavigate(r.page)}><r.Icon size={16}/><div><strong>{r.title}</strong><small>{r.type} · Open {r.page}</small></div><span>↵</span></button>)}{!results.length&&<div className="empty-mini">No results found.</div>}</div></div></div>}

function NotificationMenu({notifications,setNotifications,onClose}){const mark=id=>setNotifications(notifications.map(n=>n.id===id?{...n,read:true}:n));return <div className="pop-menu notification-menu"><div className="pop-head"><strong>Notifications</strong><button onClick={()=>setNotifications(notifications.map(n=>({...n,read:true})))}>Mark all read</button></div>{notifications.map(n=><button className={`notification-item ${n.read?'':'unread'}`} key={n.id} onClick={()=>mark(n.id)}><span/><div><strong>{n.title}</strong><p>{n.copy}</p></div><time>{n.time}</time></button>)}<button className="pop-footer" onClick={onClose}>Close</button></div>}
function ProfileMenu({session,onSettings,onLogout}){return <div className="pop-menu profile-menu"><div className="profile-summary"><CircleUserRound size={34}/><div><strong>{session.name}</strong><small>{session.email}</small></div></div><button onClick={onSettings}><Settings size={16}/> Settings</button><button onClick={onLogout}><LogOut size={16}/> Log out</button></div>}

function ContentEdit({item,onClose,onSave}){const [form,setForm]=useState(item);return <SimpleModal title="Edit content" onClose={onClose}><div className="stack-form"><label>Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Post</option><option>Carousel</option><option>Video</option><option>Campaign post</option></select></label><label>Body<textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Draft</option><option>Ready</option><option>Scheduled</option></select></label><button className="primary-btn" onClick={()=>onSave(form)}><Save size={15}/> Save changes</button></div></SimpleModal>}
function CampaignModal({item,onClose,onSave}){const [form,setForm]=useState({id:item.id||'',name:item.name||'',goal:item.goal||'Sales',platforms:item.platforms||['Instagram','Facebook'],status:item.status||'Draft',progress:item.progress||0,budget:item.budget||500,start:item.start||'2026-09-01',end:item.end||'2026-09-30'});const toggle=p=>setForm({...form,platforms:form.platforms.includes(p)?form.platforms.filter(x=>x!==p):[...form.platforms,p]});return <SimpleModal title={form.id?'Edit campaign':'New campaign'} onClose={onClose}><div className="stack-form"><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><div className="form-row"><label>Goal<select value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}><option>Sales</option><option>Leads</option><option>Traffic</option><option>Awareness</option></select></label><label>Budget<input type="number" value={form.budget} onChange={e=>setForm({...form,budget:Number(e.target.value)})}/></label></div><label>Platforms</label><div className="platform-selector">{accounts.map(a=><button key={a.name} className={form.platforms.includes(a.name)?'selected':''} onClick={()=>toggle(a.name)}><span className={`social-logo ${a.tone}`}>{a.icon}</span>{a.name}</button>)}</div><div className="form-row"><label>Start<input type="date" value={form.start} onChange={e=>setForm({...form,start:e.target.value})}/></label><label>End<input type="date" value={form.end} onChange={e=>setForm({...form,end:e.target.value})}/></label></div><button className="primary-btn" disabled={!form.name.trim()||!form.platforms.length} onClick={()=>onSave(form)}><Save size={15}/> Save campaign</button></div></SimpleModal>}
function ContactModal({item,onClose,onSave}){const [form,setForm]=useState({id:item.id||'',name:item.name||'',email:item.email||'',phone:item.phone||'',source:item.source||'Instagram',status:item.status||'Lead',temperature:item.temperature||'Warm',tags:item.tags||[],notes:item.notes||'',followUp:item.followUp||'2026-09-05',lastInteraction:item.lastInteraction||'now'});const [tags,setTags]=useState(form.tags.join(', '));return <SimpleModal title={form.id?'Edit contact':'Add contact'} onClose={onClose}><div className="stack-form"><div className="form-row"><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Email<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label></div><div className="form-row"><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Source<select value={form.source} onChange={e=>setForm({...form,source:e.target.value})}>{accounts.map(a=><option key={a.name}>{a.name}</option>)}</select></label></div><div className="form-row"><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Lead</option><option>Prospect</option><option>Customer</option><option>VIP</option><option>Creator</option><option>Partner</option></select></label><label>Temperature<select value={form.temperature} onChange={e=>setForm({...form,temperature:e.target.value})}><option>Cold</option><option>Warm</option><option>Active</option><option>Hot</option></select></label></div><label>Tags<input value={tags} onChange={e=>setTags(e.target.value)} placeholder="lead, buyer, vip"/></label><label>Follow-up<input type="date" value={form.followUp} onChange={e=>setForm({...form,followUp:e.target.value})}/></label><label>Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label><button className="primary-btn" disabled={!form.name.trim()} onClick={()=>onSave({...form,tags:tags.split(',').map(x=>x.trim()).filter(Boolean)})}><Save size={15}/> Save contact</button></div></SimpleModal>}
function SimpleModal({title,onClose,children}){return <div className="modal-backdrop" onMouseDown={onClose}><div className="simple-modal card" onMouseDown={e=>e.stopPropagation()}><div className="composer-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</div></div>}

export default App
