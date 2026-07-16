/** Lightweight markdown renderer for AI messages (bold, code, lists). */

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function AiMessageContent({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];

  lines.forEach((line, i) => {
    let html = escapeHtml(line);
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">$1</code>');

    if (/^[-*]\s/.test(line)) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-sm" dangerouslySetInnerHTML={{ __html: html.replace(/^[-*]\s/, "") }} />
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
      );
    }
  });

  const hasList = lines.some((l) => /^[-*]\s/.test(l));
  if (hasList) {
    return <ul className="space-y-1">{elements}</ul>;
  }
  return <div className="space-y-1">{elements}</div>;
}
