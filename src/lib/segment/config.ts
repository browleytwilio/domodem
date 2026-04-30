// src/lib/segment/config.ts
const writeKey = process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || "";
export const SEGMENT_WRITE_KEY = writeKey;
export const analyticsEnabled = writeKey.length > 0;
