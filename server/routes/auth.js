import { Router } from "express"
import { db } from "../lib/db.js"
import { hashPassword, verifyPassword, isAlnum } from "../lib/utils.js"
import { signToken } from "../lib/auth.js"
import { v4 as uuid } from "uuid"
import { verifyCaptcha, createCaptcha } from "../lib/utils.js"

const r = Router()

r.get("/captcha", (req, res) => {
  const c = createCaptcha()
  res.json({ id: c.id, question: c.question })
})

r.post("/register", (req, res) => {
  const { username, email, password, promoCode, captchaId, captchaAnswer, deviceId } = req.body || {}
  if (!username || !email || !password) return res.status(400).json({ error: "Заполните все поля" })
  if (!verifyCaptcha(captchaId, captchaAnswer)) return res.status(400).json({ error: "Неверная капча" })
  const data = db.get()
  const exists = data.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (exists) return res.status(400).json({ error: "Email уже зарегистрирован" })
  const id = db.id()
  const createdAt = new Date().toISOString()
  const user = {
    id,
    username,
    email,
    passwordHash: hashPassword(password),
    balance: 1,
    levelId: null,
    role: "user",
    promoCode: null,
    steamTradeLink: "",
    createdAt,
    emailVerified: false,
    deviceIds: deviceId ? [deviceId] : [],
    ips: [],
    referralByPromo: null,
    referralRewarded: false
  }
  data.users.push(user)
  const tx = { id: db.id(), userId: id, type: "reward", amount: 1, balanceAfter: 1, note: "Бонус за регистрацию", createdAt }
  data.transactions.push(tx)
  if (promoCode) {
    const code = data.promoCodes.find(p => p.code.toLowerCase() === promoCode.toLowerCase() && !p.disabled)
    if (code) {
      const day = new Date().toISOString().slice(0, 10)
      code.dailyActivations = code.dailyActivations || {}
      code.dailyActivations[day] = code.dailyActivations[day] || 0
      if (code.dailyActivations[day] < 50) {
        code.pending = code.pending || []
        code.pending.push({ invitedUserId: id, createdAt })
        user.referralByPromo = code.code
      }
    }
  }
  const token = uuid()
  data.emailVerifications.push({ token, userId: id, createdAt })
  db.save(data)
  res.json({ ok: true, verifyToken: token })
})

r.get("/verify-email", (req, res) => {
  const { token } = req.query
  const data = db.get()
  const rec = data.emailVerifications.find(e => e.token === token)
  if (!rec) return res.status(400).json({ error: "Неверный токен" })
  const user = data.users.find(u => u.id === rec.userId)
  if (!user) return res.status(400).json({ error: "Пользователь не найден" })
  user.emailVerified = true
  data.emailVerifications = data.emailVerifications.filter(e => e.token !== token)
  db.save(data)
  res.json({ ok: true })
})

r.post("/login", (req, res) => {
  const { email, password, deviceId } = req.body || {}
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || ""
  const data = db.get()
  const user = data.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
  if (!user) return res.status(400).json({ error: "Неверные данные" })
  if (!verifyPassword(password, user.passwordHash)) return res.status(400).json({ error: "Неверные данные" })
  if (deviceId && !user.deviceIds.includes(deviceId)) user.deviceIds.push(deviceId)
  if (ip && !user.ips.includes(ip)) user.ips.push(ip)
  db.save(data)
  const token = signToken({ id: user.id, role: user.role })
  res.json({ token })
})

export default r
