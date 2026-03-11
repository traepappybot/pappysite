"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null)
  const [link, setLink] = useState("")
  const [error, setError] = useState("")
  const load = async () => {
    try {
      const m = await api("/users/me")
      setMe(m)
      setLink(m.steamTradeLink || "")
    } catch (e:any) {
      setError(e.message)
    }
  }
  useEffect(()=>{ load() },[])
  const save = async () => {
    setError("")
    try {
      await api("/users/trade-link", { method: "PUT", body: JSON.stringify({ link }) })
      load()
    } catch (e:any) {
      setError(e.message)
    }
  }
  if (!me) return <div className="text-white/60">Загрузка...</div>
  return (
    <div className="space-y-4">
      <div className="glass p-4 rounded">
        <h1 className="text-xl font-semibold">Профиль</h1>
        <div className="mt-2 grid md:grid-cols-2 gap-4">
          <div>
            <div>Никнейм: {me.username}</div>
            <div>Email: {me.email}</div>
            <div>Баланс: <span className="text-acid">{me.balance}</span></div>
            <div>Уровень: {me.level?.name || "Нет"}</div>
            <div>Роль: {me.role}</div>
            <div>Промокод: {me.promoCode || "—"}</div>
            <div>Дата регистрации: {new Date(me.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="mb-2">Steam trade link</div>
            <input className="w-full p-3 rounded bg-white/10" value={link} onChange={e=>setLink(e.target.value)} />
            <button onClick={save} className="btn btn-primary mt-2">Сохранить</button>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <PromoBlock />
        <TransactionsBlock />
      </div>
      {error && <div className="text-red-400">{error}</div>}
    </div>
  )
}

function PromoBlock() {
  const [my, setMy] = useState<any>(null)
  const [code, setCode] = useState("")
  const [err, setErr] = useState("")
  const load = async () => {
    try {
      const res = await api("/promos")
      setMy(res.my)
    } catch {}
  }
  useEffect(()=>{ load() },[])
  const create = async () => {
    try {
      const r = await api("/users/promo-code", { method: "POST", body: JSON.stringify({ code }) })
      setMy({ code: r.code })
    } catch (e:any) { setErr(e.message) }
  }
  return (
    <div className="glass p-4 rounded">
      <h2 className="font-semibold mb-2 text-neon">Мой промокод</h2>
      {my ? <div className="text-lg">{my.code}</div> : (
        <div>
          <input className="w-full p-3 rounded bg-white/10" placeholder="Ваш промокод" value={code} onChange={e=>setCode(e.target.value)} />
          <button onClick={create} className="btn btn-primary mt-2">Создать</button>
          {err && <div className="text-red-400 mt-2">{err}</div>}
        </div>
      )}
    </div>
  )
}

function TransactionsBlock() {
  const [list, setList] = useState<any[]>([])
  useEffect(()=> {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const id = payload.id
      api(`/users/${id}/transactions`).then(setList).catch(()=>{})
    } catch {}
  },[])
  return (
    <div className="glass p-4 rounded">
      <h2 className="font-semibold mb-2 text-acid">История транзакций</h2>
      <div className="space-y-2 max-h-80 overflow-auto pr-2">
        {list.map(t => (
          <div key={t.id} className="flex items-center justify-between text-sm">
            <div>{t.note}</div>
            <div className={t.amount>=0 ? "text-acid" : "text-red-400"}>{t.amount>=0 ? "+" : ""}{t.amount}</div>
          </div>
        ))}
        {list.length===0 && <div className="text-white/60">Нет операций</div>}
      </div>
    </div>
  )
}

