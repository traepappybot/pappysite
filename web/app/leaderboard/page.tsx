"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function LeaderboardPage() {
  const [data, setData] = useState<any>({ richest:[], referrals:[], bettors:[], questers:[] })
  useEffect(()=>{ api("/leaderboard").then(setData).catch(()=>{}) },[])
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Board title="Топ богачей" items={data.richest} render={(i:any)=>`${i.username} — ${i.balance}`} />
      <Board title="Топ рефералов" items={data.referrals} render={(i:any)=>`${i.username||i.code} — ${i.activations}`} />
      <Board title="Топ ставок" items={data.bettors} render={(i:any)=>`${i.username} — ${i.total}`} />
      <Board title="Топ квестов" items={data.questers} render={(i:any)=>`${i.username} — ${i.count}`} />
    </div>
  )
}

function Board({ title, items, render }: any) {
  return (
    <div className="glass p-4 rounded">
      <div className="font-semibold mb-2">{title}</div>
      <div className="space-y-1">
        {items?.map((it:any, idx:number)=> <div key={idx} className="flex items-center gap-2"><span className="text-neon">{idx+1}.</span><span>{render(it)}</span></div>)}
        {(!items || items.length===0) && <div className="text-white/60">Нет данных</div>}
      </div>
    </div>
  )
}

