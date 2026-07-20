import './App.css'
import exifr from 'exifr'
import heicPlaceholder from './assets/IMG_5065-2.jpg'
import { useState, useRef } from 'react'
import { filterFrames } from './filterFrames'
import type { Frame, Season, Award } from './types'
import { AWARDS } from './types'

type Page = "active" | "map" | "past"

// ── Placeholder "photos". Real frames will carry `image` (a createObjectURL
// preview in v1); until then a developed frame shows a gradient picked
// deterministically by its id, and an undeveloped frame shows black.
const PHOTOS = [
  "linear-gradient(160deg,#2a3a52,#4a4258 45%,#b9744e)",
  "linear-gradient(180deg,#1a2740,#2f4568 60%,#6d7fa3)",
  "linear-gradient(180deg,#3a3f44,#565c62 55%,#8a8f92)",
  "linear-gradient(155deg,#201a16,#4a3220 50%,#c98a3e)",
  "linear-gradient(180deg,#10131c,#1c2334 65%,#3a4763)",
  "linear-gradient(180deg,#223533,#35514c 55%,#7fa199)",
]
const gradientFor = (frame: Frame) => PHOTOS[frame.id % PHOTOS.length]

// ── ISO date parsers → the readable formats used in the mockup.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// "2024-06-01T08:15:30" → "Jun 1 · 8:15am"
function formatFrameTime(iso: string): string {
  const d = new Date(iso)
  const min = d.getMinutes().toString().padStart(2, "0")
  const ampm = d.getHours() < 12 ? "am" : "pm"
  let h = d.getHours() % 12
  if (h === 0) h = 12
  return `${MONTHS[d.getMonth()]} ${d.getDate()} · ${h}:${min}${ampm}`
}

// "2024-06-01T..." → "Jun 1" (short form for the award caption)
function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

// "2025-12-05" → "Dec 2025" (season "when" on past-season cards)
function formatSeasonWhen(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// endsAt - now → human time-left. Derived at render from the system clock.
function timeLeft(endsAt: string, now: Date): string {
  const days = Math.ceil((new Date(endsAt).getTime() - now.getTime()) / 86_400_000)
  if (days > 1) return `${days} days left`
  if (days === 1) return "1 day left"
  if (days === 0) return "Ends today"
  return "Ended"
}

function App() {
  const currentUser = "Ethan"
  const now = new Date() // system clock; drives each active season's time-left

  // Statuses/dates are hardcoded for this alpha; a backend decides them later.
  // Summer = the current (active) season, Winter = a completed past season.
  const [seasons] = useState<Season[]>([
    { id: 1, theme: "Summer", status: "active",   currentRound: 2, roundCount: 3, startsAt: "2026-07-17", endsAt: "2026-07-31" },
    // complete → currentRound past the last round so every frame reads developed.
    { id: 2, theme: "Winter", status: "complete", currentRound: 3, roundCount: 2, startsAt: "2025-12-05", endsAt: "2025-12-19" },
  ])


  //MOCK BTW
  // Flat list of frames — the only real stored objects. Rolls/rounds are derived
  // by filtering this list. Some rounds carry more than one frame on purpose.
  const frames: Frame[] = [
    // ── Summer (season 1). Round 1 has developed (round < currentRound=2);
    //    round 2 is still hidden for everyone except the current user.
    { id: 1,  author: "Ethan", timeTaken: "2026-07-17T08:15:30", location: "New York", round: 1, seasonId: 1, status: "submitted" },
    { id: 2,  author: "Ethan", timeTaken: "2026-07-17T21:02:00", location: "New York", round: 1, seasonId: 1, status: "submitted" },
    { id: 3,  author: "Ethan", timeTaken: "2026-07-20T06:40:00", location: "Boston",   round: 2, seasonId: 1, status: "submitted" },
    { id: 4,  author: "Ethan", timeTaken: "2026-07-20T19:12:00", location: "Boston",   round: 2, seasonId: 1, status: "submitted" },
    { id: 5,  author: "Ava",   timeTaken: "2026-07-18T10:20:00", location: "Toronto",  round: 1, seasonId: 1, status: "submitted" },
    { id: 6,  author: "Ava",   timeTaken: "2026-07-18T17:50:00", location: "Toronto",  round: 1, seasonId: 1, status: "submitted" },
    { id: 7,  author: "Ava",   timeTaken: "2026-07-21T09:00:00", location: "Toronto",  round: 2, seasonId: 1, status: "submitted" },
    { id: 8,  author: "Ava",   timeTaken: "2026-07-21T20:00:00", location: "Toronto",  round: 2, seasonId: 1, status: "submitted" },
    { id: 9,  author: "David", timeTaken: "2026-07-18T08:40:00", location: "Seattle",  round: 1, seasonId: 1, status: "submitted" },
    { id: 10, author: "David", timeTaken: "2026-07-21T12:30:00", location: "Seattle",  round: 2, seasonId: 1, status: "submitted" },
    { id: 11, author: "David", timeTaken: "2026-07-22T07:15:00", location: "Seattle",  round: 2, seasonId: 1, status: "submitted" },
    { id: 12, author: "Leo",   timeTaken: "2026-07-17T07:55:00", location: "Montreal", round: 1, seasonId: 1, status: "submitted" },
    { id: 13, author: "Leo",   timeTaken: "2026-07-17T16:30:00", location: "Montreal", round: 1, seasonId: 1, status: "submitted" },
    { id: 14, author: "Leo",   timeTaken: "2026-07-20T14:00:00", location: "Montreal", round: 2, seasonId: 1, status: "submitted" },
    { id: 15, author: "Mia",   timeTaken: "2026-07-19T12:00:00", location: "Chicago",  round: 1, seasonId: 1, status: "submitted" },
    { id: 16, author: "Mia",   timeTaken: "2026-07-19T20:30:00", location: "Chicago",  round: 1, seasonId: 1, status: "submitted" },
    { id: 17, author: "Mia",   timeTaken: "2026-07-22T11:11:00", location: "Chicago",  round: 2, seasonId: 1, status: "submitted" },
    { id: 18, author: "Mia",   timeTaken: "2026-07-22T18:45:00", location: "Chicago",  round: 2, seasonId: 1, status: "submitted" },

    // ── Winter (season 2, complete). Every frame is developed.
    { id: 19, author: "Ethan", timeTaken: "2025-12-05T18:00:00", location: "New York", round: 1, seasonId: 2, status: "submitted" },
    { id: 20, author: "Ethan", timeTaken: "2025-12-05T19:00:00", location: "New York", round: 1, seasonId: 2, status: "submitted" },
    { id: 21, author: "Ethan", timeTaken: "2025-12-12T08:00:00", location: "New York", round: 2, seasonId: 2, status: "submitted" },
    { id: 22, author: "Ava",   timeTaken: "2025-12-06T17:00:00", location: "Toronto",  round: 1, seasonId: 2, status: "submitted" },
    { id: 23, author: "Ava",   timeTaken: "2025-12-13T09:00:00", location: "Toronto",  round: 2, seasonId: 2, status: "submitted" },
    { id: 24, author: "Leo",   timeTaken: "2025-12-05T07:55:00", location: "Boston",   round: 1, seasonId: 2, status: "submitted" },
    { id: 25, author: "Leo",   timeTaken: "2025-12-06T16:42:00", location: "Montreal", round: 1, seasonId: 2, status: "submitted" },
    { id: 26, author: "Leo",   timeTaken: "2025-12-13T17:00:00", location: "Boston",   round: 2, seasonId: 2, status: "submitted" },
  ]

  // Awards are their own flat list, linked to frames by frameId. Winter's three
  // render in its award row. Summer's are here too but WON'T show while it's
  // active — awards are handed out at end of season (see AwardRow gate below).
  const awards: Award[] = [
    { id: 1, name: AWARDS.mostPeaceful,    frameId: 24, seasonId: 2 },
    { id: 2, name: AWARDS.madeMeLaugh,     frameId: 22, seasonId: 2 },
    { id: 3, name: AWARDS.mostSurprising,  frameId: 19, seasonId: 2 },
    { id: 4, name: AWARDS.bestComposition, frameId: 1,  seasonId: 1 },
    { id: 5, name: AWARDS.mostCreative,    frameId: 15, seasonId: 1 },
  ]

  const [page, setPage] = useState<Page>("active")
  const [openPastId, setOpenPastId] = useState<number | null>(null)

  const activeSeason = seasons.find(s => s.status === "active")
  const openPast = seasons.find(s => s.id === openPastId)

  return (
    <div className="app">
      <Nav page={page} setPage={setPage} />

      {page === "active" && (activeSeason
        ? <SeasonView season={activeSeason} frames={frames} awards={awards} currentUser={currentUser} now={now} />
        : <p>No active season right now.</p>)}

      {page === "map" && <MapStub />}

      {page === "past" && (openPast
        ? <>
            <button className="back" onClick={() => setOpenPastId(null)}>← Past seasons</button>
            <SeasonView season={openPast} frames={frames} awards={awards} currentUser={currentUser} now={now} />
          </>
        : <PastGrid seasons={seasons} frames={frames} onOpen={setOpenPastId} />)}
    </div>
  )
}

// ── Top navbar. Buttons set the `page` state (useState-only nav — no router
// yet, so back/forward + shareable URLs don't work; swap in react-router later).
function Nav({ page, setPage }: { page: Page, setPage: (p: Page) => void }) {
  const pages: Page[] = ["active", "map", "past"]
  return (
    <nav className="nav">
      <span className="nav__brand">cheeseBurger</span>
      <div className="nav__links">
        {pages.map(p => (
          <button key={p} className={"nav__link" + (page === p ? " on" : "")} onClick={() => setPage(p)}>
            {p === "active" ? "This season" : p === "map" ? "Map" : "Past seasons"}
          </button>
        ))}
      </div>
    </nav>
  )
}

type RollView = { author: string; you: boolean; rounds: Frame[][] }

// Derive one filmstrip per author from the flat frame list: current user first,
// then the rest alphabetically. Each author's rounds[] is filtered per round.
function buildRolls(frames: Frame[], season: Season, currentUser: string): RollView[] {
  const seasonFrames = filterFrames(frames, { seasonId: season.id })
  const authors = Array.from(new Set(seasonFrames.map(f => f.author)))
  authors.sort((a, b) => {
    if (a === currentUser) return -1
    if (b === currentUser) return 1
    return a.localeCompare(b)
  })
  return authors.map(author => ({
    author,
    you: author === currentUser,
    rounds: Array.from({ length: season.roundCount }, (_, r) =>
      filterFrames(seasonFrames, { author, round: r + 1 })),
  }))
}

// ── Header + rolls, shared by the active and opened-past views. The selected
// frame (for the detail modal) and the add-frame modal both live here.
function SeasonView({ season, frames, awards, currentUser, now }: {
  season: Season, frames: Frame[], awards: Award[], currentUser: string, now: Date
}) {
  const [selected, setSelected] = useState<Frame | null>(null)
  const [adding, setAdding] = useState(false)
  const isActive = season.status === "active"
  const rolls = buildRolls(frames, season, currentUser)
  const seasonAwards = awards.filter(a => a.seasonId === season.id)

  return (
    <>
      <header className="head">
        <div className="head__eyebrow">{isActive ? "Now developing" : "Archived"}</div>
        <h1 className="head__theme">{season.theme}</h1>
        <div className="head__rounds">
          {Array.from({ length: season.roundCount }, (_, r) => (
            <span key={r} className={"pip" + (r + 1 < season.currentRound ? " pip--done"
              : r + 1 === season.currentRound && isActive ? " pip--now" : "")} />
          ))}
          <span className="head__roundtext">
            {isActive
              ? `Round ${season.currentRound} of ${season.roundCount} · ${timeLeft(season.endsAt, now)}`
              : "Complete"}
          </span>
        </div>
      </header>

      {season.status === "complete" && seasonAwards.length > 0 && (
        <AwardRow awards={seasonAwards} frames={frames} />
      )}

      <main className="rolls">
        {rolls.map(roll => (
          <Filmstrip key={roll.author} roll={roll} season={season} currentUser={currentUser} onSelect={setSelected} />
        ))}
      </main>

      {isActive && <button className="fab" aria-label="Add a frame" onClick={() => setAdding(true)}>+</button>}
      <FrameDetail frame={selected} onClose={() => setSelected(null)} />
      {adding && <AddFrameModal onClose={() => setAdding(false)} />}
    </>
  )
}

// ── One author's roll as a filmstrip. onSelect is passed down to each cell so a
// developed frame can report its click upward to SeasonView (state-up).
function Filmstrip({ roll, season, currentUser, onSelect }: {
  roll: RollView, season: Season, currentUser: string, onSelect: (f: Frame) => void
}) {
  return (
    <div className={"roll" + (roll.you ? " roll--you" : "")}>
      <div className="roll__label">
        {roll.you ? "You" : roll.author}
        {roll.you && <span className="roll__badge">your roll</span>}
      </div>
      <div className="strip">
        <div className="perf perf--top" />
        <div className="strip__frames">
          {roll.rounds.map((frames, r) => (
            <div className="round" key={r}>
              <div className="round__rebate">R{r + 1}</div>
              <div className="round__cells">
                {frames.length === 0
                  ? <div className="frame frame--empty" />
                  : frames.map(f => (
                      <FrameCell key={f.id} frame={f} season={season} currentUser={currentUser} onSelect={onSelect} />
                    ))}
              </div>
            </div>
          ))}
        </div>
        <div className="perf perf--bottom" />
      </div>
    </div>
  )
}

// ── A single frame cell. Reuses the real visibility rule: you always see your
// own; others develop only once their round has passed. Only developed frames
// are clickable — an undeveloped one has nothing to show yet.
function FrameCell({ frame, season, currentUser, onSelect }: {
  frame: Frame, season: Season, currentUser: string, onSelect: (f: Frame) => void
}) {
  const isMine = frame.author === currentUser
  const isDeveloped = frame.status === "submitted" && frame.round < season.currentRound
  const canSee = isMine || isDeveloped
  if (!canSee) return <div className="frame frame--undev" />
  return (
    <div className="frame frame--dev" style={{ background: gradientFor(frame) }}
         onClick={() => onSelect(frame)} role="button" tabIndex={0} />
  )
}

// ── Detail modal. Rendered only when a frame is selected (null = closed). The
// selected-frame state lives up in SeasonView; this just receives it + onClose.
function FrameDetail({ frame, onClose }: { frame: Frame | null, onClose: () => void }) {
  if (!frame) return null
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="detail" onClick={e => e.stopPropagation()}>
        <div className="detail__photo" style={{ background: gradientFor(frame) }} />
        <div className="detail__body">
          <div className="detail__author">{frame.author}</div>
          <div className="detail__row"><span>Time</span>{formatFrameTime(frame.timeTaken)}</div>
          <div className="detail__row"><span>Location</span>{frame.location}</div>
          <div className="detail__row"><span>Round</span>R{frame.round}</div>
          <button className="detail__close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Add-frame modal. Mock only: "Choose photo" and the fields are non-functional
// stubs until the backend + real uploads (URL.createObjectURL preview) land.
function AddFrameModal({ onClose }: { onClose: () => void }) {
  const [location, setLocation] = useState("")
  const [time, setTime] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  // error states for file uploads.
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [isHeic, setIsHeic] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)
  const fieldInput: React.CSSProperties = {
    background: "transparent", border: "none", color: "inherit",
    font: "inherit", textAlign: "right", outline: "none",
  }
  // ── File reading helper method. Returns Exif data for the selected image
  // file. Used in the AddFrameModal to prefill the time/location fields.
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const okType = file.type === "image/jpeg" || file.type === "image/heic"

    const okSize = file.size <= 20 * 1024 * 1024
    if (!okType || !okSize) {
      setPreview(null)
      setIsHeic(false)
      setFileName(null)
      setFileSize(null)
      setError(!okType ? "JPEG or HEIC only" : "File too large (max 20MB)")
      return
  }
  setError(null)
  setFileName(file.name)
  setFileSize((file.size / 1024 / 1024).toFixed(1) + " MB")
  if (file.type === "image/heic") {
    // Chrome can't render HEIC so we just show a placeholder jpeg for now,
    // real implementation will have a round trip where the heic is sent backend
    // to be converted to a webP, stored, and sent back for preview.
    setIsHeic(true)
  }
  else {
    setIsHeic(false)
    setPreview(URL.createObjectURL(file))
  }
}
  
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="detail" onClick={e => e.stopPropagation()}>
        <div className="detail__body" style={{ flex: "1 1 100%" }}>
          <div className="detail__author">Add a frame</div>

          <label className="detail__row"><span>Photo</span></label>
          <input ref={inputRef} type="file" accept="image/jpeg,image/heic" style={{ display: "none" }} onChange={handleFile} />
          {isHeic
            ? <img src={heicPlaceholder} alt="" style={{ maxWidth: "100%", borderRadius: 4, opacity: 0.85 }} />
            : preview && <img src={preview} alt="" style={{ maxWidth: "100%", borderRadius: 4 }} />}
          {fileName && (
            <div className="detail__row">
              <span>{isHeic ? "HEIC (placeholder)" : "File"}</span>{fileName} · {fileSize}
            </div>
          )}
          {error && <p style={{ color: "#e0a458" }}>{error}</p>}
          <button className="detail__close" style={{ marginTop: 0 }} onClick={() => inputRef.current?.click()}>Choose photo</button>
          
          <label className="detail__row"><span>Location</span>
            <input type="text" placeholder="Where was this?" value={location} onChange={(e) => setLocation(e.target.value)} style={fieldInput} />
          </label>
          <label className="detail__row"><span>Time</span>
            <input type="datetime-local" value={time} onChange={(e) => setTime(e.target.value)} style={{ ...fieldInput, textAlign: "left" }} />
          </label>
          <button className="detail__close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}


// ── Season award row. Each award looks up its frame by frameId for the photo
// placeholder and caption. Additive-only — no ranking, no score.
function AwardRow({ awards, frames }: { awards: Award[], frames: Frame[] }) {
  return (
    <div className="awards">
      <div className="awards__eyebrow">This season's awards</div>
      <div className="awards__scroll">
        {awards.map((a, i) => {
          const f = frames.find(fr => fr.id === a.frameId)
          return (
            <div className="award" key={a.id} style={{ animationDelay: `${i * 0.4}s` }}>
              <div className="award__photo" style={{ background: f ? gradientFor(f) : "#000" }} />
              <div className="award__name">{a.name}</div>
              <div className="award__meta">
                {f ? `${f.author} · ${formatShortDate(f.timeTaken)} · ${f.location}` : ""}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Past-seasons grid: completed seasons as thumbnail cards. Thumb = the first
// frame of that season. Clicking a card opens its full SeasonView.
function PastGrid({ seasons, frames, onOpen }: {
  seasons: Season[], frames: Frame[], onOpen: (id: number) => void
}) {
  const past = seasons.filter(s => s.status === "complete")
  return (
    <>
      <header className="head"><h1 className="head__theme">Past seasons</h1></header>
      <div className="pastgrid">
        {past.map(s => {
          const thumb = frames.find(f => f.seasonId === s.id)
          return (
            <button className="pastcard" key={s.id} onClick={() => onOpen(s.id)}>
              <div className="pastcard__thumb" style={{ background: thumb ? gradientFor(thumb) : "#000" }} />
              <div className="pastcard__theme">{s.theme}</div>
              <div className="pastcard__meta">{formatSeasonWhen(s.startsAt)} · {s.roundCount} rounds</div>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ── we gna do dis latr 
function MapStub() {
  return (
    <div className="stub">
      <div className="stub__pin">◎</div>
      <h1 className="head__theme">Map</h1>
      <p className="stub__note">Coming later — every developed frame, pinned where it was shot.</p>
    </div>
  )
}

export default App
