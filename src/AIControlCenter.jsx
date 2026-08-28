import { useEffect, useMemo, useState } from 'react'
import { Bot, Check, Eye, EyeOff, KeyRound, RefreshCw, Save, Server, ShieldCheck, Sparkles, X, Zap } from 'lucide-react'
import { getApiBase, saveAIProviderSecret, saveApiBaseUrl, testAIConnection } from './lib/platformApi.js'
import './ai-core.css'

const CONFIG_KEY = 'az-ai-core-config'

const PROVIDERS = {
  OpenAI: ['gpt-5', 'gpt-4.1', 'custom'],
  Gemini: ['gemini-2.5-pro', 'gemini-2.5-flash', 'custom'],
  Anthropic: ['claude-sonnet-4', 'claude-opus-4', 'custom'],
  OpenRouter: ['openrouter/auto', 'custom'],
  Custom: ['custom'],
}

const DEFAULT_CONFIG = {
  provider: 'OpenAI',
  model: 'gpt-5',
  temperature: 0.7,
  autopilot: true,
  content: true,
  hashtags: true,
  imagePrompt: true,
  videoConcept: true,
  replyCopilot: true,
  scheduleOptimizer: true,
  adsStrategy: true,
  keywordIntelligence: true,
  performanceCoach: true,
  approvalRequired: true,
}

function readConfig() {
  try { return { ...DEFAULT_CONFIG, ...(JSON.parse(localStorage.getItem(CONFIG_KEY)) || {}) } }
  catch { return DEFAULT_CONFIG }
}

export default function AIControlCenter() {
  const [visible, setVisible] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('az-theme') || 'future')
  const [config, setConfig] = useState(readConfig)
  const [gateway, setGateway] = useState(() => getApiBase())
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [connectionState, setConnectionState] = useState(getApiBase() ? 'Gateway configured' : 'Gateway required')

  useEffect(() => {
    const sync = () => {
      setSessionReady(Boolean(document.querySelector('.app')))
      setTheme(localStorage.getItem('az-theme') || 'future')
    }
    sync()
    const timer = window.setInterval(sync, 700)
    return () => window.clearInterval(timer)
  }, [])

  const models = useMemo(() => PROVIDERS[config.provider] || ['custom'], [config.provider])
  const enabledCount = useMemo(() => ['content','hashtags','imagePrompt','videoConcept','replyCopilot','scheduleOptimizer','adsStrategy','keywordIntelligence','performanceCoach'].filter((key) => config[key]).length, [config])

  const update = (key, value) => setConfig((current) => ({ ...current, [key]: value }))
  const toggleAll = (enabled) => setConfig((current) => ({
    ...current,
    autopilot: enabled,
    content: enabled,
    hashtags: enabled,
    imagePrompt: enabled,
    videoConcept: enabled,
    replyCopilot: enabled,
    scheduleOptimizer: enabled,
    adsStrategy: enabled,
    keywordIntelligence: enabled,
    performanceCoach: enabled,
    approvalRequired: true,
  }))

  const savePreferences = () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...config, approvalRequired: true }))
    window.dispatchEvent(new CustomEvent('az:ai-config-changed', { detail: config }))
    setNotice('AI Core preferences saved. Publishing and ad spend still require approval.')
  }

  const saveGateway = () => {
    try {
      const saved = saveApiBaseUrl(gateway)
      setGateway(saved)
      setConnectionState(saved ? 'Gateway configured' : 'Gateway required')
      setNotice(saved ? 'API Gateway saved. Existing screens may need one reload to refresh their connection badge.' : 'API Gateway removed.')
    } catch (error) {
      setNotice(error.message)
    }
  }

  const saveSecret = async () => {
    if (!apiKey.trim()) { setNotice('Enter the provider API key first.'); return }
    if (!getApiBase() && !gateway.trim()) { setNotice('Add your backend API Gateway URL first.'); return }
    if (gateway.trim() && gateway.trim() !== getApiBase()) {
      try { saveApiBaseUrl(gateway) } catch (error) { setNotice(error.message); return }
    }
    setBusy(true)
    try {
      const result = await saveAIProviderSecret({
        provider: config.provider,
        model: config.model,
        apiKey: apiKey.trim(),
      })
      setApiKey('')
      setConnectionState(result.status || `${config.provider} connected`)
      setNotice('AI secret sent to your backend securely. It was not stored in the browser.')
    } catch (error) {
      setNotice(`${error.message} Your key was not saved in browser storage.`)
    } finally {
      setBusy(false)
    }
  }

  const testConnection = async () => {
    if (!getApiBase() && gateway.trim()) {
      try { saveApiBaseUrl(gateway) } catch (error) { setNotice(error.message); return }
    }
    setBusy(true)
    try {
      const result = await testAIConnection({ provider: config.provider, model: config.model })
      setConnectionState(result.status || 'AI connected')
      setNotice(result.message || `AI test passed for ${config.provider} / ${config.model}.`)
    } catch (error) {
      setConnectionState('Connection needs setup')
      setNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  if (!sessionReady) return null

  const features = [
    ['content', 'AI Content Writer', 'Captions, hooks, CTAs and post variations'],
    ['hashtags', 'Hashtag & SEO Helper', 'Platform-aware tags and discoverability terms'],
    ['imagePrompt', 'Creative Director', 'Image concepts and production-ready prompts'],
    ['videoConcept', 'Video Strategist', 'Hooks, scripts, shot plans and edit concepts'],
    ['replyCopilot', 'Inbox Reply Copilot', 'Suggested replies using brand tone and context'],
    ['scheduleOptimizer', 'Smart Scheduler', 'Best-time and channel recommendations'],
    ['adsStrategy', 'AI Ads Strategist', 'Platform mix, audience, creative and budget ideas'],
    ['keywordIntelligence', 'Keyword Intelligence', 'Positive, negative and intent keyword suggestions'],
    ['performanceCoach', 'Performance Coach', 'Explains results and recommends next actions'],
  ]

  return <div className={`ai-core-root theme-${theme}`}>
    <button className="ai-core-dock" onClick={() => setVisible(true)}><Bot size={17}/><span>AI Core</span><b>{config.autopilot ? 'ON' : 'MANUAL'}</b></button>

    {visible && <div className="ai-core-overlay" onMouseDown={() => setVisible(false)}>
      <section className="ai-core-shell" onMouseDown={(event) => event.stopPropagation()}>
        <header className="ai-core-header">
          <div><span><Sparkles size={14}/> Central AI Brain + API Setup</span><h2>Make AZ Multi AI-first</h2><p>Connect one secure AI gateway, choose the model, then let every module use the same AI brain.</p></div>
          <button onClick={() => setVisible(false)}><X size={18}/></button>
        </header>

        <div className="ai-core-status">
          <article><Server size={18}/><div><small>API Gateway</small><strong>{getApiBase() || gateway ? 'Configured' : 'Not configured'}</strong></div></article>
          <article><Bot size={18}/><div><small>Provider</small><strong>{config.provider}</strong></div></article>
          <article><Zap size={18}/><div><small>AI modules</small><strong>{enabledCount}/9 enabled</strong></div></article>
          <article><ShieldCheck size={18}/><div><small>Final actions</small><strong>Approval required</strong></div></article>
        </div>

        <div className="ai-core-layout">
          <aside className="ai-core-panel">
            <div className="ai-core-title"><KeyRound size={18}/><div><strong>AI API Connection</strong><small>Keys are submitted to your backend only</small></div></div>

            <label>API Gateway / Backend URL
              <div className="ai-core-inline"><input value={gateway} onChange={(e) => setGateway(e.target.value)} placeholder="https://api.yourdomain.com"/><button onClick={saveGateway}><Save size={15}/> Save</button></div>
            </label>

            <div className="ai-core-two">
              <label>Provider<select value={config.provider} onChange={(e) => { const provider = e.target.value; setConfig((current) => ({ ...current, provider, model: PROVIDERS[provider][0] })) }}>{Object.keys(PROVIDERS).map((provider) => <option key={provider}>{provider}</option>)}</select></label>
              <label>Model<select value={config.model} onChange={(e) => update('model', e.target.value)}>{models.map((model) => <option key={model}>{model}</option>)}</select></label>
            </div>

            <label>Provider API key
              <div className="ai-core-secret"><KeyRound size={15}/><input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste key — never saved in localStorage"/><button onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff size={15}/> : <Eye size={15}/>}</button></div>
            </label>

            <div className="ai-core-security"><ShieldCheck size={17}/><span>The browser never persists the AI secret. The backend must store it in encrypted/server-side environment storage.</span></div>

            <button className="ai-core-primary" disabled={busy} onClick={saveSecret}><KeyRound size={16}/>{busy ? 'Working…' : 'Save API securely'}</button>
            <button className="ai-core-secondary" disabled={busy} onClick={testConnection}><RefreshCw size={15}/> Test AI connection</button>
            <div className="ai-core-connection"><i className={getApiBase() ? 'online' : ''}/><span>{connectionState}</span></div>
          </aside>

          <main className="ai-core-main">
            <section className="ai-core-card ai-autopilot">
              <div><span><Sparkles size={15}/> AI AUTOPILOT</span><h3>AI handles the thinking. You approve final actions.</h3><p>Content, replies, scheduling, ads, keywords and optimization can all use one shared AI context.</p></div>
              <button className={config.autopilot ? 'enabled' : ''} onClick={() => toggleAll(!config.autopilot)}><i/><span>{config.autopilot ? 'Enabled' : 'Disabled'}</span></button>
            </section>

            <section className="ai-core-features">
              {features.map(([key, title, copy]) => <article className={`ai-core-feature ${config[key] ? 'active' : ''}`} key={key}>
                <div className="ai-core-feature-icon">{config[key] ? <Check size={16}/> : <Bot size={16}/>}</div>
                <div><strong>{title}</strong><small>{copy}</small></div>
                <button onClick={() => update(key, !config[key])}><i/></button>
              </article>)}
            </section>

            <section className="ai-core-card ai-approval">
              <ShieldCheck size={22}/><div><strong>Human approval stays ON</strong><p>AI can prepare posts, replies and ad plans automatically, but actual social publishing and paid ad spend should require a final approval click.</p></div><span>LOCKED ON</span>
            </section>

            {notice && <div className="ai-core-notice">{notice}</div>}

            <footer className="ai-core-footer"><div><small>AI preference profile</small><strong>{config.provider} · {config.model}</strong></div><button className="ai-core-primary" onClick={savePreferences}><Save size={15}/> Save AI settings</button></footer>
          </main>
        </div>
      </section>
    </div>}
  </div>
}
