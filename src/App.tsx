import './App.css'
import { useState } from 'react'
import { filterFrames } from './filterFrames'
import type { FilterQuery } from './filterFrames'
import type { Frame, Season, Award } from './types'
import { AWARDS } from './types'


function App() {
  const title = "Cheese Burger"
  const currentUser = "Ethan"

  // currentRound now lives on each season, so seasons is state we can advance.
  const [seasons, setSeasons] = useState<Season[]>([
    { id: 1, theme: "Summer", status: "active", currentRound: 1, roundCount: 3 },
    { id: 2, theme: "Winter", status: "active", currentRound: 1, roundCount: 2 },
  ])

  //mock data, time is going to have an option to be read from EXIF or user input.
  const frames: Frame[] = [
    {
      id: 1,
      author: "Ethan",
      timeTaken: "2024-06-01T08:15:30",
      location: "New York",
      round: 1,
      seasonId: 1,
      status: "submitted",
    },
    {
      id: 2,
      author: "Ethan",
      timeTaken: "2024-06-05T14:22:10",
      location: "Los Angeles",
      round: 2,
      seasonId: 1,
      status: "submitted",
    },
    {
      id: 3,
      author: "Ethan",
      timeTaken: "2024-06-10T19:05:45",
      location: "San Diego",
      round: 3,
      seasonId: 1,
      status: "submitted",
    },
    {
      id: 4,
      author: "David",
      timeTaken: "2024-06-02T09:40:05",
      location: "New York",
      round: 1,
      seasonId: 1,
      status: "submitted",
    },
    {
      id: 5,
      author: "David",
      timeTaken: "2024-06-07T17:18:55",
      location: "Seattle",
      round: 2,
      seasonId: 1,
      status: "submitted",
    },
    {
      id: 6,
      author: "Mia",
      timeTaken: "2024-06-03T12:00:00",
      location: "Chicago",
      round: 1,
      seasonId: 1,
      status: "submitted",
    },
    {
      id: 7,
      author: "Mia",
      timeTaken: "2024-06-08T20:30:15",
      location: "Chicago",
      round: 2,
      seasonId: 1,
      status: "submitted",
    },
    {
      id: 8,
      author: "Leo",
      timeTaken: "2024-12-02T07:55:20",
      location: "Boston",
      round: 1,
      seasonId: 2,
      status: "submitted",
    },
    {
      id: 9,
      author: "Leo",
      timeTaken: "2024-12-06T16:42:08",
      location: "Montreal",
      round: 2,
      seasonId: 2,
      status: "submitted",
    },
    {
      id: 10,
      author: "Ava",
      timeTaken: "2024-12-03T11:11:11",
      location: "Toronto",
      round: 1,
      seasonId: 2,
      status: "submitted",
    },
  ]

  // awards are their own flat list, linked to frames by frameId.
  const awards: Award[] = [
    { id: 1, name: AWARDS.mostPeaceful, frameId: 1, seasonId: 1 },
    { id: 2, name: AWARDS.bestComposition, frameId: 2, seasonId: 1 },
    { id: 3, name: AWARDS.madeMeLaugh, frameId: 4, seasonId: 1 },
    { id: 4, name: AWARDS.mostCreative, frameId: 6, seasonId: 1 },
    { id: 5, name: AWARDS.mostSurprising, frameId: 8, seasonId: 2 },
  ]

  const advanceSeason = (seasonId: number) =>
    setSeasons(prev => prev.map(s =>
      s.id === seasonId ? { ...s, currentRound: s.currentRound + 1 } : s
    ))

  return <>
    <h1>{title}</h1>
    <p>Welcome to the Cheese Burger app!</p>
    {seasons.map(season => (
      <p key={season.id}>
        {season.theme} current round: {season.currentRound}
        {' '}
        <button onClick={() => advanceSeason(season.id)}>Advance {season.theme}</button>
      </p>
    ))}
    <h2>Ethan in Summer</h2>
    <Roll frames={frames} query={{ author: 'Ethan', seasonId: 1 }} seasons={seasons} awards={awards} currentUser={currentUser} />
    <h1>________________________________</h1>
    <h2>Winter round 1</h2>
    <Roll frames={frames} query={{ seasonId: 2, round: 1 }} seasons={seasons} awards={awards} currentUser={currentUser} />
  </>
}

//reads the frame data
//@param frame: Frame - the frame data to display
//@return a card with the frame data
function FrameCard({ frame, seasons, awards, currentUser }: { frame: Frame, seasons: Season[], awards: Award[], currentUser: string }) {
  const season = seasons.find(s => s.id === frame.seasonId)
  const frameAwards = awards.filter(a => a.frameId === frame.id)
  const isMine = frame.author === currentUser
  const isDeveloped = frame.status === "submitted" && !!season && frame.round < season.currentRound
  const canSee = isMine || isDeveloped

  return canSee ? (
    <div className="card">
      <h2>Frame {frame.id}</h2>
      <p>Author: {frame.author}</p>
      <p>Time Taken: {frame.timeTaken}</p>
      <p>Location: {frame.location}</p>
      <p>Round: {frame.round}</p>
      <p>Season: {season?.theme ?? frame.seasonId}</p>
      <p>Awards: {frameAwards.length > 0 ? frameAwards.map(a => a.name).join(", ") : "No award"}</p>
    </div>
  ) : (
    <div className="card">
      <h2>Frame {frame.id}</h2>
      <p>developing…</p>
    </div>
  )
}

//displays the frame data in a grid
//@param frames: Frame[] - the frame data to display
//@return a grid with the frame data
function Grid({ frames, seasons, awards, currentUser }: { frames: Frame[], seasons: Season[], awards: Award[], currentUser: string }) {
  return (
    <div className="grid">
      {frames.map(frame => (
        <FrameCard key={frame.id} frame={frame} seasons={seasons} awards={awards} currentUser={currentUser} />
      ))}
    </div>
  )
}
//filters the frames by author and displays them in a grid
//@param frames: Frame[] - the frame data to filter
//@param query: filterQuery - the filters to apply
//@return a grid with the filtered frame data
function Roll({ frames, query, seasons, awards, currentUser }: { frames: Frame[], query: FilterQuery, seasons: Season[], awards: Award[], currentUser: string }) {
  const filteredFrames = filterFrames(frames, query)

  return filteredFrames.length > 0 ? (
    <Grid frames={filteredFrames} seasons={seasons} awards={awards} currentUser={currentUser} />
  ) : (
    <p>No frames found for this filter.</p>
  )
}
export default App