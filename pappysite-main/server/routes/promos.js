import { Router } from "express"
import { db } from "../lib/db.js"
import { authRequired } from "../lib/auth.js"

const r = Router()

r.get("/", authRequired, (req, res) => {
  const data = db.get()
  const my = data.promoCodes.find(p => p.ownerUserId === req.user.id) || null
  res.json({ my })
})

export default r
