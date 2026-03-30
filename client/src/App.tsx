import { useState } from 'react'

// import './App.css'

function Component() {
  return <></>
}

export function App() {
  return (
    <>
      <div className="w-screen h-screen m-0 overflow-hidden">
        <Fetch></Fetch>
      </div>
    </>
  )
}

async function fetchGithub() {
  const owner = 'petermichon'
  const repo = 'veodee'
  const auth = '***********'
  const input = `http://localhost:8000/api/v1/update?owner=${owner}&repo=${repo}&auth=${auth}`
  const method = 'POST'
  const response = await fetch(input, { method })
  return response
}

export function Fetch() {
  return (
    <>
      <div className="w-screen h-screen m-0 overflow-hidden">
        <p className="m-0 p-2 text-center bg-neutral-800">Dashboard</p>
        <div>
          <button
            onClick={async () => {
              const response = await fetchGithub()
              console.log(`Sync with GitHub: ${response.statusText}`)
            }}
          >
            Sync with GitHub
          </button>
        </div>
      </div>
    </>
  )
}

// ---

type Test = { test: string }

export function Idk({ test }: Test) {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="w-screen h-screen m-0 overflow-hidden">
        <p className="m-0 p-2 text-center bg-neutral-800">Vite + React</p>
        <div>
          <button
            onClick={() =>
              setCount((count) => {
                return count + 1
              })
            }
          >
            count is {count} {test}
          </button>
        </div>
      </div>
    </>
  )
}

// ---

type Video = {
  url: string
  title: string
  description: string
}

export function Video(video: Video) {
  return (
    <div>
      {/* <Thumbnail video={video} /> */}
      <a href={video.url}>
        <h3>{video.title}</h3>
        <p>{video.description}</p>
      </a>
      {/* <LikeButton video={video} /> */}
    </div>
  )
}
