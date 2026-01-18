import { ConvexHttpClient } from "convex/browser";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const client = convexUrl ? new ConvexHttpClient(convexUrl) : null;

/**
 * Check if Convex is configured for this client.
 * @returns {boolean} True when Convex URL is available.
 */
export function hasConvex() {
  return Boolean(client);
}

/**
 * Ensure the player profile exists in Convex.
 * @returns {Promise<string|null>} Profile id or null if unavailable.
 */
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

/**
 * Load save data from Convex.
 * @param {number} slot - Save slot.
 * @returns {Promise<null|{data:any}>} Save record or null.
 */
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

/**
 * Persist save data to Convex.
 * @param {number} slot - Save slot.
 * @param {any} data - Game state payload.
 * @returns {Promise<boolean>} True when saved successfully.
 */
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

/**
 * List save slots for the active player.
 * @returns {Promise<Array<{id:string,slot:number,updatedAt:number}>>} Saves list.
 */
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
