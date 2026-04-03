export function Circles() {
  return (
    <div className="flex flex-row">
      <Circle />
      <Circle />
    </div>
  )
}

function Circle() {
  return (
    <div className="flex m-2 flex-row">
      <div className="h-full aspect-square rounded-full bg-neutral-500 hover:bg-neutral-600 active:bg-neutral-700 cursor-pointer">
        <></>
      </div>
    </div>
  )
}
