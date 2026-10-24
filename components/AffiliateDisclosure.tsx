interface Props {
  className?: string;
}

export default function AffiliateDisclosure({ className }: Props) {
  return (
    <p className={`text-xs text-gray-500 italic ${className ?? ""}`}>
      As an Amazon Associate we earn from qualifying purchases. Some links on this
      page are affiliate links — if you buy something after clicking, we may receive
      a small commission at no extra cost to you.
    </p>
  );
}
