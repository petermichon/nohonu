export function Topbar({}: {}) {
  return (
    <div className="bg-neutral-950 h-16 flex flex-row p-2">
      <div className="mx-1 aspect-square hover:bg-neutral-800 rounded-full cursor-pointer">
        <></>
      </div>
      <Logo />
      <div className="flex-1 bg-neutral-600 rounded-full">
        <></>
      </div>
      <div className="flex-1">
        <></>
      </div>
      <Circle />
      <Circle />
      <Circle />
      <Circle />
      <Circle />
    </div>
  )
}

function Circle() {
  return (
    <div className="flex m-2 flex-row">
      <div className="h-full aspect-square rounded-full bg-neutral-500 hover:bg-neutral-800 active:bg-neutral-700 cursor-pointer">
        <></>
      </div>
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
