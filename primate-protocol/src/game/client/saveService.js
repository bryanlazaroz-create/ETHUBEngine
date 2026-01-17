import { ConvexHttpClient } from "convex/browser";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const client = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export function hasConvex() {
  return Boolean(client);
}

export async function ensureProfile() {
  if (!client) {
    return null;
  }
  try {
    return await client.mutation("gameProfiles:upsertProfile", {});
  } catch (error) {
    console.warn("Convex profile unavailable.", error);
    return null;
  }
}

export async function loadProgress(slot) {
  if (!client) {
    return null;
  }
  try {
    return await client.query("gameSaves:loadProgress", { slot });
  } catch (error) {
    console.warn("Convex load failed.", error);
    return null;
  }
}

export async function saveProgress(slot, data) {
  if (!client) {
    return false;
  }
  try {
    await client.mutation("gameSaves:saveProgress", { slot, data });
    return true;
  } catch (error) {
    console.warn("Convex save failed.", error);
    return false;
  }
}

export async function listSaves() {
  if (!client) {
    return [];
  }
  try {
    return await client.query("gameSaves:listSaves", {});
  } catch (error) {
    console.warn("Convex list failed.", error);
    return [];
  }
}
