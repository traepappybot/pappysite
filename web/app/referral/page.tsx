"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function ReferralPage() {
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
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-2">Мой промокод</h1>
      {my ? (
        <div className="glass p-4 rounded">
          <div className="text-2xl">{my.code}</div>
          <div className="text-white/70 mt-2">Делитесь кодом, чтобы получать монеты</div>
        </div>
      ) : (
        <div className="glass p-4 rounded">
          <input className="w-full p-3 rounded bg-white/10" placeholder="Ваш промокод" value={code} onChange={e=>setCode(e.target.value)} />
          <button onClick={create} className="btn btn-primary mt-2">Создать</button>
          {err && <div className="text-red-400 mt-2">{err}</div>}
        </div>
      )}
    </div>
  )
}
