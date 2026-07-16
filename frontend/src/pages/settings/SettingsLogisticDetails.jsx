import { Plus } from "lucide-react";

export default function SettingsLogisticDetails() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Logistic Details</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            This is a list of logistics details that will be used for creating documents
          </p>
        </div>
        <button type="button" className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
          <Plus className="h-4 w-4" />
          Add Logistic Details
        </button>
      </div>
      <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-500 dark:border-slate-700">
        No logistic details added yet.
      </div>
    </div>
  );
}
