import { AlertCircle, RefreshCw } from "lucide-react";

export default function MaintenanceErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
      <h2 className="text-lg font-semibold text-red-900">Unable to load maintenance data</h2>
      <p className="mt-2 max-w-md text-sm text-red-700">{message || "A network error occurred. Please check your connection and try again."}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      )}
    </div>
  );
}
