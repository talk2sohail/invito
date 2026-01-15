import { Skeleton } from "@/components/ui/skeleton";

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
      <Skeleton className="aspect-square rounded-3xl" />
      <Skeleton className="aspect-square rounded-3xl" />
    </div>
  );
}

export function CirclesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-24 w-full rounded-3xl" />
      <Skeleton className="h-24 w-full rounded-3xl" />
    </div>
  );
}

export function InvitesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-24 w-full rounded-3xl" />
      <Skeleton className="h-24 w-full rounded-3xl" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="mb-20 flex flex-col sm:flex-row items-center justify-between gap-8 animate-pulse">
      <div className="w-full max-w-lg space-y-4">
        <Skeleton className="h-20 w-3/4" />
        <Skeleton className="h-20 w-1/2" />
        <Skeleton className="h-6 w-full" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-12 w-40 rounded-full" />
          <Skeleton className="h-14 w-40 rounded-2xl" />
        </div>
      </div>
      {/* Stats Skeleton is usually embedded here on mobile/desktop layout in the original page */}
      <StatsSkeleton />
    </div>
  );
}
