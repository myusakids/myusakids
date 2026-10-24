import { headers } from "next/headers";
import {
  type StateConfig,
  STATE_HEADER,
  getStateBySlug,
  resolveStateFromHost,
} from "@/lib/state-config";

export function getStateConfig(): StateConfig {
  const h = headers();
  const slug = h.get(STATE_HEADER);
  if (slug) {
    const match = getStateBySlug(slug);
    if (match) return match;
  }
  return resolveStateFromHost(h.get("host"));
}
