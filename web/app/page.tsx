import Link from "next/link"
import { API_URL } from "../lib/api"

async function getData() {
  return { posts: [], polls: [] }
}

export default async function Home() {
  const data = await getData()
  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-lg shadow-neon">
        <h1 className="text-2xl font-bold glow">Киберпанк платформа сообщества</h1>
        <p className="text-white/80">Ставки, награды, квесты и лидерборды</p>
        <div className="mt-4 flex gap-2">
          <Link href="/register" className="btn btn-primary">Присоединиться</Link>
          <Link href="/bets" className="btn glass">К матчам</Link>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass p-4 rounded-lg">
          <h2 className="font-semibold mb-2 text-neon">Лента</h2>
          <div className="space-y-3">
            {data.posts.length === 0 && <div className="text-white/60">Пока нет постов</div>}
          </div>
        </div>
        <div className="glass p-4 rounded-lg">
          <h2 className="font-semibold mb-2 text-acid">Опросы</h2>
          <div className="space-y-3">
            {data.polls.length === 0 && <div className="text-white/60">Пока нет опросов</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

