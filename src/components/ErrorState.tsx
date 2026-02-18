interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="text-sm text-gray-500">
        연결이 불안정해요. 잠시 후 다시 시도해주세요
      </p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
      >
        다시 시도
      </button>
    </div>
  );
}
