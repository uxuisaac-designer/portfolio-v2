/* Shared by the server render and the client tick, so both produce the
   same string from the same instant.

   Intl resolves Europe/London itself, which is the whole point: BST and
   GMT switch on their own and no offset is written down anywhere. */

const TIME_ZONE = "Europe/London";

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const hourFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});

export type Mood = "asleep" | "awake" | "resting";

export type LondonTime = {
  clock: string;
  mood: Mood;
};

/* "5:30am" — no leading zero, no space, lowercase. ICU spells the day
   period differently across versions ("AM", "a.m."), so it is stripped
   back to letters rather than trusted. */
function formatClock(date: Date): string {
  const parts = clockFormat.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";

  const period = part("dayPeriod").toLowerCase().replace(/[^a-z]/g, "");

  return `${part("hour")}:${part("minute")}${period}`;
}

function moodFor(hour: number): Mood {
  if (hour >= 23 || hour < 7) return "asleep";
  if (hour < 18) return "awake";
  return "resting";
}

export function londonTime(date: Date): LondonTime {
  return {
    clock: formatClock(date),
    mood: moodFor(Number(hourFormat.format(date))),
  };
}
