import './App.css'
import type { Frame } from './types'

function App() {
  const title = "Cheese Burger"
  const frames: Frame[] = [
    {
      id: 1,
      author: "Ethan",
      date: 20240601,
      location: "New York",
      round: 1,
      season: "Summer",
      award: "Most atmospheric",
    },
    {
      id: 2,
      author: "Ethan",
      date: 20240605,
      location: "Los Angeles",
      round: 2,
      season: "Summer",
      award: "Best subject",
    },
    {
      id: 3,
      author: "Ethan",
      date: 20240610,
      location: "San Diego",
      round: 3,
      season: "Summer",
      award: "",
    },
    {
      id: 4,
      author: "David",
      date: 20240602,
      location: "New York",
      round: 1,
      season: "Summer",
      award: "Most creative",
    },
    {
      id: 5,
      author: "David",
      date: 20240607,
      location: "Seattle",
      round: 2,
      season: "Summer",
      award: "Most candid",
    },
    {
      id: 6,
      author: "Mia",
      date: 20240603,
      location: "Chicago",
      round: 1,
      season: "Summer",
      award: "Wish I was there",
    },
    {
      id: 7,
      author: "Mia",
      date: 20240608,
      location: "Chicago",
      round: 2,
      season: "Summer",
      award: "",
    },
    {
      id: 8,
      author: "Leo",
      date: 20241202,
      location: "Boston",
      round: 1,
      season: "Winter",
      award: "Most peaceful",
    },
    {
      id: 9,
      author: "Leo",
      date: 20241206,
      location: "Montreal",
      round: 2,
      season: "Winter",
      award: "",
    },
    {
      id: 10,
      author: "Ava",
      date: 20241203,
      location: "Toronto",
      round: 1,
      season: "Winter",
      award: "Made me laugh",
    },
  ]

  return <>
    <h1>{title}</h1>
    <p>Welcome to the Cheese Burger app!</p>
    <Grid frames={frames} />
  </>
}

//reads the frame data
function FrameCard({ frame }: { frame: Frame }) {
  return (
    <div className="card">
      <h2>Frame {frame.id}</h2>
      <p>Author: {frame.author}</p>
      <p>Date: {frame.date}</p>
      <p>Location: {frame.location}</p>
      <p>Round: {frame.round}</p>
      <p>Season: {frame.season}</p>
      <p>Award: {frame.award || "No award"}</p>
    </div>
  )
}

//displays the frame data in a grid
function Grid({ frames }: { frames: Frame[] }) {
  return (
    <div className="grid">
      {frames.map(frame => (
        <FrameCard key={frame.id} frame={frame} />
      ))}
    </div>
  )
}
export default App