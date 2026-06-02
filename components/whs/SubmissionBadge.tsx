interface Props {
  status: string | null;
  className?: string;
}

const config: Record<string, { label: string; cls: string }> = {
  signed:    { label: "Signed",    cls: "bg-green-100 text-green-800 border-green-200" },
  submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-800 border-blue-200"   },
  draft:     { label: "Draft",     cls: "bg-gray-100 text-gray-600 border-gray-200"   },
};

export function SubmissionBadge({ status, className = "" }: Props) {
  const cfg = config[status ?? ""] ?? { label: "Pending", cls: "bg-amber-100 text-amber-700 border-amber-200" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.cls} ${className}`}>
      {cfg.label}
    </span>
  );
}
