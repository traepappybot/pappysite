import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired, adminOnly } from "../lib/auth.js"
import { nowIso } from "../lib/utils.js"

const r = Router()

// Публичная лента постов, видна всем
r.get("/", (req, res) => {
  const data = db.get()
  const list = data.posts
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(p => {
      const u = p.authorUserId ? data.users.find(x => x.id === p.authorUserId) : null
      const author = u
        ? { username: u.username, role: u.role || "user" }
        : (p.author || null) || null
      return { ...p, author }
    })
  res.json(list)
})

// Создание поста только админом (и модератором, если захочешь назначать такую роль)
r.post("/", authRequired, adminOnly, (req, res) => {
  const { title, content, imageUrl } = req.body || {}
  const data = db.get()
  const u = data.users.find(x => x.id === req.user.id) || null
  const p = {
    id: db.id(),
    title,
    content,
    imageUrl,
    createdAt: nowIso(),
    authorUserId: u?.id || null,
    author: u ? { username: u.username, role: u.role || "user" } : null
  }
  data.posts.push(p)
  db.save(data)
  res.json(p)
})

r.delete("/:id", authRequired, adminOnly, (req, res) => {
  const data = db.get()
  data.posts = data.posts.filter(p => p.id !== req.params.id)
  db.save(data)
  res.json({ ok: true })
})

export default r
