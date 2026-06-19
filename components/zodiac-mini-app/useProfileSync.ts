"use client";

import { useCallback, useEffect, useState } from "react";

import type { ZodiacProfileSyncPayload } from "@/lib/zodiac-profile-sync-types";
import {
  deleteRemoteProfileIfEnabled,
  fetchRemoteProfileIfEnabled,
  getProfileSyncClientStatus,
  pushRemoteProfileIfEnabled,
  type ProfileSyncClientResult,
  type ProfileSyncClientStatusResult,
} from "./profile-sync-client";

const initialStatus: ProfileSyncClientStatusResult = {
  status: "disabled",
  enabled: false,
  readEnabled: false,
  writeEnabled: false,
};

export function useProfileSync() {
  const [status, setStatus] = useState<ProfileSyncClientStatusResult>(initialStatus);

  useEffect(() => {
    let cancelled = false;

    getProfileSyncClientStatus().then((nextStatus) => {
      if (!cancelled) {
        setStatus(nextStatus);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchRemoteProfile = useCallback((): Promise<ProfileSyncClientResult> => {
    return fetchRemoteProfileIfEnabled();
  }, []);

  const pushRemoteProfile = useCallback((payload: ZodiacProfileSyncPayload): Promise<ProfileSyncClientResult> => {
    return pushRemoteProfileIfEnabled(payload);
  }, []);

  const deleteRemoteProfile = useCallback((): Promise<ProfileSyncClientResult> => {
    return deleteRemoteProfileIfEnabled();
  }, []);

  return {
    status,
    fetchRemoteProfile,
    pushRemoteProfile,
    deleteRemoteProfile,
  };
}
