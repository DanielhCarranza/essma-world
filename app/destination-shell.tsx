"use client";

import { Component, type ComponentType, type ReactNode, useEffect, useState } from "react";

import IntroVideos from "./intro-videos";
import {
  getDestination,
  type DestinationAppProps,
  type DestinationId,
} from "./lib/destinations";
import type { MiniGameContext, MiniGameResult } from "./mini-game";

type DestinationShellProps = {
  destinationId: DestinationId;
  context: MiniGameContext;
  onFinish: (result: MiniGameResult) => void;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; App: ComponentType<DestinationAppProps> }
  | { status: "failed"; reason: "load-error" | "unsupported" | "runtime-error" };

function canvasSupportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

class DestinationErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default function DestinationShell({
  destinationId,
  context,
  onFinish,
}: DestinationShellProps) {
  const destination = getDestination(destinationId);
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (destinationId === "essma-kart" && !canvasSupportsWebGL()) {
          const error = new Error("unsupported");
          error.name = "UnsupportedWebGL";
          throw error;
        }
        return destination.load();
      })
      .then((mod) => {
        if (cancelled) return;
        setLoad({ status: "ready", App: mod.default });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoad({
          status: "failed",
          reason:
            error instanceof Error && error.name === "UnsupportedWebGL"
              ? "unsupported"
              : "load-error",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [destination, destinationId]);

  function exit(result: MiniGameResult) {
    onFinish(result);
  }

  const name = destination.locale["es-MX"].name;

  if (showIntro) {
    return (
      <IntroVideos
        introId={destinationId}
        muted={!context.settings.music}
        onDone={() => setShowIntro(false)}
      />
    );
  }

  return (
    <section
      className="destination-shell"
      aria-label={name}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: "#1a0f0a",
      }}
    >
      <button
        type="button"
        className="destination-salir"
        onClick={() => exit({ status: "cancelled" })}
        aria-label={`Salir de ${name}`}
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 1000,
          minWidth: 44,
          minHeight: 44,
          padding: "8px 14px",
          border: "3px solid #603421",
          borderRadius: 999,
          background: "#fff7de",
          color: "#3f251d",
          fontWeight: 950,
          cursor: "pointer",
        }}
      >
        Salir
      </button>

      {load.status === "loading" && (
        <p
          role="status"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#fff7de",
            fontWeight: 800,
          }}
        >
          Cargando {name}…
        </p>
      )}

      {load.status === "failed" && (
        <div
          role="alert"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 24,
            color: "#fff7de",
            textAlign: "center",
          }}
        >
          <p>
            {load.reason === "unsupported"
              ? `No se pudo abrir ${name} en este aparato.`
              : `No se pudo abrir ${name}.`}
          </p>
          <button
            type="button"
            onClick={() =>
              exit({
                status: "failed",
                reason: load.reason,
              })
            }
            style={{
              marginTop: 16,
              minHeight: 44,
              padding: "8px 16px",
              borderRadius: 999,
              border: "3px solid #ffe9bd",
              background: "#d75b45",
              color: "white",
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            Volver al mapa
          </button>
        </div>
      )}

      {load.status === "ready" && (
        <DestinationErrorBoundary
          onError={() => setLoad({ status: "failed", reason: "runtime-error" })}
        >
          <load.App
            onExit={() => exit({ status: "cancelled" })}
            onUnsupported={() =>
              setLoad({ status: "failed", reason: "unsupported" })
            }
            context={context}
          />
        </DestinationErrorBoundary>
      )}
    </section>
  );
}
