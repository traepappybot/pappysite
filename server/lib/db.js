import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { v4 as uuid } from "uuid"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, "..", "data")
const dbFile = path.join(dataDir, "db.json")

export function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(dbFile)) {
    const initial = {
      users: [],
      transactions: [],
      promoCodes: [],
      quests: [],
      userQuests: [],
      levels: [],
      matches: [],
      bets: [],
      rewards: [
        { id: "cheap", name: "Дешёвый скин", price: 2 },
        { id: "standard", name: "Стандартный скин", price: 5 },
        { id: "rare", name: "Редкий скин", price: 15 },
        { id: "premium", name: "Премиум скин", price: 100 }
      ],
      orders: [],
      posts: [],
      polls: [],
      votes: [],
      about: {
        contentHtml: "<h1>О нас</h1><p>Киберпанк сообщество PAPPY</p>",
        links: { telegram: "", discord: "", twitter: "", steam: "", youtube: "" }
      },
      emailVerifications: []
    }
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2), "utf-8")
  }
}

function read() {
  const raw = fs.readFileSync(dbFile, "utf-8")
  return JSON.parse(raw)
}

function write(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf-8")
}

export const db = {
  get() {
    return read()
  },
  save(data) {
    write(data)
  },
  id() {
    return uuid()
  }
}

