import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, BookOpen, Search, SlidersHorizontal, X, Trash2, Pencil, Share2, Sparkles, ChevronLeft, CalendarDays, BarChart3, Moon, Sun, Check, RotateCcw } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import './style.css'

const STORAGE_KEY = 'emotion-memory-v2'

const emotions = [
  { id: 'joy', name: '喜悅', en: 'Joy', icon: '😊', color: '#FFD84D', glow: 'rgba(255,216,77,.65)', bg: 'linear-gradient(145deg,#ffe46d,#ffad1f)', quote: '快樂不是擁有更多，而是珍惜已在手中的一切。' },
  { id: 'anger', name: '憤怒', en: 'Anger', icon: '😡', color: '#FF4D4D', glow: 'rgba(255,77,77,.6)', bg: 'linear-gradient(145deg,#ff7a55,#c91f37)', quote: '憤怒有時是在提醒你：有些界線需要被看見。' },
  { id: 'sadness', name: '悲傷', en: 'Sadness', icon: '😢', color: '#5FA8FF', glow: 'rgba(95,168,255,.6)', bg: 'linear-gradient(145deg,#78c6ff,#2757d8)', quote: '悲傷不是壞事，它讓你知道那件事真的很重要。' },
  { id: 'fear', name: '恐懼', en: 'Fear', icon: '😨', color: '#B16CFF', glow: 'rgba(177,108,255,.6)', bg: 'linear-gradient(145deg,#d09cff,#6738d8)', quote: '恐懼不是叫你停下來，而是叫你慢一點保護自己。' },
  { id: 'disgust', name: '厭惡', en: 'Disgust', icon: '🤢', color: '#63D471', glow: 'rgba(99,212,113,.55)', bg: 'linear-gradient(145deg,#94f28d,#179d60)', quote: '厭惡有時是一種直覺：提醒你遠離不適合自己的事。' },
]

const categories = ['家庭', '朋友', '愛情', '事業', '金錢', '學業', '興趣', '健康', '成長', '夢想']
const seeds = [
  { emotion: 'joy', title: '和家人一起吃飯', content: '今天和家人一起坐低食飯，大家聊得很輕鬆，感覺很安心。', categories: ['家庭', '愛情'], intensity: 7 },
  { emotion: 'sadness', title: '想念一個人', content: '突然想起一些以前的片段，有點鼻酸，但也覺得那段回憶很珍貴。', categories: ['朋友', '成長'], intensity: 6 },
  { emotion: 'fear', title: '工作壓力有點大', content: '事情太多，怕自己做得不夠好。今晚想早點休息。', categories: ['事業', '健康'], intensity: 8 },
]

function today() { return new Date().toISOString().slice(0,10) }
function emotionOf(id) { return emotions.find(e => e.id === id) || emotions[0] }
function uid() { return `${Date.now()}-${Math.random().toString(16).slice(2)}` }

function loadMemories(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if(raw) return JSON.parse(raw)
  } catch {}
  return seeds.map((s, i) => ({ id: uid()+i, date: today(), createdAt: Date.now()-i*86400000, ...s }))
}

function App(){
  const [tab,setTab] = useState('create')
  const [dark,setDark] = useState(true)
  const [memories,setMemories] = useState(loadMemories)
  const [selected,setSelected] = useState(null)
  const [editing,setEditing] = useState(null)
  const [toast,setToast] = useState('')

  useEffect(()=>localStorage.setItem(STORAGE_KEY, JSON.stringify(memories)),[memories])
  useEffect(()=>{ if(toast){ const t=setTimeout(()=>setToast(''),2200); return()=>clearTimeout(t)}},[toast])

  const addMemory = (memory) => {
    setMemories(prev => [{ id: uid(), createdAt: Date.now(), ...memory }, ...prev])
    setTab('done')
    setSelected(memory)
    setToast('記憶已收藏 ✨')
  }
  const updateMemory = (id, patch) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))
    setEditing(null)
    setToast('已更新記憶')
  }
  const deleteMemory = (id) => {
    setMemories(prev => prev.filter(m => m.id !== id))
    setSelected(null)
    setToast('已刪除記憶')
  }

  return <div className={dark ? 'app dark' : 'app light'}>
    <Stars />
    <main className="phone-shell">
      <div className="status"><span>9:41</span><span>●●●  5G  🔋</span></div>
      <AnimatePresence mode="wait">
        {tab==='create' && <CreatePage key="create" addMemory={addMemory} dark={dark} setDark={setDark}/>} 
        {tab==='done' && <DonePage key="done" memory={memories[0]} setTab={setTab}/>} 
        {tab==='library' && <LibraryPage key="library" memories={memories} setSelected={setSelected}/>} 
        {tab==='stats' && <StatsPage key="stats" memories={memories}/>} 
        {tab==='calendar' && <CalendarPage key="calendar" memories={memories} setSelected={setSelected}/>} 
        {tab==='review' && <ReviewPage key="review" memories={memories}/>} 
      </AnimatePresence>
      <BottomNav tab={tab} setTab={setTab}/>
    </main>

    <AnimatePresence>
      {selected && <MemoryModal memory={selected} onClose={()=>setSelected(null)} onDelete={deleteMemory} onEdit={()=>{setEditing(selected); setSelected(null)}} />}
      {editing && <MemoryEditor memory={editing} onClose={()=>setEditing(null)} onSave={(patch)=>updateMemory(editing.id, patch)} />}
      {toast && <motion.div className="toast" initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:40,opacity:0}}>{toast}</motion.div>}
    </AnimatePresence>
  </div>
}

function Stars(){ return <div className="stars">{Array.from({length:42}).map((_,i)=><i key={i} style={{left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, animationDelay:`${Math.random()*5}s`}} />)}</div> }

function Page({children, className=''}){ return <motion.section className={`page ${className}`} initial={{opacity:0,x:18}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-18}} transition={{duration:.28}}>{children}</motion.section> }

function CreatePage({addMemory,dark,setDark}){
  const [chosen,setChosen] = useState(null)
  return <Page className="create-page">
    <header className="hero-header">
      <button className="round-btn ghost" onClick={()=>setDark(!dark)}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
      <div className="chip">情緒記憶核心</div>
      <h1>今天，<br/>你留下了什麼情緒？</h1>
      <p>每段回憶，都值得被收藏。</p>
    </header>
    <div className="emotion-grid">
      {emotions.map((e,idx)=><motion.button className="emotion-card" key={e.id} style={{'--c':e.color,'--g':e.glow,'--bg':e.bg}} onClick={()=>setChosen(e)} whileTap={{scale:.94}} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:idx*.05}}>
        <span className="character">{e.icon}</span><strong>{e.name}</strong><small>{e.en}</small>
      </motion.button>)}
    </div>
    <DailyQuote />
    <AnimatePresence>{chosen && <CreateSheet emotion={chosen} onClose={()=>setChosen(null)} onSubmit={addMemory}/>}</AnimatePresence>
  </Page>
}

function DailyQuote(){ const e = emotions[new Date().getDate()%emotions.length]; return <div className="quote-card"><Sparkles size={18}/><span>{e.quote}</span></div> }

function CreateSheet({emotion,onClose,onSubmit}){
  const [title,setTitle] = useState('')
  const [content,setContent] = useState('')
  const [date,setDate] = useState(today())
  const [intensity,setIntensity] = useState(7)
  const [cats,setCats] = useState([])
  const toggle = c => setCats(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev,c])
  const submit = () => {
    if(!title.trim() && !content.trim()) return
    onSubmit({emotion:emotion.id,title:title || `${emotion.name}的一天`,content,date,intensity,categories:cats})
    onClose()
  }
  return <motion.div className="sheet-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <motion.div className="create-sheet" style={{'--c':emotion.color,'--bg':emotion.bg}} initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring', damping:24, stiffness:260}}>
      <div className="sheet-top">
        <div className="sheet-emotion"><span>{emotion.icon}</span><div><b>{emotion.name}</b><small>{emotion.en}</small></div></div>
        <button onClick={onClose}><X size={20}/></button>
      </div>
      <div className="form-card">
        <label>記憶標題<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="今天發生了什麼讓你印象深刻的事？" /></label>
        <label>記憶內容<textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="寫下你的感受與回憶…" /></label>
        <label>日期<input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
        <label>情緒強度 <span className="range-value">{intensity}/10</span><input type="range" min="1" max="10" value={intensity} onChange={e=>setIntensity(e.target.value)} /></label>
        <div className="cat-title">分類（可多選）</div>
        <div className="category-wrap">{categories.map(c=><button key={c} className={cats.includes(c)?'cat active':'cat'} onClick={()=>toggle(c)}>{cats.includes(c)&&<Check size={13}/>} {c}</button>)}</div>
        <button className="primary-action" onClick={submit}>✨ 保存記憶球</button>
      </div>
    </motion.div>
  </motion.div>
}

function DonePage({memory,setTab}){ const e=emotionOf(memory?.emotion); return <Page className="done-page">
  <div className="center-title"><h2>記憶已收藏 ✨</h2><p>你的情緒記憶已經記入宇宙</p></div>
  <motion.div className="big-orb" style={{'--c':e.color,'--g':e.glow}} initial={{scale:.4,opacity:0}} animate={{scale:1,opacity:1}}><span>{e.icon}</span><b>{memory?.title || '新的記憶'}</b><i>♥</i></motion.div>
  <button className="primary-action wide" onClick={()=>setTab('library')}>查看記憶集</button>
  <button className="link-action" onClick={()=>setTab('create')}>繼續記錄</button>
</Page> }

function LibraryPage({memories,setSelected}){
  const [q,setQ]=useState(''); const [emotion,setEmotion]=useState('all'); const [filterOpen,setFilterOpen]=useState(false); const [cat,setCat]=useState('全部')
  const filtered = useMemo(()=> memories.filter(m=>{
    const hitQ = [m.title,m.content,...(m.categories||[])].join(' ').toLowerCase().includes(q.toLowerCase())
    const hitE = emotion==='all'||m.emotion===emotion
    const hitC = cat==='全部'||(m.categories||[]).includes(cat)
    return hitQ && hitE && hitC
  }),[memories,q,emotion,cat])
  return <Page className="library-page">
    <div className="topbar"><h2>我的情緒宇宙</h2><button onClick={()=>setFilterOpen(true)}><SlidersHorizontal size={19}/></button></div>
    <div className="searchbox"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜尋標題、內容、分類…" /></div>
    <div className="filter-row"><button onClick={()=>setEmotion('all')} className={emotion==='all'?'active':''}>全部</button>{emotions.map(e=><button key={e.id} onClick={()=>setEmotion(e.id)} className={emotion===e.id?'active':''}>{e.name}</button>)}</div>
    <div className="orb-space">
      {filtered.length===0 && <div className="empty">未有符合的記憶球</div>}
      {filtered.map((m,i)=><MemoryOrb key={m.id} memory={m} idx={i} onClick={()=>setSelected(m)} />)}
    </div>
    <button className="floating-add" onClick={()=>window.dispatchEvent(new CustomEvent('nav-create'))}><Plus size={26}/></button>
    <AnimatePresence>{filterOpen && <FilterPanel emotion={emotion} setEmotion={setEmotion} cat={cat} setCat={setCat} onClose={()=>setFilterOpen(false)}/>}</AnimatePresence>
  </Page>
}

window.addEventListener?.('nav-create',()=>{})
function MemoryOrb({memory,idx,onClick}){ const e=emotionOf(memory.emotion); const size=[112,88,96,70,132,78][idx%6]; return <motion.button className="memory-orb" onClick={onClick} style={{'--c':e.color,'--g':e.glow,width:size,height:size,left:`${8+(idx*31)%72}%`,top:`${40+(idx*83)%430}px`,animationDelay:`${idx*.45}s`}} whileTap={{scale:.92}}><span>{memory.title}</span><small>{e.icon}</small></motion.button> }

function FilterPanel({emotion,setEmotion,cat,setCat,onClose}){ return <motion.div className="panel-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="filter-panel" initial={{y:260}} animate={{y:0}} exit={{y:260}}>
  <div className="panel-title"><h3>篩選搜尋器</h3><button onClick={onClose}><X size={20}/></button></div>
  <p>情緒篩選</p><div className="icon-filter"><button className={emotion==='all'?'active':''} onClick={()=>setEmotion('all')}>⌘<span>全部</span></button>{emotions.map(e=><button key={e.id} className={emotion===e.id?'active':''} onClick={()=>setEmotion(e.id)}>{e.icon}<span>{e.name}</span></button>)}</div>
  <p>分類篩選</p><div className="category-wrap panel-cats"><button className={cat==='全部'?'cat active':'cat'} onClick={()=>setCat('全部')}>全部</button>{categories.map(c=><button key={c} className={cat===c?'cat active':'cat'} onClick={()=>setCat(c)}>{c}</button>)}</div>
  <div className="panel-actions"><button onClick={()=>{setEmotion('all');setCat('全部')}}>清除</button><button onClick={onClose}>完成</button></div>
</motion.div></motion.div> }

function MemoryModal({memory,onClose,onDelete,onEdit}){
  const e=emotionOf(memory.emotion); const cardRef=useRef(null)
  const share = async()=>{ const html2canvas=(await import('html2canvas')).default; const canvas=await html2canvas(cardRef.current,{backgroundColor:null,scale:2}); const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download='emotion-memory.png'; a.click() }
  return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="detail-card" ref={cardRef} initial={{scale:.9,y:30}} animate={{scale:1,y:0}} exit={{scale:.9,y:30}}>
    <button className="close" onClick={onClose}><X size={18}/></button>
    <div className="detail-orb" style={{'--c':e.color,'--g':e.glow}}><span>{e.icon}</span><b>{memory.title}</b></div>
    <div className="detail-body"><div className="meta"><b>{e.name}</b><span>{memory.date}</span></div><p>{memory.content || '沒有填寫內容。'}</p><div className="stars-rate">{'★'.repeat(Number(memory.intensity||1))}<span>{memory.intensity}/10</span></div><div className="category-wrap">{(memory.categories||[]).map(c=><span className="cat active" key={c}>{c}</span>)}</div></div>
    <div className="detail-actions"><button onClick={onEdit}><Pencil size={18}/>編輯</button><button onClick={share}><Share2 size={18}/>分享</button><button className="danger" onClick={()=>onDelete(memory.id)}><Trash2 size={18}/>刪除</button></div>
  </motion.div></motion.div>
}

function MemoryEditor({memory,onClose,onSave}){ const [title,setTitle]=useState(memory.title); const [content,setContent]=useState(memory.content); const [intensity,setIntensity]=useState(memory.intensity); return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="edit-card" initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} exit={{y:50,opacity:0}}><div className="panel-title"><h3>編輯記憶</h3><button onClick={onClose}><X size={20}/></button></div><label>標題<input value={title} onChange={e=>setTitle(e.target.value)}/></label><label>內容<textarea value={content} onChange={e=>setContent(e.target.value)}/></label><label>情緒強度 {intensity}/10<input type="range" min="1" max="10" value={intensity} onChange={e=>setIntensity(e.target.value)}/></label><button className="primary-action" onClick={()=>onSave({title,content,intensity})}>儲存修改</button></motion.div></motion.div> }

function StatsPage({memories}){ const data=emotions.map(e=>({name:e.name,value:memories.filter(m=>m.emotion===e.id).length,color:e.color})).filter(d=>d.value>0); const avg=memories.length ? (memories.reduce((s,m)=>s+Number(m.intensity||0),0)/memories.length).toFixed(1) : 0; const trend=memories.slice().reverse().map((m,i)=>({i:i+1,score:Number(m.intensity||0)})); return <Page className="stats-page"><div className="topbar"><h2>情緒統計</h2><BarChart3 size={20}/></div><div className="seg"><button>週</button><button className="active">月</button><button>年</button></div><div className="stat-card pie"><ResponsiveContainer width="100%" height={210}><PieChart><Pie data={data} dataKey="value" innerRadius={48} outerRadius={82} paddingAngle={4}>{data.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer><div className="pie-center"><b>{memories.length}</b><span>記憶</span></div><ul>{data.map(d=><li key={d.name}><i style={{background:d.color}} />{d.name}<span>{d.value}</span></li>)}</ul></div><div className="stat-card"><div className="stat-line"><b>平均強度</b><span>{avg}/10</span></div><ResponsiveContainer width="100%" height={160}><LineChart data={trend}><XAxis dataKey="i" hide/><YAxis hide domain={[0,10]}/><Tooltip/><Line type="monotone" dataKey="score" stroke="#68e7ff" strokeWidth={3} dot={{r:3}} /></LineChart></ResponsiveContainer></div></Page> }

function CalendarPage({memories,setSelected}){ const days=Array.from({length:31},(_,i)=>i+1); return <Page className="calendar-page"><div className="topbar"><h2>情緒日曆</h2><CalendarDays size={20}/></div><h3>2024年5月</h3><div className="calendar-grid">{'日一二三四五六'.split('').map(d=><b key={d}>{d}</b>)}{days.map(d=>{ const m=memories.find(x=>Number(x.date?.slice(-2))===d); return <button key={d} className={m?'has':''} onClick={()=>m&&setSelected(m)}>{d}{m&&<span>{emotionOf(m.emotion).icon}</span>}</button>})}</div><DailyQuote/></Page> }

function ReviewPage({memories}){ const latest=memories[0]; const e=emotionOf(latest?.emotion); return <Page className="review-page"><div className="topbar"><h2>今日回顧</h2><Sparkles size={20}/></div><div className="review-hero" style={{'--c':e.color,'--g':e.glow}}><span>{e.icon}</span><div><small>你的主要情緒</small><b>{e.name}</b><p>情緒強度 {latest?.intensity || 0}/10</p></div></div><div className="quote-card big"><b>今日語錄</b><p>「{e.quote}」</p></div><button className="primary-action wide">分享今天的心情</button></Page> }

function BottomNav({tab,setTab}){
  useEffect(()=>{ const h=()=>setTab('create'); window.addEventListener('nav-create',h); return()=>window.removeEventListener('nav-create',h)},[setTab])
  const items=[['create',Plus,'創建'],['library',BookOpen,'記憶集'],['stats',BarChart3,'統計'],['calendar',CalendarDays,'日曆'],['review',Sparkles,'回顧']]
  return <nav className="bottom-nav">{items.map(([id,Icon,label])=><button key={id} className={tab===id|| (tab==='done'&&id==='library')?'active':''} onClick={()=>setTab(id)}><Icon size={19}/><span>{label}</span></button>)}</nav>
}

createRoot(document.getElementById('root')).render(<App />)
