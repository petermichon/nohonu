export function App() {
  return (
    <div className="w-screen h-screen m-0 flex flex-col text-white">
      <div className="bg-neutral-950 h-14 flex flex-row">
        <div className="w-60"></div>
        <div className="flex-1"></div>
        <div className="m-2 flex flex-row hover:bg-neutral-800 rounded-xl cursor-pointer active:bg-neutral-700 place-items-center">
          <div className="px-4">User</div>
          <div className="h-full m-2 aspect-square rounded-full bg-neutral-600"></div>
        </div>
      </div>
      <div className="h-full flex flex-row">
        <div className="w-72 bg-neutral-950 flex flex-col">
          <div className="h-12 bg-neutral-900  cursor-pointer hover:bg-neutral-800 active:bg-neutral-700 rounded-xl">
            <></>
          </div>
        </div>
        <div className="w-full bg-neutral-900">
          <></>
        </div>
      </div>
    </div>
  )
}
