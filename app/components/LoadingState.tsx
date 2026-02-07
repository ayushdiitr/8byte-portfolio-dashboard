export default function Loading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900 dark:border-gray-800 dark:border-t-gray-100"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading portfolio data...</p>
      </div>
    </div>
  );
}
