function renderInline(text, keyPrefix) {
  const parts = [];
  const pattern = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("[")) {
      const [, label, href] = token.match(/^\[([^\]]+)\]\((.+)\)$/);
      const text = /^https?:\/\//.test(label) ? label.replace(/^https?:\/\/(www\.)?/, "") : label;
      parts.push(<a key={key} href={href} target="_blank" rel="noreferrer" className="break-all font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">{text}</a>);
    } else if (token.startsWith("**")) {
      parts.push(<strong key={key} className="font-semibold text-text">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      parts.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      parts.push(<code key={key} className="rounded bg-primary/10 px-1 py-0.5 font-mono text-[0.85em] text-primary">{token.slice(1, -1)}</code>);
    } else if (token.startsWith("http")) {
      parts.push(<a key={key} href={token} target="_blank" rel="noreferrer" className="break-all font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">{token.replace(/^https?:\/\/(www\.)?/, "")}</a>);
    } else {
      parts.push(<a key={key} href={`mailto:${token}`} className="break-all font-medium text-primary underline decoration-primary/30 underline-offset-2">{token}</a>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function RichText({ text }) {
  const blocks = [];
  let list = null;
  String(text).split("\n").forEach((raw) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)/);
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)/);
    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        list = { type, items: [] };
        blocks.push(list);
      }
      list.items.push(bullet ? bullet[1] : numbered[2]);
      return;
    }
    list = null;
    if (line.trim() && !/^\|?[\s:-]+\|[\s|:-]*$/.test(line)) blocks.push({ type: "p", text: line.replace(/^#+\s*/, "") });
  });

  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        if (b.type === "p") return <p key={i}>{renderInline(b.text, `p${i}`)}</p>;
        const Tag = b.type;
        return (
          <Tag key={i} className={`space-y-1 pl-4 ${b.type === "ul" ? "list-disc" : "list-decimal"} marker:text-primary`}>
            {b.items.map((item, j) => <li key={j} className="pl-0.5">{renderInline(item, `l${i}-${j}`)}</li>)}
          </Tag>
        );
      })}
    </div>
  );
}
