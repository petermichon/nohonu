export function ListHeader() {
  return (
    <div className="h-12 py-1 flex flex-col mr-4">
      <div className="px-1.5 h-10 shrink-0 flex flex-row border-b border-neutral-800">
        <div className="aspect-square flex items-center justify-center">
          <div className="p-3 rounded-full aspect-square cursor-pointer hover:bg-neutral-700">
            <div className="rounded-sm p-[7px] aspect-square bg-neutral-600" />
          </div>
        </div>
        <div className="aspect-square flex"></div>
        <div className="flex items-center flex-1 rounded-lg my-1 px-3">
          <>Name</>
        </div>
        <div className="flex items-center flex-1 rounded-lg my-1 px-3">
          <>Domain</>
        </div>
        <div className="flex items-center flex-1 rounded-lg my-1 px-3">
          <>-</>
        </div>
        <div className="flex-1">
          <></>
        </div>
      </div>
    </div>
  )
}
