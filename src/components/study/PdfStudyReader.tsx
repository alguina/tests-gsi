"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/useI18n";

type PdfDocument = Awaited<ReturnType<(typeof import("pdfjs-dist"))["getDocument"]>["promise"]>;

type Props = {
  pdfUrl: string;
  title: string;
  initialPage: number;
  onPageChange: (page: number) => void;
  children?: ReactNode;
  fullscreenActions?: ReactNode;
};

type PdfPageProps = {
  document: PdfDocument;
  pageNumber: number;
  title: string;
  zoom: number;
  trackingEnabled: boolean;
  onVisible: (page: number) => void;
};

function PdfPage({ document, pageNumber, title, zoom, trackingEnabled, onVisible }: PdfPageProps) {
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
        <canvas ref={canvasRef} aria-label={`${title}, página ${pageNumber}`} className="h-auto max-w-full bg-white shadow-sm" />
      ) : null}
    </div>
  );
}

export function PdfStudyReader({ pdfUrl, title, initialPage, onPageChange, children, fullscreenActions }: Props) {
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

  useEffect(() => {
    initialPageRef.current = initialPage;
  }, [initialPage]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(window.document.fullscreenElement === containerRef.current);
    }
    window.document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => window.document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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

  return (
    <section ref={containerRef} className="pdf-study-reader scroll-mt-4 overflow-x-auto rounded-xl border border-border bg-surface" aria-label={t("study.reader")}>
      <div className="pdf-reader-toolbar sticky top-[72px] z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/95 p-3 backdrop-blur">
        <span className="text-sm tabular-nums text-text-secondary">{document ? t("study.pageCount", { page, count: document.numPages }) : t("study.loading")}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border bg-surface" aria-label={t("study.zoom")}>
            <button type="button" className="min-h-8 px-3 text-sm text-text-primary disabled:opacity-40" disabled={zoom <= 60} aria-label={t("study.zoomOut")} onClick={() => setZoom((value) => Math.max(60, value - 10))}>−</button>
            <span className="min-w-12 text-center text-xs tabular-nums text-text-secondary">{zoom}%</span>
            <button type="button" className="min-h-8 px-3 text-sm text-text-primary disabled:opacity-40" disabled={zoom >= 160} aria-label={t("study.zoomIn")} onClick={() => setZoom((value) => Math.min(160, value + 10))}>+</button>
          </div>
          <Button variant="subtle" size="sm" onClick={() => void toggleFullscreen()}>{isFullscreen ? t("study.exitFullscreen") : t("study.fullscreen")}</Button>
          <a className="inline-flex min-h-8 items-center rounded-md px-3 text-xs font-medium text-accent underline underline-offset-4" href={pdfUrl} target="_blank" rel="noreferrer">{t("study.openPdf")}</a>
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
            <PdfPage key={index + 1} document={document} pageNumber={index + 1} title={title} zoom={zoom} trackingEnabled={trackingEnabled} onVisible={handleVisiblePage} />
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
    </section>
  );
}
