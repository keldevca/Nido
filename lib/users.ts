// Single source of truth for member names (client + server safe).
// Add or remove members by editing your `.env`:
//   NEXT_PUBLIC_USER1_NAME=Alice
//   NEXT_PUBLIC_USER2_NAME=Bob
//   NEXT_PUBLIC_USER3_NAME=Charlie   (optional)
//
// Names with no value are filtered out, so the UI auto-adapts to 1, 2 or 3 members.

export const MEMBERS: string[] = [
  process.env.NEXT_PUBLIC_USER1_NAME,
  process.env.NEXT_PUBLIC_USER2_NAME,
  process.env.NEXT_PUBLIC_USER3_NAME,
].filter((n): n is string => typeof n === "string" && n.trim().length > 0);
