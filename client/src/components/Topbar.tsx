import { Circles } from './Circles'

export function Topbar() {
  return (
    <div className="bg-neutral-950 h-14 flex flex-row p-1 border-b border-neutral-800">
      <div className="mx-1 aspect-square hover:bg-neutral-800 rounded-full cursor-pointer">
        <></>
      </div>
      <Logo />
      {/* <div className="flex-1 bg-neutral-600 rounded-full" /> */}
      <div className="flex-1" />
      <Circles />
    </div>
  )
}

function Logo() {
  return (
    <div className="w-48 flex flex-row">
      <div className="px-2" />
      <div className="m-1 flex-1 cursor-pointer">
        {/* <img src="nohonu.svg" /> */}
      </div>
      <div className="px-2" />
    </div>
  )
}
