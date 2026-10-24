interface Props {
  status: "pending" | "approved" | "rejected" | string;
  size?: "sm" | "md";
}

const MAP = {
  pending:  { label: "Pending review", classes: "bg-amber-100 text-amber-700" },
  approved: { label: "Live",           classes: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected",       classes: "bg-red-100 text-red-600" },
} as const;

export default function StatusBadge({ status, size = "sm" }: Props) {
  const cfg = MAP[status as keyof typeof MAP] ?? {
    label: status,
    classes: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${cfg.classes} ${
        size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1"
      }`}
    >
      {cfg.label}
    </span>
  );
}
