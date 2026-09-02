# rollcall

A small, private app for seasonal film-photography challenges among friends.

A **season** runs about two weeks around one broad mood — *Winter*, *Solitude*, *Warmth*. Over the season each person fills a figurative **roll of film**: a handful of photos across four rounds. Photos are submitted privately and stay hidden. At the end of each round the roll **develops** — everyone's frames for that round reveal at once. No feed, no likes, no scores. At the end of the season the group hands out named awards: *Most peaceful*, *Made me laugh*.

Built as a React + TypeScript learning project. The learning is the point, so the code favours clarity over cleverness and most of the interesting decisions are written down rather than implied.

---

## The idea

The app is trying to train attention, not technique. "The eye" is the real skill, and the app nudges you to notice things rather than testing your craft.

Which means the design has exactly one overriding priority: **make it easy for anyone to put something in.** A phone snapshot of lunch should feel as welcome as a mirrorless shot.

The barrier to that isn't "I don't know what to photograph." It's judgment — *my photo is going to be the weak one*. Every feature gets tested against a single question: does this lower the fear of participating, or raise it?

---

## Design principles

These are load-bearing. Most of the architecture exists to serve them.

**Batched, simultaneous reveal — never a live feed.** Everyone's round reveals at the same moment, so nobody submits into a stream where the good photos have already set a bar. This is the most inclusive part of the app and the reason there's no immediate posting anywhere.

**Phone and camera photos are first-class equals.** The UI never displays EXIF, gear, or device information, and every frame renders at the same size. The *omission* is the feature. EXIF may be read and stored internally — the rule is about display, not capture.

**Named awards, never ranked voting.** Ranking produces a loser and rewards the confident, which is the opposite of the goal. No stars, leaderboards, podiums, or like counts.

**Sub-themes are sparks, never specs.** Each round carries a loose emotional prompt (*Winter* → *warmth*), never a technical one. The test: could someone answer it sincerely with a phone photo they'd have taken anyway? "Warmth" passes. "Blue-hour long exposure" doesn't.

**Silent, penalty-free sit-outs.** Missing a round is fine and never surfaced as a failure. You still see the reveals and still vote on awards.

---

## Architecture

The data model is three flat lists — `frames`, `seasons`, `awards`. Those are the only stored objects. Everything else is a **derived view** produced by filtering:

```ts
// a person's roll
frames.filter(f => f.author === me && f.seasonId === season.id)

// a frame's awards — a photo may win more than one
awards.filter(a => a.frameId === frame.id)
```

A few rules that keep proving their worth:

- **Link by id, not name.** Themes are voted on, so names aren't stable.
- **Don't store anything derivable.** Time-left is `endsAt − now`, computed at render.
- **One home per fact.** Awards live in the awards list and nowhere else — never also on the frame.
- **Keep placeholder values out of the data.** Fakes belong in the render layer only.

Because rounds are strictly sequential, the entire develop-state of a season is one number:

```ts
const isMine = frame.author === currentUser;
const isDeveloped = frame.status === "submitted" && frame.round < season.currentRound;
const canSee = isMine || isDeveloped;
```

That's the whole reveal rule. `currentRound` replaces a per-round flag, and the status guard lives in exactly one place.

### Time provenance

`timeTaken` was quietly conflating three different facts: the shutter time from EXIF, a shutter time guessed by the uploader, and the upload time. It's now one value — the best estimate of capture time — paired with `timeSource: "exif" | "manual"` recording how we know it.

`"manual"` is the humble default. It's only ever *upgraded* to `"exif"` when a read actually succeeds, and editing the field by hand demotes it back, because a human touching the value makes it their claim. Manual times render with a soft `≈` to mark them as estimates.

### Photo handling

`frame.image` is always just a URL string, so `<img src={frame.image}>` never changes. Only the source of that string moves as the project grows — an in-memory `blob:` URL today, a hosted `https://` URL once storage lands.

Uploads accept JPEG and HEIC. Chrome can't render HEIC, so the modal shows a bundled placeholder for those picks — but the placeholder is **never written into the data**. Keeping `frame.image` honest means the planned backend round-trip (send HEIC → convert → store → return a real URL) is a clean plug-in rather than a correction of fake values.

---

## Stack

React · TypeScript · Vite · [exifr](https://github.com/MikeKovarik/exifr) for EXIF · oxlint

No router yet and no state-management library — navigation is `useState`, state is plain React. Both are deliberate, and both are logged as debt below.

---

## Running it

```bash
npm install
npm run dev
```

No configuration and no environment variables. There's no backend, so everything runs on mock data.

---

## Status

**Working:** the whole browse side — filmstrip UI, reveal logic, frame-detail modal, award row, past-seasons grid, responsive layout. And the whole submit side — pick a photo, EXIF prefills the capture time, fill in location, submit, and the frame appears in your roll rendering the real image.

**Mocked:** all data is hardcoded. `currentUser` is pinned to one name, season progress is fixed, ids come from `Date.now()`, and nothing survives a refresh.

**Not built yet:** editing an existing frame, award assignment, theme and award voting, and the map.

### Known limitations

- No persistence. Blob URLs are session-only.
- File type and size checks are **client-side UX only, not enforcement.** Real validation belongs on a server.
- Navigation is `useState`-based, so browser back/forward and shareable URLs don't work.
- Membership isn't modelled — a person only appears in a season once they've submitted something.
- Undeveloped frames still reveal *how many* photos someone submitted, which cuts against the batched-reveal principle. Known, and queued.

### Roadmap

Router swap → backend (auth, storage, real uploads, persistence) → award assignment → voting → map.

---

## Contributing

This is a personal learning project, written by hand on purpose. Issues and observations are welcome; pull requests probably aren't the right fit, since the value here is in working through the problems rather than having them solved.