import { RefreshCw, AlertTriangle } from "lucide-react";

export default function AnalyticsErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <AlertTriangle className="mb-3 h-10 w-10 text-red-500" />
      <h3 className="text-lg font-semibold text-red-800">Failed to load analytics</h3>
      <p className="mt-2 max-w-md text-sm text-red-600">{message || "Network error — please try again."}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      )}
    </div>
  );
}
