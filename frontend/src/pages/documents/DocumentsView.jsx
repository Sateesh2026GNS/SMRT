import { useCallback } from "react";

import ResourcePage from "../../components/common/ResourcePage";
import { getDocuments, createDocument } from "../../api/documentsApi";

export default function DocumentsView({ title, subtitle, docType }) {
  const fetcher = useCallback(() => getDocuments(docType || null), [docType]);

  return (
    <ResourcePage
      title={title}
      subtitle={subtitle}
      fetcher={fetcher}
      createFn={createDocument}
      createLabel="+ Add Document"
      emptyTitle="No documents"
      emptyDescription="Attach documents and they will be listed here."
      searchKeys={["title", "file_name", "description"]}
      columns={[
        { key: "title", label: "Title" },
        { key: "file_name", label: "File" },
        { key: "reference_type", label: "Reference" },
        { key: "uploaded_by", label: "Uploaded By" },
        { key: "description", label: "Description" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true, full: true },
        { name: "doc_type", label: "Document Type", default: docType || "general" },
        { name: "file_name", label: "File Name" },
        { name: "file_path", label: "File Path / URL", full: true },
        { name: "uploaded_by", label: "Uploaded By" },
        { name: "description", label: "Description", type: "textarea", full: true },
      ]}
    />
  );
}
