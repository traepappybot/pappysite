"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

function RoleBadge({ role }: { role?: string }) {
  const r = role || "user"
  if (r === "admin") return <span className="text-yellow-300 text-xs ml-1">admin</span>
  if (r === "moderator") return <span className="text-green-400 text-xs ml-1">moderator</span>
  return <span className="text-white/40 text-xs ml-1">user</span>
}

export default function LeaderboardPage() {
  const [data, setData] = useState<any>({ richest:[], referrals:[], bettors:[], questers:[] })
  useEffect(()=>{ api("/leaderboard").then(setData).catch(()=>{}) },[])
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Board
        title="Топ богачей"
        items={data.richest}
        render={(i:any)=>(
          <>
            <span>{i.username}</span>
            <RoleBadge role={i.role} />
            <span> — {i.balance}</span>
          </>
        )}
      />
      <Board
        title="Топ рефералов"
        items={data.referrals}
        render={(i:any)=>(
          <>
            <span>{i.username || i.code}</span>
            {i.username && <RoleBadge role={i.role} />}
            <span> — {i.activations}</span>
          </>
        )}
      />
      <Board
        title="Топ ставок"
        items={data.bettors}
        render={(i:any)=>(
          <>
            <span>{i.username}</span>
            <RoleBadge role={i.role} />
            <span> — {i.total}</span>
          </>
        )}
      />
      <Board
        title="Топ квестов"
        items={data.questers}
        render={(i:any)=>(
          <>
            <span>{i.username}</span>
            <RoleBadge role={i.role} />
            <span> — {i.count}</span>
          </>
        )}
      />
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
