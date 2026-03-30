import { useState } from 'react'

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
