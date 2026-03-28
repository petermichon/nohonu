import { useState } from 'react'

// import './App.css'

export function _() {
  return <></>
}

export function App() {
  return (
    <>
      <div className="w-screen h-screen m-0 overflow-hidden">
        <Idk test={''}></Idk>
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
