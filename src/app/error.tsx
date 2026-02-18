"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 text-6xl">⚠️</div>
      <h1 className="mb-2 text-xl font-bold">문제가 생겼어요</h1>
      <p className="mb-6 text-sm text-gray-500">
        일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        다시 시도
      </button>
    </main>
  );
}
