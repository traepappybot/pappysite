"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

const tabs = ["Пользователи","Посты","Ставки","Награды","Заказы","РАБОТА","Квесты","Уровни","Промокоды","Аналитика"]

function RoleBadge({ role }: { role?: string }) {
  const r = role || "user"
  const base = "ml-2 text-xs px-2 py-0.5 rounded-full border border-white/10"
  if (r === "admin") return <span className={`${base} text-yellow-300`}>admin</span>
  if (r === "moderator") return <span className={`${base} text-green-400`}>moderator</span>
  return <span className={`${base} text-white/40`}>user</span>
}

export default function AdminPage() {
  const [tab, setTab] = useState("Пользователи")
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    api("/users/me")
      .then((me: any) => {
        if (cancelled) return
        if (me.role === "admin") {
          setAllowed(true)
        } else {
          setError("Доступ только для администратора")
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Войдите под учетной записью администратора")
        }
      })
      .finally(() => {
        if (!cancelled) {
          setChecking(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (checking) return <div className="text-white/60">Загрузка...</div>
  if (!allowed) return <div className="text-red-400">{error || "Доступ запрещён"}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Админ-панель</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => <button key={t} onClick={()=>setTab(t)} className={`px-3 py-2 rounded ${tab===t? "bg-purple-600":"glass"}`}>{t}</button>)}
      </div>
      {tab==="Пользователи" && <UsersTab />}
      {tab==="Посты" && <PostsTab />}
      {tab==="Награды" && <RewardsTab />}
      {tab==="Заказы" && <OrdersTab />}
      {tab==="РАБОТА" && <WorkTab />}
      {tab==="Квесты" && <QuestsTab />}
      {tab==="Уровни" && <LevelsTab />}
      {tab==="Промокоды" && <PromosTab />}
      {tab==="Аналитика" && <AnalyticsTab />}
      {tab==="Ставки" && <div className="text-white/60">Создание матчей доступно через API</div>}
    </div>
  )
}

function UsersTab() {
  const [q, setQ] = useState("")
  const [list, setList] = useState<any[]>([])
  const load = () => api(`/admin/users?q=${encodeURIComponent(q)}`).then(setList)
  useEffect(()=>{ load() },[])
  return (
    <div className="glass p-4 rounded">
      <div className="flex gap-2 mb-2">
        <input className="flex-1 p-3 rounded bg-white/10" placeholder="Поиск" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load} className="btn glass">Найти</button>
      </div>
      <div className="space-y-2 max-h-96 overflow-auto">
        {list.map(u => <UserRow key={u.id} u={u} onUpdated={load} />)}
      </div>
    </div>
  )
}

function UserRow({ u, onUpdated }: any) {
  const [role, setRole] = useState(u.role)
  const [delta, setDelta] = useState("0")
  const saveRole = () => api("/admin/users/role", { method: "POST", body: JSON.stringify({ userId: u.id, role }) }).then(onUpdated)
  const changeBal = () => api("/admin/users/balance", { method: "POST", body: JSON.stringify({ userId: u.id, delta: Number(delta) }) }).then(onUpdated)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-1">
        <span>{u.username}</span>
        <RoleBadge role={u.role} />
        <span className="text-white/60">{u.email}</span>
      </div>
      <div className="w-24 text-acid">{u.balance}</div>
      <select value={role} onChange={e=>setRole(e.target.value)} className="bg-white/10 p-2 rounded">
        <option value="user">user</option>
        <option value="moderator">moderator</option>
        <option value="admin">admin</option>
      </select>
      <button onClick={saveRole} className="btn glass">Роль</button>
      <input className="w-20 p-2 rounded bg-white/10" value={delta} onChange={e=>setDelta(e.target.value)} />
      <button onClick={changeBal} className="btn btn-primary">Баланс</button>
    </div>
  )
}

function PostsTab() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const create = () => api("/posts", { method: "POST", body: JSON.stringify({ title, content, imageUrl }) })
  return (
    <div className="glass p-4 rounded space-y-2">
      <input className="w-full p-3 rounded bg-white/10" placeholder="Заголовок" value={title} onChange={e=>setTitle(e.target.value)} />
      <textarea className="w-full p-3 rounded bg-white/10" placeholder="Текст" value={content} onChange={e=>setContent(e.target.value)} />
      <input className="w-full p-3 rounded bg-white/10" placeholder="URL изображения" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />
      <button onClick={create} className="btn btn-primary">Опубликовать</button>
    </div>
  )
}

function RewardsTab() {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const create = () => api("/rewards", { method: "POST", body: JSON.stringify({ name, price: Number(price) }) })
  return (
    <div className="glass p-4 rounded space-y-2">
      <input className="w-full p-3 rounded bg-white/10" placeholder="Название" value={name} onChange={e=>setName(e.target.value)} />
      <input className="w-full p-3 rounded bg-white/10" placeholder="Цена" value={price} onChange={e=>setPrice(e.target.value)} />
      <button onClick={create} className="btn btn-primary">Создать</button>
    </div>
  )
}

function OrdersTab() {
  const [list, setList] = useState<any[]>([])
  const load = () => api("/orders").then(setList)
  useEffect(()=>{ load() },[])
  return (
    <div className="glass p-4 rounded">
      <div className="space-y-2">
        {list.map(o => <OrderRow key={o.id} o={o} onUpdated={load} />)}
      </div>
    </div>
  )
}

function OrderRow({ o, onUpdated }: any) {
  const [status, setStatus] = useState(o.status)
  const save = () => api(`/orders/${o.id}/status`, { method: "POST", body: JSON.stringify({ status }) }).then(onUpdated)
  return (
    <div className="grid grid-cols-6 items-center gap-2">
      <div className="truncate flex items-center gap-1">
        <span>{o.username}</span>
        <RoleBadge role={o.role} />
      </div>
      <div className="truncate">{o.rewardName}</div>
      <div className="truncate col-span-2">{o.tradeLink}</div>
      <select value={status} onChange={e=>setStatus(e.target.value)} className="bg-white/10 p-2 rounded">
        <option>Pending</option>
        <option>Processing</option>
        <option>Completed</option>
        <option>Rejected</option>
      </select>
      <button onClick={save} className="btn btn-primary">Сохранить</button>
    </div>
  )
}

function WorkTab() {
  return (
    <div className="glass p-4 rounded">
      <div>РАБОТА: обработка заказов и выдача скинов через Steam</div>
    </div>
  )
}

function QuestsTab() {
  const [name, setName] = useState("")
  const [reward, setReward] = useState("1")
  const create = () => api("/quests", { method: "POST", body: JSON.stringify({ name, reward: Number(reward) }) })
  return (
    <div className="glass p-4 rounded space-y-2">
      <input className="w-full p-3 rounded bg-white/10" placeholder="Название квеста" value={name} onChange={e=>setName(e.target.value)} />
      <input className="w-full p-3 rounded bg-white/10" placeholder="Награда" value={reward} onChange={e=>setReward(e.target.value)} />
      <button onClick={create} className="btn btn-primary">Создать квест</button>
    </div>
  )
}

function LevelsTab() {
  const [name, setName] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const create = () => api("/levels", { method: "POST", body: JSON.stringify({ name, iconUrl }) })
  return (
    <div className="glass p-4 rounded space-y-2">
      <input className="w-full p-3 rounded bg-white/10" placeholder="Название уровня" value={name} onChange={e=>setName(e.target.value)} />
      <input className="w-full p-3 rounded bg-white/10" placeholder="URL иконки" value={iconUrl} onChange={e=>setIconUrl(e.target.value)} />
      <button onClick={create} className="btn btn-primary">Создать уровень</button>
    </div>
  )
}

function PromosTab() {
  const [list, setList] = useState<any[]>([])
  const load = () => api("/admin/promos").then(setList)
  useEffect(()=>{ load() },[])
  const disable = (code: string, disabled: boolean) => api("/admin/promos/disable", { method: "POST", body: JSON.stringify({ code, disabled }) }).then(load)
  return (
    <div className="glass p-4 rounded space-y-2">
      {list.map(p => (
        <div key={p.code} className="flex items-center gap-2">
          <div className="flex-1">{p.code} — {p.activations}</div>
          <button onClick={()=>disable(p.code, !p.disabled)} className="btn glass">{p.disabled? "Включить":"Отключить"}</button>
        </div>
      ))}
      {list.length===0 && <div className="text-white/60">Нет промокодов</div>}
    </div>
  )
}

function AnalyticsTab() {
  const [a, setA] = useState<any>(null)
  useEffect(()=>{ api("/admin/analytics").then(setA).catch(()=>{}) },[])
  if (!a) return <div className="text-white/60">Загрузка...</div>
  return (
    <div className="glass p-4 rounded grid md:grid-cols-4 gap-4">
      <Card title="Пользователи" value={a.totalUsers} />
      <Card title="Монеты в обороте" value={a.coinsInCirculation} />
      <Card title="Активации реферал" value={a.referralActivations} />
      <Card title="Ставки" value={a.bets} />
    </div>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="glass p-4 rounded">
      <div className="text-white/60">{title}</div>
      <div className="text-2xl">{value}</div>
    </div>
  )
}
