"use client";

import { useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "bbt_audio_on";
const TRACK_SRC = "/audio/theme.mp3";

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "1";
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
  // Reflects the user's saved preference, not necessarily real playback —
  // browsers block audio-with-sound from autoplaying without a fresh
  // gesture on this page load, so actual playback still waits for the
  // click below regardless of what was saved last time.
  const on = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
