export function SkeletonLine({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-surface-hover rounded-md h-4 ${className}`}
    />
  )
}

export function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-surface-hover rounded-lg ${className}`}
    />
  )
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Assistant message skeleton */}
      <div className="flex gap-3">
        <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1 max-w-xl">
          <SkeletonLine className="w-3/4" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-1/2" />
        </div>
      </div>
      {/* User message skeleton */}
      <div className="flex gap-3 justify-end">
        <div className="flex flex-col gap-2 max-w-sm items-end">
          <SkeletonLine className="w-48" />
          <SkeletonLine className="w-32" />
        </div>
        <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
      </div>
      {/* Assistant message skeleton */}
      <div className="flex gap-3">
        <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1 max-w-lg">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-5/6" />
          <SkeletonLine className="w-2/3" />
          <SkeletonLine className="w-3/4" />
        </div>
      </div>
    </div>
  )
}
