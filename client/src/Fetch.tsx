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
