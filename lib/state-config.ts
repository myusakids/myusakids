export interface StateConfig {
  slug: string;
  abbr: string;
  name: string;
  domain: string;
  siteName: string;
}

const STATES: Record<string, StateConfig> = {
  ct: {
    slug: "ct",
    abbr: "CT",
    name: "Connecticut",
    domain: "myconnecticutkids.com",
    siteName: "MyConnecticutKids",
  },
  ny: {
    slug: "ny",
    abbr: "NY",
    name: "New York",
    domain: "mynewyorkkids.com",
    siteName: "MyNewYorkKids",
  },
};

const BY_HOST: Record<string, StateConfig> = Object.fromEntries(
  Object.values(STATES).map((s) => [s.domain, s])
);

const DEFAULT_STATE: StateConfig = STATES.ct;

export function resolveStateFromHost(
  host: string | null | undefined
): StateConfig {
  if (!host) return DEFAULT_STATE;

  const hostname = host.split(":")[0].toLowerCase().replace(/^www\./, "");

  if (BY_HOST[hostname]) return BY_HOST[hostname];

  const envDefault = process.env.NEXT_PUBLIC_DEFAULT_STATE;
  if (envDefault && STATES[envDefault.toLowerCase()]) {
    return STATES[envDefault.toLowerCase()];
  }

  return DEFAULT_STATE;
}

export function getStateBySlug(slug: string): StateConfig | undefined {
  return STATES[slug.toLowerCase()];
}

export function listStates(): StateConfig[] {
  return Object.values(STATES);
}

export const STATE_HEADER = "x-mck-state";
