import { NavSection } from './NavSection'

export function Leftbar() {
  return (
    <div className="h-full shrink-0 w-60 bg-neutral-950 flex flex-col overflow-hidden border-r border-neutral-800">
      {/* <div className="h-9 rounded-md mx-2 outline outline-1 outline-neutral-800" /> */}
      <div className="h-9 rounded-md mx-2 shrink-0" />
      <NavSection />
      <div className="flex-1" />
      <div className="h-8 rounded-full bg-neutral-700 mx-5 my-4 shrink-0"></div>
      {/* <div className="h-4" /> */}
    </div>
  )
}
