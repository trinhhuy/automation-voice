import "dotenv/config";

export function getEnv(key: string, defaultValue?: string) {
  const v = process.env[key];
  if (v && v.length > 0) return v;
  if (defaultValue !== undefined) return defaultValue;
  throw new Error(`Missing env var: ${key}`);
}
