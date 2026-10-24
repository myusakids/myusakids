import type { AnchorHTMLAttributes, ReactNode } from "react";

const TAG = process.env.NEXT_PUBLIC_AMAZON_TAG;

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
}

function withAssociateTag(url: string): string {
  if (!TAG) return url;
  try {
    const u = new URL(url);
    if (!/(^|\.)amazon\.(com|co\.uk|ca|de|fr|es|it|co\.jp)$/i.test(u.hostname)) {
      return url;
    }
    u.searchParams.set("tag", TAG);
    return u.toString();
  } catch {
    return url;
  }
}

export default function AmazonLink({ href, children, rel, target, ...rest }: Props) {
  const trackedHref = withAssociateTag(href);
  return (
    <a
      href={trackedHref}
      target={target ?? "_blank"}
      rel={`${rel ?? ""} sponsored nofollow noopener`.trim()}
      {...rest}
    >
      {children}
    </a>
  );
}
