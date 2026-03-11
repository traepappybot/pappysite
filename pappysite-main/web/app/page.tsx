import Link from "next/link"
import { API_URL } from "../lib/api"

type Post = {
  id: string
  title: string
  content: string
  imageUrl?: string
  createdAt: string
  author?: { username: string; role?: string } | null
}

type Poll = {
  id: string
  question: string
  createdAt: string
}

function RoleBadge({ role }: { role?: string }) {
  const r = role || "user"
  if (r === "admin") return <span className="text-yellow-300 text-xs ml-2 px-2 py-0.5 rounded-full bg-yellow-300/10 border border-yellow-400/40">admin</span>
  if (r === "moderator") return <span className="text-green-400 text-xs ml-2 px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/40">moderator</span>
  return <span className="text-white/50 text-xs ml-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">user</span>
}

async function getData(): Promise<{ posts: Post[]; polls: Poll[] }> {
  const [postsRes, pollsRes] = await Promise.all([
    fetch(`${API_URL}/posts`, { cache: "no-store" }),
    fetch(`${API_URL}/polls`, { cache: "no-store" })
  ])

  const posts = postsRes.ok ? await postsRes.json() : []
  const polls = pollsRes.ok ? await pollsRes.json() : []

  return { posts, polls }
}

export default async function Home() {
  const data = await getData()
  return (
    <div className="space-y-6">
      <section className="glass p-6 rounded-2xl shadow-neon border border-white/10 bg-gradient-to-br from-white/5 via-purple-900/20 to-black/60">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold glow tracking-tight">
              Киберпанк комьюнити <span className="text-neon">PAPPY</span>
            </h1>
            <p className="text-white/80 mt-2 max-w-xl">
              Делай ставки, проходи квесты, забирай скины и попадай в топы сообщества.
            </p>
          </div>
          <div className="flex gap-2 md:flex-col md:items-end">
            <Link href="/register" className="btn btn-primary px-5 py-2.5 text-sm md:w-40 text-center">
              Присоединиться
            </Link>
            <Link href="/bets" className="btn glass px-5 py-2.5 text-sm md:w-40 text-center">
              К матчам
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4 items-start">
        <div className="glass p-4 rounded-2xl border border-white/10">
          <h2 className="font-semibold mb-3 text-neon text-lg flex items-center gap-2">
            Лента
            <span className="text-xs text-white/50 font-normal">
              {data.posts.length ? `${data.posts.length} постов` : "нет постов"}
            </span>
          </h2>
          <div className="space-y-3">
            {data.posts.length === 0 && (
              <div className="text-white/60 text-sm">Пока нет постов. Админы и модераторы скоро что‑нибудь запостят.</div>
            )}
            {data.posts.map(p => (
              <article key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon/40 to-acid/40 flex items-center justify-center text-xs font-semibold uppercase">
                    {(p.author?.username || "P").slice(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-sm font-semibold">
                        {p.author?.username || "PAPPY"}
                      </span>
                      <RoleBadge role={p.author?.role} />
                    </div>
                    <span className="text-[11px] text-white/50">
                      {new Date(p.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-1">{p.title}</h3>
                {p.imageUrl && (
                  <div className="mt-2 mb-2 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                    <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                {p.content && (
                  <p className="text-sm text-white/80 whitespace-pre-line">
                    {p.content.length > 260 ? `${p.content.slice(0, 260)}…` : p.content}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/10">
          <h2 className="font-semibold mb-3 text-acid text-lg">Опросы</h2>
          <div className="space-y-3">
            {data.polls.length === 0 && (
              <div className="text-white/60 text-sm">
                Пока нет опросов. Следи за обновлениями, чтобы голосовать вместе с комьюнити.
              </div>
            )}
            {data.polls.map(p => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-sm font-semibold mb-1">{p.question}</div>
                <div className="text-[11px] text-white/50">
                  Создано {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
