export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Prev
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </div>
  );
}
