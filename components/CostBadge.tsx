interface Props {
  isFree: boolean;
  cost?: string | null;
  size?: "sm" | "md";
}

export default function CostBadge({ isFree, cost, size = "sm" }: Props) {
  const px = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";

  if (isFree) {
    return (
      <span className={`inline-block font-medium rounded-full bg-brand-green text-white ${px}`}>
        Free
      </span>
    );
  }

  if (cost) {
    return (
      <span className={`inline-block font-medium rounded-full bg-amber-100 text-amber-800 ${px}`}>
        {cost}
      </span>
    );
  }

  return null;
}
