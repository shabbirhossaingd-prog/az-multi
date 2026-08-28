import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Check, Eye, Search, Send, Sparkles, Target, X, Zap } from 'lucide-react'
import './ads.css'

const PLATFORMS = [
  { name: 'Facebook', icon: 'f', type: 'Audience + creative targeting', best: 'Lead generation, retargeting, local offers' },
  { name: 'Instagram', icon: 'IG', type: 'Audience + creative targeting', best: 'Visual products, lifestyle, ecommerce' },
  { name: 'TikTok', icon: '♪', type: 'Interest + creative targeting', best: 'Discovery, short-form video, younger audiences' },
  { name: 'Google', icon: 'G', type: 'Search keywords + intent', best: 'High-intent searches, leads and sales' },
  { name: 'YouTube', icon: '▶', type: 'Video + audience + search intent', best: 'Awareness, product education, remarketing' },
  { name: 'X', icon: '𝕏', type: 'Interest + conversation targeting', best: 'Realtime topics, tech, communities' },
]

const GOAL_FIT = {
  Sales: { Facebook: 88, Instagram: 92, TikTok: 83, Google: 96, YouTube: 76, X: 61 },
  Leads: { Facebook: 93, Instagram: 82, TikTok: 67, Google: 95, YouTube: 72, X: 62 },
  Traffic: { Facebook: 84, Instagram: 86, TikTok: 80, Google: 94, YouTube: 74, X: 76 },
  Awareness: { Facebook: 86, Instagram: 91, TikTok: 94, Google: 71, YouTube: 96, X: 78 },
  'Video views': { Facebook: 80, Instagram: 91, TikTok: 97, Google: 60, YouTube: 98, X: 68 },
}

const PLATFORM_TERMS = {
  Facebook: ['engaged shoppers', 'website visitors', 'lookalike audience', 'retargeting', 'lead form audience'],
  Instagram: ['reels viewers', 'engaged shoppers', 'fashion & lifestyle', 'creator audience', 'profile engagers'],
  TikTok: ['trend audience', 'video viewers', 'purchase intent', 'creator interest', 'spark ads audience'],
  Google: ['buy online', 'best price', 'near me', 'service provider', 'book now'],
  YouTube: ['how to', 'product review', 'comparison', 'remarketing viewers', 'in-market audience'],
  X: ['industry conversation', 'follower lookalikes', 'event audience', 'keyword conversation', 'tech interest'],
}

function cleanTerms(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5)
}

export default function AdsDock() {
  const [visible, setVisible] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('az-theme') || 'future')
  const [selected, setSelected] = useState(['Facebook', 'Instagram'])
  const [goal, setGoal] = useState('Sales')
  const [budget, setBudget] = useState('50')
  const [days, setDays] = useState('7')
  const [audience, setAudience] = useState('People interested in modern digital products')
  const [seed, setSeed] = useState('social media management, automation, AI content')
  const [offer, setOffer] = useState('Grow your social media faster with one AI-powered workspace')
  const [analyzed, setAnalyzed] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const sync = () => {
      setSessionReady(Boolean(localStorage.getItem('az-session')))
      setTheme(localStorage.getItem('az-theme') || 'future')
    }
    sync()
    const timer = window.setInterval(sync, 700)
    return () => window.clearInterval(timer)
  }, [])

  const scores = useMemo(() => {
    const fit = GOAL_FIT[goal] || GOAL_FIT.Sales
    const daily = Math.max(1, Number(budget) || 1)
    const duration = Math.max(1, Number(days) || 1)
    const budgetBoost = Math.min(5, Math.log10(daily * duration + 10) * 1.6)
    return Object.fromEntries(PLATFORMS.map((p) => [p.name, Math.min(99, Math.round(fit[p.name] + budgetBoost))]))
  }, [goal, budget, days])

  const recommended = useMemo(
    () => [...PLATFORMS].sort((a, b) => scores[b.name] - scores[a.name]).slice(0, 3),
    [scores],
  )

  const opportunity = useMemo(() => {
    if (!selected.length) return 0
    return Math.round(selected.reduce((sum, name) => sum + scores[name], 0) / selected.length)
  }, [selected, scores])

  const terms = useMemo(() => cleanTerms(seed), [seed])

  const toggle = (name) => {
    setSelected((current) => current.includes(name) ? current.filter((p) => p !== name) : [...current, name])
    setAnalyzed(false)
    setNotice('')
  }

  const suggestionsFor = (platform) => {
    const base = PLATFORM_TERMS[platform] || []
    const merged = [...terms, ...base]
    return [...new Set(merged)].slice(0, 6)
  }

  const analyze = () => {
    setAnalyzed(true)
    setNotice('AI media plan refreshed. Scores are planning estimates, not guaranteed results.')
  }

  const prepareCampaign = () => {
    if (!selected.length) {
      setNotice('Select at least one ad platform first.')
      return
    }
    setNotice(`Campaign draft prepared for ${selected.join(', ')}. Connect each platform Ads API/OAuth before a real launch.`)
  }

  if (!sessionReady) return null

  return <div className={`ads-root theme-${theme}`}>
    <button className="ads-dock-button" onClick={() => setVisible(true)}>
      <Zap size={16}/><span>Ads Manager</span><b>NEW</b>
    </button>

    {visible && <div className="ads-overlay" onMouseDown={() => setVisible(false)}>
      <section className="ads-shell" onMouseDown={(e) => e.stopPropagation()}>
        <header className="ads-header">
          <div>
            <span className="ads-eyebrow"><Sparkles size={14}/> AI Ads Planner + Campaign Hub</span>
            <h2>Plan, compare and launch ads from one place</h2>
            <p>Select platforms, compare fit, get keyword/targeting suggestions and monitor performance once APIs are connected.</p>
          </div>
          <button className="ads-close" onClick={() => setVisible(false)}><X size={18}/></button>
        </header>

        <div className="ads-api-note"><Eye size={15}/><span><b>Demo planning mode:</b> real publishing, spend and performance require Meta/Google/TikTok/X ads credentials and approved API access.</span></div>

        <div className="ads-layout">
          <aside className="ads-panel ads-setup">
            <div className="ads-section-title"><Target size={17}/><div><strong>Campaign setup</strong><small>Choose where the ad should run</small></div></div>

            <label>Campaign goal
              <select value={goal} onChange={(e) => { setGoal(e.target.value); setAnalyzed(false) }}>
                {Object.keys(GOAL_FIT).map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <div className="ads-input-grid">
              <label>Daily budget ($)<input type="number" min="1" value={budget} onChange={(e) => { setBudget(e.target.value); setAnalyzed(false) }}/></label>
              <label>Run for days<input type="number" min="1" value={days} onChange={(e) => { setDays(e.target.value); setAnalyzed(false) }}/></label>
            </div>

            <label>Offer / ad message<textarea value={offer} onChange={(e) => setOffer(e.target.value)} /></label>
            <label>Audience<textarea value={audience} onChange={(e) => setAudience(e.target.value)} /></label>
            <label>Product / seed keywords<input value={seed} onChange={(e) => { setSeed(e.target.value); setAnalyzed(false) }} placeholder="product, service, audience intent"/></label>

            <div className="ads-platform-picker">
              {PLATFORMS.map((platform) => <button key={platform.name} className={selected.includes(platform.name) ? 'selected' : ''} onClick={() => toggle(platform.name)}>
                <span>{platform.icon}</span><strong>{platform.name}</strong>{selected.includes(platform.name) && <Check size={13}/>} 
              </button>)}
            </div>

            <button className="ads-primary" onClick={analyze}><Search size={15}/> Analyze best ad mix</button>
          </aside>

          <main className="ads-main">
            <section className="ads-score-grid">
              <article className="ads-card ads-opportunity"><span>Estimated opportunity score</span><strong>{opportunity}%</strong><small>Platform-fit estimate, not a success guarantee</small></article>
              <article className="ads-card"><span>Total planned budget</span><strong>${(Number(budget || 0) * Number(days || 0)).toLocaleString()}</strong><small>{budget || 0}/day × {days || 0} days</small></article>
              <article className="ads-card"><span>Selected channels</span><strong>{selected.length}</strong><small>{selected.join(' · ') || 'Choose a platform'}</small></article>
              <article className="ads-card"><span>Live performance</span><strong>—</strong><small>CTR, CPC, CPA, ROAS after API sync</small></article>
            </section>

            <section className="ads-card ads-recommendations">
              <div className="ads-card-head"><div><strong>Best platform suggestions</strong><small>Based on goal + planning inputs</small></div><BarChart3 size={17}/></div>
              <div className="ads-reco-list">
                {recommended.map((platform, index) => <div className="ads-reco-row" key={platform.name}>
                  <span className="ads-rank">0{index + 1}</span>
                  <div className="ads-platform-icon">{platform.icon}</div>
                  <div className="ads-reco-copy"><strong>{platform.name}</strong><small>{platform.best}</small></div>
                  <div className="ads-fit"><b>{scores[platform.name]}%</b><span><i style={{ width: `${scores[platform.name]}%` }}/></span></div>
                </div>)}
              </div>
            </section>

            <section className="ads-card ads-keywords">
              <div className="ads-card-head"><div><strong>Keyword & targeting suggestions</strong><small>What to upload/use by platform</small></div><Sparkles size={17}/></div>
              <div className="ads-keyword-grid">
                {selected.map((name) => {
                  const platform = PLATFORMS.find((p) => p.name === name)
                  return <article key={name}>
                    <header><span className="ads-platform-icon">{platform.icon}</span><div><strong>{name}</strong><small>{platform.type}</small></div><b>{scores[name]}%</b></header>
                    <div className="ads-tags">{suggestionsFor(name).map((term) => <span key={term}>{term}</span>)}</div>
                    <p><b>Best use:</b> {platform.best}</p>
                  </article>
                })}
              </div>
            </section>

            <section className="ads-card ads-performance">
              <div className="ads-card-head"><div><strong>Performance intelligence</strong><small>Live after ad-account connections</small></div><BarChart3 size={17}/></div>
              <div className="ads-performance-grid">
                {['Spend','Impressions','CTR','CPC','Conversions','CPA','ROAS','Revenue'].map((metric) => <div key={metric}><span>{metric}</span><strong>—</strong><small>Waiting for API</small></div>)}
              </div>
            </section>

            {notice && <div className="ads-notice">{notice}</div>}

            <footer className="ads-footer">
              <div><b>{analyzed ? 'Plan analyzed' : 'Inputs changed'}</b><span>Re-run analysis before finalizing the campaign.</span></div>
              <button className="ads-secondary" onClick={() => setNotice('Ads API connection screen will be wired to platform credentials in the backend phase.')}>Connect Ads APIs</button>
              <button className="ads-primary ads-launch" onClick={prepareCampaign}><Send size={15}/> Prepare campaign</button>
            </footer>
          </main>
        </div>
      </section>
    </div>}
  </div>
}
