export default function Skeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
      <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      <div className="flex gap-3">
        <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
