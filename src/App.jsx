import { useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  Command,
  ContactRound,
  FileText,
  Gauge,
  Image,
  Instagram,
  LayoutDashboard,
  Link2,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Users,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'

const navItems = [
  ['Dashboard', LayoutDashboard],
  ['Analytics', BarChart3],
  ['Scheduler', CalendarDays],
  ['Inbox', Mail, '12'],
  ['AI Studio', Sparkles],
  ['Content', FileText],
  ['Campaigns', Zap],
  ['Contacts', ContactRound],
  ['Integrations', Link2],
  ['Settings', Settings],
]

const accounts = [
  { name: 'Instagram', handle: '@az.multi', icon: 'IG', tone: 'pink' },
  { name: 'Facebook', handle: 'AZ Multi', icon: 'f', tone: 'blue' },
  { name: 'TikTok', handle: '@az.multi', icon: '♪', tone: 'dark' },
  { name: 'X', handle: '@az_multi', icon: '𝕏', tone: 'dark' },
]

const stats = [
  { label: 'Total Followers', value: '128.4K', change: '+12.5%', icon: Users },
  { label: 'Engagement Rate', value: '6.83%', change: '+18.7%', icon: Activity },
  { label: 'Impressions', value: '2.45M', change: '+21.3%', icon: Gauge },
  { label: 'Profile Clicks', value: '24.6K', change: '+15.4%', icon: Command },
]

const upcoming = [
  ['09:00 AM', 'Instagram', 'New collection drop this week ✨'],
  ['11:30 AM', 'TikTok', 'Behind the scenes of our shoot 🎬'],
  ['02:00 PM', 'X', 'Tips for growing your brand in 2026'],
  ['05:00 PM', 'Facebook', 'Live Q&A session — ask us anything!'],
]

const inbox = [
  ['Sarah Wilson', 'Instagram', 'Love this! Where can I buy it?', '2m'],
  ['Mike Chen', 'X', 'Thanks for the tip! Super helpful 🙌', '10m'],
  ['@design.lovers', 'TikTok', 'Do you offer custom designs?', '1h'],
  ['Emily Johnson', 'Facebook', 'Amazing work as always! 🔥', '2h'],
]

const campaigns = [
  ['Summer Collection Launch', 'May 10 – May 30', 78, 'Active'],
  ['Brand Awareness Boost', 'Apr 15 – May 5', 100, 'Completed'],
  ['Product Teaser Series', 'May 20 – Jun 10', 25, 'Draft'],
]

const topContent = [
  ['New Collection Drop', 'Instagram', '12.4K', '+32%'],
  ['Behind the Scenes', 'TikTok', '9.7K', '+24%'],
  ['Design Tips for 2026', 'X', '7.1K', '+18%'],
  ['Live Q&A Highlights', 'Facebook', '5.8K', '+15%'],
]

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('az-theme') || 'future')
  const [active, setActive] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [generated, setGenerated] = useState('')

  const themeIcon = useMemo(() => ({ light: Sun, dark: Moon, future: Sparkles }[theme]), [theme])
  const ThemeIcon = themeIcon

  const switchTheme = (next) => {
    setTheme(next)
    localStorage.setItem('az-theme', next)
  }

  const generateCaption = () => {
    const seed = prompt.trim() || 'a new product launch'
    setGenerated(`✨ ${seed.charAt(0).toUpperCase() + seed.slice(1)} — crafted for your audience, ready for every channel. #AZMulti #SocialGrowth`)
  }

  return (
    <div className={`app theme-${theme}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand-wrap">
          <div className="brand-mark"><span>A</span><span>Z</span></div>
          <div>
            <strong>AZ MULTI</strong>
            <small>AI SOCIAL SUITE</small>
          </div>
          <button className="icon-btn sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav className="nav-list">
          {navItems.map(([label, Icon, badge]) => (
            <button
              key={label}
              className={`nav-item ${active === label ? 'active' : ''}`}
              onClick={() => { setActive(label); setSidebarOpen(false) }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {badge && <b className="nav-badge">{badge}</b>}
            </button>
          ))}
        </nav>

        <div className="upgrade-card">
          <div className="upgrade-icon"><Sparkles size={22} /></div>
          <strong>Upgrade to Pro</strong>
          <p>Unlock advanced AI, automation and analytics.</p>
          <button>Explore Pro <span>→</span></button>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="search-box">
            <Search size={17} />
            <input placeholder="Search anything..." />
            <kbd>⌘ K</kbd>
          </div>

          <button className="integration-btn"><Link2 size={17} /> Integrations</button>

          <div className="theme-switcher">
            {['light', 'dark', 'future'].map((mode) => (
              <button key={mode} className={theme === mode ? 'selected' : ''} onClick={() => switchTheme(mode)}>
                {mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'Future'}
              </button>
            ))}
          </div>

          <button className="icon-btn"><Bell size={19} /><span className="notif-dot">3</span></button>
          <button className="profile-btn"><CircleUserRound size={27} /><span>James</span><ChevronDown size={15} /></button>
        </header>

        {active === 'Dashboard' ? (
          <Dashboard
            theme={theme}
            ThemeIcon={ThemeIcon}
            prompt={prompt}
            setPrompt={setPrompt}
            generated={generated}
            generateCaption={generateCaption}
            onCreatePost={() => setComposerOpen(true)}
          />
        ) : (
          <SectionPlaceholder title={active} onCreatePost={() => setComposerOpen(true)} />
        )}
      </main>

      {composerOpen && <Composer onClose={() => setComposerOpen(false)} />}
    </div>
  )
}

function Dashboard({ theme, ThemeIcon, prompt, setPrompt, generated, generateCaption, onCreatePost }) {
  return (
    <div className="page dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow"><ThemeIcon size={14} /> {theme} workspace</span>
          <h1>Hi, James! <span>👋</span></h1>
          <p>Here’s what’s happening with your social channels today.</p>
        </div>
        <button className="primary-btn" onClick={onCreatePost}><Plus size={18} /> Create Post</button>
      </div>

      <section className="stats-grid">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <article className="card stat-card" key={label}>
            <div className="stat-head"><span>{label}</span><span className="stat-icon"><Icon size={19} /></span></div>
            <strong>{value}</strong>
            <small><b>↑ {change}</b> vs last 30 days</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid upper-grid">
        <article className="card performance-card">
          <div className="card-title-row"><div><h3>Performance Overview</h3><p>Engagement, impressions & profile clicks</p></div><button className="ghost-btn">Last 30 Days <ChevronDown size={14} /></button></div>
          <div className="chart-legend"><span><i className="dot purple" /> Engagement</span><span><i className="dot blue" /> Impressions</span><span><i className="dot aqua" /> Profile Clicks</span></div>
          <div className="fake-chart" aria-label="Performance chart">
            <div className="chart-grid-lines" />
            <svg viewBox="0 0 700 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="fillLine" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".24"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient>
              </defs>
              <path className="area-line" d="M0,168 C70,134 104,153 152,116 C218,65 240,120 300,85 C360,50 390,85 442,70 C500,54 532,82 575,45 C622,7 650,50 700,18 L700,220 L0,220Z" fill="url(#fillLine)" />
              <path className="line main-line" d="M0,168 C70,134 104,153 152,116 C218,65 240,120 300,85 C360,50 390,85 442,70 C500,54 532,82 575,45 C622,7 650,50 700,18" />
              <path className="line second-line" d="M0,190 C60,172 110,180 155,151 C210,123 247,165 306,134 C360,103 398,127 450,108 C508,85 550,111 603,80 C645,58 671,75 700,55" />
              <path className="line third-line" d="M0,205 C67,196 105,202 158,180 C218,159 246,193 306,167 C361,143 410,165 460,145 C514,124 548,149 600,121 C644,101 675,118 700,96" />
            </svg>
            <div className="chart-labels"><span>Apr 21</span><span>Apr 28</span><span>May 5</span><span>May 12</span><span>May 19</span></div>
          </div>
        </article>

        <article className="card schedule-card">
          <div className="card-title-row"><div><h3>Upcoming Posts</h3><p>May 22, 2026</p></div><CalendarDays size={18} /></div>
          <div className="mini-calendar">
            {['19','20','21','22','23','24','25'].map((d) => <span key={d} className={d === '22' ? 'current' : ''}>{d}</span>)}
          </div>
          <div className="schedule-list">
            {upcoming.map(([time, platform, text]) => (
              <div className="schedule-row" key={time}>
                <time>{time}</time><span className="platform-dot">{platform[0]}</span><p>{text}</p><b>Scheduled</b>
              </div>
            ))}
          </div>
          <button className="wide-ghost">View Calendar</button>
        </article>

        <article className="card accounts-card">
          <div className="card-title-row"><div><h3>Connected Accounts</h3><p>4 channels active</p></div><button className="text-btn">Manage All</button></div>
          <div className="account-grid">
            {accounts.map((a) => <div className="account-tile" key={a.name}><div className={`social-logo ${a.tone}`}>{a.icon}</div><strong>{a.name}</strong><small>{a.handle}</small><i className="online-dot" /></div>)}
          </div>
          <button className="add-account"><Plus size={17}/> Add account</button>
        </article>
      </section>

      <section className="dashboard-grid lower-grid">
        <article className="card ai-card">
          <div className="ai-orb"><Bot size={28} /></div>
          <div className="card-title-row"><div><h3>AI Content Studio</h3><p>Turn one idea into channel-ready content.</p></div><WandSparkles size={20} /></div>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Example: Promote our summer collection with a premium, friendly tone..." />
          {generated && <div className="generated-copy">{generated}</div>}
          <div className="ai-actions"><button className="ghost-btn">Brand Voice <ChevronDown size={13}/></button><button className="ghost-btn">All Platforms <ChevronDown size={13}/></button><button className="primary-btn compact" onClick={generateCaption}><Sparkles size={15}/> Generate</button></div>
        </article>

        <article className="card campaigns-card">
          <div className="card-title-row"><div><h3>Recent Campaigns</h3><p>Cross-channel progress</p></div><button className="text-btn">View All</button></div>
          <div className="campaign-list">
            {campaigns.map(([name, date, progress, status]) => <div className="campaign-row" key={name}><div className="campaign-thumb"><Zap size={17}/></div><div className="campaign-copy"><strong>{name}</strong><small>{date}</small></div><div className="progress-wrap"><span><i style={{width: `${progress}%`}}/></span><small>{progress}%</small></div><b className={`status ${status.toLowerCase()}`}>{status}</b></div>)}
          </div>
        </article>

        <article className="card inbox-card">
          <div className="card-title-row"><div><h3>Unified Inbox</h3><p>12 unread across all channels</p></div><button className="text-btn">View All</button></div>
          <div className="message-list">
            {inbox.map(([name, platform, text, time]) => <div className="message-row" key={name}><div className="avatar">{name[0]}</div><div><strong>{name}<small>{platform}</small></strong><p>{text}</p></div><time>{time}</time></div>)}
          </div>
          <button className="wide-ghost"><MessageCircle size={15}/> Open Inbox</button>
        </article>
      </section>

      <section className="card top-content-card">
        <div className="card-title-row"><div><h3>Top Content Performance</h3><p>Best performing content this month</p></div><button className="text-btn">View Analytics</button></div>
        <div className="content-table">
          {topContent.map(([name, platform, engagement, growth], index) => <div className="content-row" key={name}><span className="rank">0{index + 1}</span><div className="content-thumb"><Image size={17}/></div><div className="content-name"><strong>{name}</strong><small>{platform}</small></div><span className="engagement">{engagement}</span><b>{growth}</b><button className="icon-btn"><Send size={15}/></button></div>)}
        </div>
      </section>
    </div>
  )
}

function SectionPlaceholder({ title, onCreatePost }) {
  return <div className="page section-placeholder"><div className="page-heading"><div><span className="eyebrow"><Sparkles size={14}/> AZ Multi workspace</span><h1>{title}</h1><p>This module is scaffolded and ready for the next build phase.</p></div><button className="primary-btn" onClick={onCreatePost}><Plus size={18}/> Create Post</button></div><div className="card placeholder-card"><div className="placeholder-icon"><Sparkles size={30}/></div><h2>{title} module</h2><p>The navigation, theme system and dashboard shell are live. Next we’ll connect this section to real social APIs, data and automation flows.</p></div></div>
}

function Composer({ onClose }) {
  const [selected, setSelected] = useState(['Instagram', 'Facebook'])
  const toggle = (name) => setSelected((current) => current.includes(name) ? current.filter((x) => x !== name) : [...current, name])

  return <div className="modal-backdrop" onMouseDown={onClose}><div className="composer" onMouseDown={(e) => e.stopPropagation()}><div className="composer-head"><div><span className="eyebrow"><Sparkles size={14}/> Multi-platform composer</span><h2>Create a new post</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div><label>Publish to</label><div className="platform-selector">{accounts.map((a) => <button key={a.name} className={selected.includes(a.name) ? 'selected' : ''} onClick={() => toggle(a.name)}><span className={`social-logo ${a.tone}`}>{a.icon}</span>{a.name}</button>)}</div><label>Post content</label><textarea placeholder="Write once. Publish everywhere..."/><div className="composer-tools"><button className="ghost-btn"><Image size={16}/> Add media</button><button className="ghost-btn"><Sparkles size={16}/> Write with AI</button></div><div className="composer-footer"><button className="ghost-btn"><CalendarDays size={16}/> Schedule</button><button className="primary-btn"><Send size={16}/> Publish to {selected.length || 0} channels</button></div></div></div>
}

export default App
