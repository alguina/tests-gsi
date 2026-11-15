"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/useI18n";

type PdfDocument = Awaited<ReturnType<(typeof import("pdfjs-dist"))["getDocument"]>["promise"]>;

type Props = {
  pdfUrl: string;
  title: string;
  initialPage: number;
  onPageChange: (page: number) => void;
};

export function PdfStudyReader({ pdfUrl, title, initialPage, onPageChange }: Props) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const documentRef = useRef<PdfDocument | null>(null);
  const initialPageRef = useRef(initialPage);
  const renderVersionRef = useRef(0);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    initialPageRef.current = initialPage;
  }, [initialPage]);

  const renderPage = useCallback(async (pageNumber: number) => {
    const document = documentRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!document || !canvas || !container) return;

    const version = ++renderVersionRef.current;
    const pdfPage = await document.getPage(pageNumber);
    const baseViewport = pdfPage.getViewport({ scale: 1 });
    const availableWidth = Math.max(280, container.clientWidth - 32);
    const cssScale = availableWidth / baseViewport.width;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const renderViewport = pdfPage.getViewport({ scale: cssScale * pixelRatio });
    const context = canvas.getContext("2d");
    if (!context || version !== renderVersionRef.current) return;

    canvas.width = Math.floor(renderViewport.width);
    canvas.height = Math.floor(renderViewport.height);
    canvas.style.width = `${Math.floor(renderViewport.width / pixelRatio)}px`;
    canvas.style.height = `${Math.floor(renderViewport.height / pixelRatio)}px`;

    await pdfPage.render({ canvas, canvasContext: context, viewport: renderViewport }).promise;
    if (version === renderVersionRef.current) setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: ReturnType<(typeof import("pdfjs-dist"))["getDocument"]> | null = null;

    async function loadDocument() {
      try {
        setError(false);
        setIsLoading(true);
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        loadingTask = pdfjs.getDocument(pdfUrl);
        const document = await loadingTask.promise;
        if (cancelled) return;
        documentRef.current = document;
        setPageCount(document.numPages);
        const safePage = Math.min(Math.max(1, initialPageRef.current), document.numPages);
        setPage(safePage);
        await renderPage(safePage);
      } catch {
        if (!cancelled) {
          setError(true);
          setIsLoading(false);
        }
      }
    }

    void loadDocument();
    return () => {
      cancelled = true;
      renderVersionRef.current += 1;
      documentRef.current = null;
      void loadingTask?.destroy();
    };
  }, [pdfUrl, renderPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void renderPage(page), 100);
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [page, renderPage]);

  function goToPage(nextPage: number) {
    if (!pageCount) return;
    const safePage = Math.min(Math.max(1, nextPage), pageCount);
    if (safePage === page) return;
    setPage(safePage);
    setIsLoading(true);
    onPageChange(safePage);
    void renderPage(safePage);
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function openFullscreen() {
    const element = containerRef.current;
    if (!element) return;
    if (element.requestFullscreen) {
      await element.requestFullscreen();
      return;
    }
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section ref={containerRef} className="pdf-study-reader scroll-mt-4 overflow-auto rounded-xl border border-border bg-surface" aria-label={t("study.reader")}>
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface p-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1 || !pageCount} onClick={() => goToPage(page - 1)}>{t("study.previousPage")}</Button>
          <span className="min-w-20 text-center text-sm tabular-nums text-text-secondary">{pageCount ? t("study.pageCount", { page, count: pageCount }) : t("study.loading")}</span>
          <Button variant="secondary" size="sm" disabled={!pageCount || page >= pageCount} onClick={() => goToPage(page + 1)}>{t("study.nextPage")}</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="subtle" size="sm" onClick={() => void openFullscreen()}>{t("study.fullscreen")}</Button>
          <a className="inline-flex min-h-8 items-center rounded-md px-3 text-xs font-medium text-accent underline underline-offset-4" href={pdfUrl} target="_blank" rel="noreferrer">{t("study.openPdf")}</a>
        </div>
      </div>

      <div className="relative flex min-h-[60vh] justify-center bg-surface-muted p-4">
        {isLoading && !error ? <p className="absolute top-8 text-sm text-text-muted">{t("study.loading")}</p> : null}
        {error ? (
          <div className="m-auto max-w-md text-center">
            <p className="text-sm text-text-secondary">{t("study.readerError")}</p>
            <Button href={pdfUrl} variant="secondary" className="mt-4">{t("study.openPdf")}</Button>
          </div>
        ) : (
          <canvas ref={canvasRef} aria-label={`${title}, ${t("study.pageCount", { page, count: pageCount ?? "…" })}`} className="h-fit max-w-full bg-white shadow-sm" />
        )}
      </div>
    </section>
  );
}
