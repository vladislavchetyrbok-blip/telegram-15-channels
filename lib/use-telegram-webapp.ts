"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TelegramColorScheme = "light" | "dark";
export type TelegramHapticImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface TelegramBackButton {
  show?: () => void;
  hide?: () => void;
  onClick?: (callback: () => void) => void;
  offClick?: (callback: () => void) => void;
}

export interface TelegramHapticFeedback {
  impactOccurred?: (style: TelegramHapticImpactStyle) => void;
  selectionChanged?: () => void;
}

export interface TelegramWebApp {
  ready?: () => void;
  expand?: () => void;
  BackButton?: TelegramBackButton;
  HapticFeedback?: TelegramHapticFeedback;
  themeParams?: TelegramThemeParams;
  colorScheme?: TelegramColorScheme;
  viewportHeight?: number;
  viewportStableHeight?: number;
  isExpanded?: boolean;
  platform?: string;
  onEvent?: (event: "themeChanged" | "viewportChanged", callback: () => void) => void;
  offEvent?: (event: "themeChanged" | "viewportChanged", callback: () => void) => void;
}

export interface TelegramWebAppState {
  webApp: TelegramWebApp | null;
  isTelegramWebApp: boolean;
  isReady: boolean;
  platform: string | null;
  colorScheme: TelegramColorScheme | null;
  themeParams: TelegramThemeParams;
  viewportHeight: number | null;
  viewportStableHeight: number | null;
  isExpanded: boolean | null;
  impactOccurred: (style?: TelegramHapticImpactStyle) => boolean;
  selectionChanged: () => boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const defaultState: Omit<TelegramWebAppState, "impactOccurred" | "selectionChanged"> = {
  webApp: null,
  isTelegramWebApp: false,
  isReady: false,
  platform: null,
  colorScheme: null,
  themeParams: {},
  viewportHeight: null,
  viewportStableHeight: null,
  isExpanded: null,
};

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function useTelegramWebApp(): TelegramWebAppState {
  const webAppRef = useRef<TelegramWebApp | null>(null);
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    const webApp = getTelegramWebApp();
    webAppRef.current = webApp;

    if (!webApp) {
      setState(defaultState);
      return;
    }

    safeCall(() => webApp.ready?.());
    safeCall(() => webApp.expand?.());

    const refreshState = () => {
      setState({
        webApp,
        isTelegramWebApp: true,
        isReady: true,
        platform: webApp.platform ?? null,
        colorScheme: webApp.colorScheme ?? null,
        themeParams: webApp.themeParams ?? {},
        viewportHeight: typeof webApp.viewportHeight === "number" ? webApp.viewportHeight : null,
        viewportStableHeight: typeof webApp.viewportStableHeight === "number" ? webApp.viewportStableHeight : null,
        isExpanded: typeof webApp.isExpanded === "boolean" ? webApp.isExpanded : null,
      });
    };

    refreshState();
    webApp.onEvent?.("themeChanged", refreshState);
    webApp.onEvent?.("viewportChanged", refreshState);

    return () => {
      webApp.offEvent?.("themeChanged", refreshState);
      webApp.offEvent?.("viewportChanged", refreshState);
    };
  }, []);

  const impactOccurred = useCallback((style: TelegramHapticImpactStyle = "light") => {
    const impact = webAppRef.current?.HapticFeedback?.impactOccurred;
    if (!impact) return false;
    return safeCall(() => impact(style));
  }, []);

  const selectionChanged = useCallback(() => {
    const selection = webAppRef.current?.HapticFeedback?.selectionChanged;
    if (!selection) return false;
    return safeCall(() => selection());
  }, []);

  return {
    ...state,
    impactOccurred,
    selectionChanged,
  };
}

export function useTelegramBackButton(webApp: TelegramWebApp | null, visible: boolean, onBack: () => void) {
  useEffect(() => {
    const backButton = webApp?.BackButton;
    if (!backButton) return;

    if (!visible) {
      safeCall(() => backButton.hide?.());
      return;
    }

    safeCall(() => backButton.show?.());
    safeCall(() => backButton.onClick?.(onBack));

    return () => {
      safeCall(() => backButton.offClick?.(onBack));
      safeCall(() => backButton.hide?.());
    };
  }, [onBack, visible, webApp]);
}

function safeCall(callback: () => void): boolean {
  try {
    callback();
    return true;
  } catch {
    return false;
  }
}
