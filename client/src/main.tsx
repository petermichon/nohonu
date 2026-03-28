import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'

import './index.css'

import { App } from './App.tsx'

export function main() {
  get('index.html')

  const rootElement = document.getElementById('root')!

  const root = createRoot(rootElement)

  const children: React.ReactNode = (
    <StrictMode>
      <App />
    </StrictMode>
  )

  root.render(children)
}

async function get(file: string) {
  // https://www.dropbox.com/scl/fo/hn1sewiyb2vb0z4rmlbuq/AK6nOnEyNYHPVFm6wfFaI0k?rlkey=plzfhmduqdfb24qmmzhqtfpfy&st=3oq5c0rn&dl=0

  // const path = 'hn1sewiyb2vb0z4rmlbuq/AK6nOnEyNYHPVFm6wfFaI0k'
  // const file = 'hello.txt'
  // const rlkey = 'plzfhmduqdfb24qmmzhqtfpfy'
  // const url = `https://dl.dropboxusercontent.com/scl/fi/${path}/${file}?rlkey=${rlkey}`

  const user = 'petermichon'
  const repo = 'public'
  const branch = 'main'
  const root = 'dist/'
  // const file = 'index.html' // <-- request parameter
  const path = `${root}${file}`
  const route = `/${user}/${repo}/${branch}/${path}`
  const url = `https://raw.githubusercontent.com${route}`
  console.log(url)

  const response = await fetch(url)
  if (!response.ok) {
    return
  }
  const text = await response.text()
  console.log(text)
}
