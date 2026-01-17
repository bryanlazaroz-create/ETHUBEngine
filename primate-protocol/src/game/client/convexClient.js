import { ConvexHttpClient } from "convex/browser";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

export const createConvexClient = () => {
  if (!convexUrl) {
    return {
      client: null,
      status: "Convex not configured. Set VITE_CONVEX_URL.",
    };
  }

  return {
    client: new ConvexHttpClient(convexUrl),
    status: "Convex connected. Sign in to enable saves.",
  };
};

const formatError = (error) =>
  error instanceof Error ? error.message : "Unknown error";

export const loadProgress = async (client, slot) => {
  if (!client) {
    return { data: null, error: "Convex client unavailable." };
  }
  try {
    const data = await client.query("gameSaves:loadProgress", { slot });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: formatError(error) };
  }
};

export const saveProgress = async (client, slot, data) => {
  if (!client) {
    return { ok: false, error: "Convex client unavailable." };
  }
  try {
    await client.mutation("gameSaves:saveProgress", { slot, data });
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: formatError(error) };
  }
};

export const listSaves = async (client) => {
  if (!client) {
    return { data: [], error: "Convex client unavailable." };
  }
  try {
    const data = await client.query("gameSaves:listSaves");
    return { data, error: null };
  } catch (error) {
    return { data: [], error: formatError(error) };
  }
};

export const ensureProfile = async (client, displayName) => {
  if (!client) {
    return { ok: false, error: "Convex client unavailable." };
  }
  try {
    await client.mutation("gameProfiles:ensureProfile", { displayName });
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: formatError(error) };
  }
};

export const listTopScores = async (client) => {
  if (!client) {
    return { data: [], error: "Convex client unavailable." };
  }
  try {
    const data = await client.query("gameScores:listTopScores");
    return { data, error: null };
  } catch (error) {
    return { data: [], error: formatError(error) };
  }
};

export const submitScore = async (client, payload) => {
  if (!client) {
    return { ok: false, error: "Convex client unavailable." };
  }
  try {
    await client.mutation("gameScores:submitScore", payload);
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: formatError(error) };
  }
};
