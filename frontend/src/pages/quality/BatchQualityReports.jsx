import ResourcePage from "../../components/common/ResourcePage";
import { getBatchReports, createBatchReport } from "../../api/qualityApi";

export default function BatchQualityReports() {
  return (
    <ResourcePage
      title="Batch Quality Reports"
      subtitle="Summarise pass/fail counts per production batch."
      fetcher={getBatchReports}
      createFn={createBatchReport}
      createLabel="+ New Report"
      emptyTitle="No batch reports"
      emptyDescription="Create a batch quality report to summarise results."
      searchKeys={["summary"]}
      columns={[
        { key: "batch_id", label: "Batch ID" },
        { key: "report_date", label: "Report Date" },
        { key: "pass_count", label: "Pass" },
        { key: "fail_count", label: "Fail" },
        {
          key: "yield",
          label: "Yield %",
          render: (r) => {
            const total = (r.pass_count || 0) + (r.fail_count || 0);
            return total ? `${Math.round((r.pass_count / total) * 100)}%` : "—";
          },
        },
        { key: "summary", label: "Summary" },
      ]}
      fields={[
        { name: "batch_id", label: "Batch ID", type: "number", required: true },
        { name: "report_date", label: "Report Date", type: "date", required: true },
        { name: "pass_count", label: "Pass Count", type: "number", default: 0 },
        { name: "fail_count", label: "Fail Count", type: "number", default: 0 },
        { name: "summary", label: "Summary", type: "textarea", full: true },
      ]}
    />
  );
}
