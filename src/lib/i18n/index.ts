import type { Locale, Messages } from "./types";
import { messages as en } from "./messages/en";
import { messages as es } from "./messages/es";
import { messages as fr } from "./messages/fr";
import { messages as it } from "./messages/it";

const catalogs: Record<Locale, Messages> = { en, es, fr, it };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs.en;
}

type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type MessageKey = NestedKeyOf<Messages>;

export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  const parts = key.split(".");
  let value: unknown = getMessages(locale);
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  if (typeof value !== "string") return key;
  if (!vars) return value;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
    value
  );
}
