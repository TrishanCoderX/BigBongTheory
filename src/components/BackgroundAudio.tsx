"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "bbt_audio_on";
const TRACK_SRC = "/audio/theme.mp3";

function getSnapshot() {
  // Defaults to on for a first-time visitor (no saved preference yet) —
  // once they explicitly toggle it, their choice is remembered from then on.
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === null ? true : saved === "1";
}

function getServerSnapshot() {
  return false;
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  // Reflects the user's (or default) preference, not necessarily real
  // playback — browsers block audio-with-sound from autoplaying without a
  // fresh gesture on this page load, so actual playback waits for either
  // the click below or the first-interaction effect underneath it.
  const on = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Browsers won't let audio-with-sound autoplay on page load, full stop —
  // there's no code-level way around that. This is the closest honest
  // approximation of "on by default": the moment the visitor does anything
  // at all on the page, if the preference is on and nothing's playing yet,
  // start it right then rather than making them specifically find and click
  // the sound button. Only "click", "keydown", and "touchend" actually count
  // as a real user-activation gesture in most browsers' autoplay policy —
  // "pointerdown"/"touchstart" (fires before the gesture completes) and
  // "scroll" (not a deliberate activation at all) don't reliably unlock
  // audio in real browsers, even though they can appear to work under
  // automated/headless testing, which often relaxes this restriction.
  useEffect(() => {
    if (!on) return;
    const audio = audioRef.current;
    if (!audio) return;

    const tryStart = () => {
      if (!audio.paused) return;
      audio.volume = 0.35;
      audio.play().catch(() => {});
    };

    const events: (keyof WindowEventMap)[] = ["click", "keydown", "touchend"];
    events.forEach((e) => window.addEventListener(e, tryStart, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, tryStart));
  }, [on]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (on) {
      audio.pause();
      localStorage.setItem(STORAGE_KEY, "0");
    } else {
      audio.volume = 0.35;
      audio.play().catch(() => {});
      localStorage.setItem(STORAGE_KEY, "1");
    }
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  };

  return (
    <>
      <audio ref={audioRef} src={TRACK_SRC} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={on ? "Mute background music" : "Play background music"}
        aria-pressed={on}
        data-mag="1"
        className="fixed bottom-5 left-5 z-[5000] flex items-center gap-2 px-3.5 py-2.5 bg-background/80 backdrop-blur border border-cream/20 font-mono text-[10px] tracking-[0.16em] uppercase text-cream cursor-pointer transition-colors hover:border-lime"
      >
        <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-0.5 bg-lime"
              style={{
                height: on ? "100%" : "30%",
                animation: on ? `bbt-pulse ${0.6 + i * 0.2}s ease-in-out infinite alternate` : "none",
              }}
            />
          ))}
        </span>
        {on ? "SOUND ON" : "SOUND OFF"}
      </button>
    </>
  );
}
