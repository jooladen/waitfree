import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 text-6xl">🔍</div>
      <h1 className="mb-2 text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="mb-6 text-sm text-gray-500">
        요청하신 페이지가 존재하지 않거나 이동되었어요.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        메인으로 돌아가기
      </Link>
    </main>
  );
}
