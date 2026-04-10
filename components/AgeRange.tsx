interface Props {
  ageMin: number | null;
  ageMax: number | null;
  className?: string;
}

export default function AgeRange({ ageMin, ageMax, className = "" }: Props) {
  if (ageMin === null && ageMax === null) {
    return <span className={className}>All ages</span>;
  }
  if (ageMin !== null && ageMax !== null) {
    return <span className={className}>Ages {ageMin}–{ageMax}</span>;
  }
  if (ageMin !== null) {
    return <span className={className}>Ages {ageMin}+</span>;
  }
  return <span className={className}>Up to age {ageMax}</span>;
}
