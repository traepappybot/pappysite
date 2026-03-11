import { Router } from "express"
import { db } from "../lib/db.js"
import { hashPassword, verifyPassword } from "../lib/utils.js"
import { signToken } from "../lib/auth.js"
import { v4 as uuid } from "uuid"

const r = Router()

// Роут регистрации
r.post("/register", (req, res) => {
  const { username, email, password, deviceId } = req.body || {}
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Заполните все поля" })
  }
  
  const data = db.get()
  const exists = data.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  
  if (exists) {
    return res.status(400).json({ error: "Email уже зарегистрирован" })
  }
  
  const id = db.id()
  const createdAt = new Date().toISOString()
  const user = {
    id, username, email,
    passwordHash: hashPassword(password),
    balance: 1,
    role: "user", // Все новые пользователи — обычные
    createdAt,
    deviceIds: deviceId ? [deviceId] : [],
    ips: []
  }
  
  data.users.push(user)
  db.save(data)
  res.json({ ok: true })
})

// Роут логина с авто-админкой
r.post("/login", (req, res) => {
  const { email, password } = req.body || {}
  const data = db.get()
  
  const user = data.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(400).json({ error: "Неверные данные" })
  }

  // Проверка: если это ты, повышаем права до admin
  if (user.email.toLowerCase() === "bmax28042004@gmail.com") {
    if (user.role !== "admin") {
      user.role = "admin"
      db.save(data) // Сохраняем изменение в базу
    }
  }

  // Генерируем токен с актуальной ролью
  const token = signToken({ id: user.id, role: user.role })
  res.json({ token })
})

export default r
