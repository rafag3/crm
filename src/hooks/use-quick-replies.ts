"use client";

import { useState, useEffect, useCallback } from "react";

export interface QuickReply {
  id: string;
  shortcut: string;
  title: string;
  content: string;
}

let cache: QuickReply[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches account quick replies with a short in-memory cache so every
 * composer mount doesn't hit the network.
 */
export function useQuickReplies() {
  const [replies, setReplies] = useState<QuickReply[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  const load = useCallback(async () => {
    // Serve from cache if fresh
    if (cache && Date.now() - cacheTimestamp < CACHE_TTL) {
      setReplies(cache);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/quick-replies", { cache: "no-store" });
      const json = await res.json();
      const data: QuickReply[] = json.quickReplies ?? [];
      cache = data;
      cacheTimestamp = Date.now();
      setReplies(data);
    } catch {
      // ignore — empty list gracefully degrades
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Call after a write (create/update/delete) to bust the cache. */
  const invalidate = useCallback(() => {
    cache = null;
    cacheTimestamp = 0;
    void load();
  }, [load]);

  return { replies, loading, invalidate };
}
