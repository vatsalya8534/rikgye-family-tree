import { useSidebar } from "./sidebar"

export function Logo() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <div className="flex items-center gap-2 px-2 py-2">
      {/* Icon always visible */}
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
        A
      </div>

      {/* Hide text when collapsed */}
      {!collapsed && (
        <span className="text-sm font-semibold whitespace-nowrap">
          Acme Inc
        </span>
      )}
    </div>
  )
}