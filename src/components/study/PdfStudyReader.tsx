"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/useI18n";
import {
  applyThemePreference,
  getCurrentTheme,
  THEME_CHANGE_EVENT,
  type Theme,
} from "@/lib/theme";

type PdfDocument = Awaited<ReturnType<(typeof import("pdfjs-dist"))["getDocument"]>["promise"]>;

type Props = {
  pdfUrl: string;
  title: string;
  initialPage: number;
  onPageChange: (page: number) => void;
  children?: ReactNode;
  fullscreenActions?: ReactNode;
  settingsActions?: ReactNode;
};

type PdfPageProps = {
  document: PdfDocument;
  pageNumber: number;
  title: string;
  zoom: number;
  darkMode: boolean;
  trackingEnabled: boolean;
  onVisible: (page: number) => void;
};

function PdfPage({ document, pageNumber, title, zoom, darkMode, trackingEnabled, onVisible }: PdfPageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldRender(true);
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!trackingEnabled) return;
    const element = wrapperRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) onVisible(pageNumber);
      },
      { threshold: [0.3, 0.5, 0.7] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [onVisible, pageNumber, trackingEnabled]);

  useEffect(() => {
    if (!shouldRender) return;
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    let cancelled = false;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let renderTask: ReturnType<Awaited<ReturnType<PdfDocument["getPage"]>>["render"]> | null = null;

    async function render() {
      const pdfPage = await document.getPage(pageNumber);
      if (cancelled || !wrapper || !canvas) return;
      const baseViewport = pdfPage.getViewport({ scale: 1 });
      const availableWidth = Math.min(960, Math.max(280, wrapper.clientWidth));
      const cssScale = availableWidth / baseViewport.width;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const viewport = pdfPage.getViewport({ scale: cssScale * pixelRatio });
      const context = canvas.getContext("2d");
      if (!context) return;

      renderTask?.cancel();
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
      canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;
      renderTask = pdfPage.render({ canvas, canvasContext: context, viewport });
      try {
        await renderTask.promise;
      } catch (error) {
        if (!cancelled && !(error instanceof Error && error.name === "RenderingCancelledException")) throw error;
      }
    }

    void render();
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => void render(), 120);
    });
    resizeObserver.observe(wrapper);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      renderTask?.cancel();
    };
  }, [document, pageNumber, shouldRender]);

  return (
    <div
      ref={wrapperRef}
      id={`pdf-page-${pageNumber}`}
      data-pdf-page={pageNumber}
      className="mx-auto flex aspect-[210/297] scroll-mt-32 items-start justify-center"
      style={{ width: `${zoom}%`, maxWidth: `${9.6 * zoom}px` }}
    >
      {shouldRender ? (
        <canvas
          ref={canvasRef}
          aria-label={`${title}, página ${pageNumber}`}
          className={`pdf-page-canvas h-auto max-w-full bg-white shadow-sm ${darkMode ? "pdf-page-canvas-dark" : ""}`}
        />
      ) : null}
    </div>
  );
}

export function PdfStudyReader({ pdfUrl, title, initialPage, onPageChange, children, fullscreenActions, settingsActions }: Props) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLElement>(null);
  const initialPageRef = useRef(initialPage);
  const visiblePageRef = useRef(Math.max(1, initialPage));
  const [document, setDocument] = useState<PdfDocument | null>(null);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [zoom, setZoom] = useState(100);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    initialPageRef.current = initialPage;
  }, [initialPage]);

  useEffect(() => {
    const savedZoom = Number(localStorage.getItem("gsi-a2-reader-zoom"));
    const initialZoom = savedZoom >= 60 && savedZoom <= 180
      ? savedZoom
      : window.matchMedia("(max-width: 639px)").matches ? 110 : 100;
    const frame = requestAnimationFrame(() => {
      setZoom(initialZoom);
      setTheme(getCurrentTheme());
    });

    function handleThemeChange(event: Event) {
      setTheme((event as CustomEvent<Theme>).detail);
    }
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(window.document.fullscreenElement === containerRef.current);
    }
    window.document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => window.document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSettingsOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [settingsOpen]);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: ReturnType<(typeof import("pdfjs-dist"))["getDocument"]> | null = null;

    async function loadDocument() {
      try {
        setError(false);
        setTrackingEnabled(false);
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        loadingTask = pdfjs.getDocument(pdfUrl);
        const loadedDocument = await loadingTask.promise;
        if (cancelled) return;
        const savedPage = Math.min(Math.max(1, initialPageRef.current), loadedDocument.numPages);
        setDocument(loadedDocument);
        setPage(savedPage);

        requestAnimationFrame(() => requestAnimationFrame(() => {
          window.document.getElementById(`pdf-page-${savedPage}`)?.scrollIntoView({ block: "start" });
          setTrackingEnabled(true);
        }));
      } catch {
        if (!cancelled) setError(true);
      }
    }

    void loadDocument();
    return () => {
      cancelled = true;
      void loadingTask?.destroy();
    };
  }, [pdfUrl]);

  const handleVisiblePage = useCallback((visiblePage: number) => {
    if (visiblePageRef.current === visiblePage) return;
    visiblePageRef.current = visiblePage;
    setPage(visiblePage);
    onPageChange(visiblePage);
  }, [onPageChange]);

  async function toggleFullscreen() {
    const element = containerRef.current;
    if (!element) return;
    if (window.document.fullscreenElement === element) {
      await window.document.exitFullscreen();
      return;
    }
    if (element.requestFullscreen) {
      await element.requestFullscreen();
      return;
    }
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  function changeZoom(nextZoom: number) {
    const boundedZoom = Math.min(180, Math.max(60, nextZoom));
    setZoom(boundedZoom);
    localStorage.setItem("gsi-a2-reader-zoom", String(boundedZoom));
  }

  function toggleTheme() {
    applyThemePreference(theme === "dark" ? "light" : "dark");
  }

  const isDark = theme === "dark";

  return (
    <section ref={containerRef} data-reader-theme={theme} className="pdf-study-reader -mx-4 scroll-mt-4 overflow-x-auto rounded-xl border border-border bg-surface sm:mx-0" aria-label={t("study.reader")}>
      <div className="pdf-reader-toolbar sticky top-[72px] z-10 flex min-h-12 items-center justify-between gap-3 border-b border-border bg-surface/95 px-3 py-2 backdrop-blur sm:p-3">
        <span className="text-sm tabular-nums text-text-secondary">{document ? t("study.pageCount", { page, count: document.numPages }) : t("study.loading")}</span>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex items-center rounded-md border border-border bg-surface" aria-label={t("study.zoom")}>
            <button type="button" className="min-h-8 px-3 text-sm text-text-primary disabled:opacity-40" disabled={zoom <= 60} aria-label={t("study.zoomOut")} onClick={() => changeZoom(zoom - 10)}>−</button>
            <span className="min-w-12 text-center text-xs tabular-nums text-text-secondary">{zoom}%</span>
            <button type="button" className="min-h-8 px-3 text-sm text-text-primary disabled:opacity-40" disabled={zoom >= 180} aria-label={t("study.zoomIn")} onClick={() => changeZoom(zoom + 10)}>+</button>
          </div>
          <Button variant="subtle" size="sm" onClick={() => void toggleFullscreen()}>{isFullscreen ? t("study.exitFullscreen") : t("study.fullscreen")}</Button>
          <Button variant="subtle" size="sm" onClick={() => setSettingsOpen(true)}>{t("study.readerSettings")}</Button>
        </div>
        <div className="flex items-center gap-1 sm:hidden">
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-surface-muted" aria-label={isFullscreen ? t("study.exitFullscreen") : t("study.fullscreen")} onClick={() => void toggleFullscreen()}>
            <FullscreenIcon active={isFullscreen} />
          </button>
          <button type="button" className="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-sm font-semibold text-text-primary hover:bg-surface-muted" aria-label={t("study.readerSettings")} onClick={() => setSettingsOpen(true)}>Aa</button>
        </div>
      </div>

      {error ? (
        <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <p className="text-sm text-text-secondary">{t("study.readerError")}</p>
            <Button href={pdfUrl} variant="secondary" className="mt-4">{t("study.openPdf")}</Button>
          </div>
        </div>
      ) : document ? (
        <div className="pdf-reader-pages space-y-4 bg-surface-muted p-3 sm:p-4">
          {Array.from({ length: document.numPages }, (_, index) => (
            <PdfPage key={index + 1} document={document} pageNumber={index + 1} title={title} zoom={zoom} darkMode={isDark} trackingEnabled={trackingEnabled} onVisible={handleVisiblePage} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-text-muted">{t("study.loading")}</div>
      )}
      {children}
      {isFullscreen && document && page === document.numPages && fullscreenActions ? (
        <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col gap-3 border-t border-border bg-surface/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm font-semibold text-text-primary">{t("study.finishTitle")}</p>
          {fullscreenActions}
        </div>
      ) : null}
      {settingsOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="reader-settings-title">
          <button type="button" className="absolute inset-0 bg-overlay" aria-label={t("study.closeSettings")} onClick={() => setSettingsOpen(false)} />
          <div className="relative z-10 w-full rounded-t-2xl border border-border bg-surface p-5 shadow-lg sm:max-w-md sm:rounded-xl">
            <div className="flex items-center justify-between gap-4">
              <h2 id="reader-settings-title" className="text-lg font-semibold text-text-primary">{t("study.readerSettings")}</h2>
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xl text-text-secondary hover:bg-surface-muted" aria-label={t("study.closeSettings")} onClick={() => setSettingsOpen(false)}>×</button>
            </div>

            <div className="mt-5 border-t border-border-subtle pt-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-primary">{t("study.textSize")}</p>
                  <p className="mt-1 text-xs text-text-muted">{t("study.textSizeHelp")}</p>
                </div>
                <div className="flex shrink-0 items-center rounded-lg border border-border bg-background">
                  <button type="button" className="h-11 w-11 text-lg text-text-primary disabled:opacity-40" disabled={zoom <= 60} aria-label={t("study.zoomOut")} onClick={() => changeZoom(zoom - 10)}>−</button>
                  <span className="min-w-14 text-center text-sm tabular-nums text-text-primary">{zoom}%</span>
                  <button type="button" className="h-11 w-11 text-lg text-text-primary disabled:opacity-40" disabled={zoom >= 180} aria-label={t("study.zoomIn")} onClick={() => changeZoom(zoom + 10)}>+</button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-border-subtle pt-5">
              <div>
                <p className="text-sm font-medium text-text-primary">{t("study.darkReading")}</p>
                <p className="mt-1 text-xs text-text-muted">{t("study.darkReadingHelp")}</p>
              </div>
              <button type="button" role="switch" aria-checked={isDark} className={`relative h-7 w-12 shrink-0 rounded-full transition ${isDark ? "bg-accent" : "bg-surface-muted"}`} onClick={toggleTheme}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${isDark ? "left-6" : "left-1"}`} />
              </button>
            </div>

            {settingsActions ? <div className="mt-5 border-t border-border-subtle pt-5">{settingsActions}</div> : null}
            <a className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-text-primary" href={pdfUrl} target="_blank" rel="noreferrer">{t("study.openOriginalPdf")}</a>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FullscreenIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      {active ? (
        <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
      ) : (
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      )}
    </svg>
  );
}
