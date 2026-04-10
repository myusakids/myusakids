"use client";

export interface FilterOption {
  label: string;
  value: string;
}

interface Props {
  options: FilterOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterPills({ options, selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === opt.value
              ? "bg-brand-green text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
