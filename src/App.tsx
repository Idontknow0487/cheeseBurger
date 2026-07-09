import './App.css'
import { useState } from 'react'
import { filterFrames } from './filterFrames'
import type { FilterQuery } from './filterFrames'
import type { Frame } from './types'


function App() {
  const title = "Cheese Burger"
  const [currentRound, setCurrentRound] = useState(1)
  const currentUser = "Ethan"

  //mock data, time is going to have an option to be read from EXIF or user input.
  const frames: Frame[] = [
    {
      id: 1,
      author: "Ethan",
      timeTaken: "2024-06-01T08:15:30",
      location: "New York",
      round: 1,
      season: "Summer",
      award: "Most atmospheric",
    },
    {
      id: 2,
      author: "Ethan",
      timeTaken: "2024-06-05T14:22:10",
      location: "Los Angeles",
      round: 2,
      season: "Summer",
      award: "Best subject",
    },
    {
      id: 3,
      author: "Ethan",
      timeTaken: "2024-06-10T19:05:45",
      location: "San Diego",
      round: 3,
      season: "Summer",
      award: "",
    },
    {
      id: 4,
      author: "David",
      timeTaken: "2024-06-02T09:40:05",
      location: "New York",
      round: 1,
      season: "Summer",
      award: "Most creative",
    },
    {
      id: 5,
      author: "David",
      timeTaken: "2024-06-07T17:18:55",
      location: "Seattle",
      round: 2,
      season: "Summer",
      award: "Most candid",
    },
    {
      id: 6,
      author: "Mia",
      timeTaken: "2024-06-03T12:00:00",
      location: "Chicago",
      round: 1,
      season: "Summer",
      award: "Wish I was there",
    },
    {
      id: 7,
      author: "Mia",
      timeTaken: "2024-06-08T20:30:15",
      location: "Chicago",
      round: 2,
      season: "Summer",
      award: "",
    },
    {
      id: 8,
      author: "Leo",
      timeTaken: "2024-12-02T07:55:20",
      location: "Boston",
      round: 1,
      season: "Winter",
      award: "Most peaceful",
    },
    {
      id: 9,
      author: "Leo",
      timeTaken: "2024-12-06T16:42:08",
      location: "Montreal",
      round: 2,
      season: "Winter",
      award: "",
    },
    {
      id: 10,
      author: "Ava",
      timeTaken: "2024-12-03T11:11:11",
      location: "Toronto",
      round: 1,
      season: "Winter",
      award: "Made me laugh",
    },
  ]

  return <>
    <h1>{title}</h1>
    <p>Welcome to the Cheese Burger app!</p>
    <p>Current round: {currentRound}</p>
    <button onClick={() => setCurrentRound(currentRound + 1)}>Advance the season</button>
    <h2>Ethan in Summer</h2>
    <Roll frames={frames} query={{ author: 'Ethan', season: 'Summer' }} currentRound={currentRound} currentUser={currentUser} />
    <h1>________________________________</h1>
    <h2>Winter round 1</h2>
    <Roll frames={frames} query={{ season: 'Winter', round: 1 }} currentRound={currentRound} currentUser={currentUser} />
  </>
}

//reads the frame data
//@param frame: Frame - the frame data to display
//@return a card with the frame data
function FrameCard({ frame, currentRound, currentUser }: { frame: Frame, currentRound: number, currentUser: string }) {
  const canSee = frame.round < currentRound || frame.author === currentUser

  return canSee ? (
    <div className="card">
      <h2>Frame {frame.id}</h2>
      <p>Author: {frame.author}</p>
      <p>Time Taken: {frame.timeTaken}</p>
      <p>Location: {frame.location}</p>
      <p>Round: {frame.round}</p>
      <p>Season: {frame.season}</p>
      <p>Award: {frame.award || "No award"}</p>
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
function Grid({ frames, currentRound, currentUser }: { frames: Frame[], currentRound: number, currentUser: string }) {
  return (
    <div className="grid">
      {frames.map(frame => (
        <FrameCard key={frame.id} frame={frame} currentRound={currentRound} currentUser={currentUser} />
      ))}
    </div>
  )
}
//filters the frames by author and displays them in a grid
//@param frames: Frame[] - the frame data to filter
//@param query: filterQuery - the filters to apply
//@return a grid with the filtered frame data
function Roll({ frames, query, currentRound, currentUser }: { frames: Frame[], query: FilterQuery, currentRound: number, currentUser: string }) {
  const filteredFrames = filterFrames(frames, query)

  return filteredFrames.length > 0 ? (
    <Grid frames={filteredFrames} currentRound={currentRound} currentUser={currentUser} />
  ) : (
    <p>No frames found for this filter.</p>
  )
}
export default App