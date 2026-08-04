"use client";
/* eslint-disable @next/next/no-img-element -- previews are loaded from object URLs and need a native image element */

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EnhancementPreset,
  EnhancementSettings,
  OutputFormat,
  OutputScale,
  MAX_FILE_SIZE_BYTES,
  estimateOutputSizeBytes,
  formatBytes,
  getExifOrientation,
  getPresetLabel,
  initialSettings,
  presetSettings,
  renderEnhancedCanvas,
  resolveOutputDimensions,
} from "@/lib/photoEnhancer";

type HistoryEntry = {
  settings: EnhancementSettings;
  preset: EnhancementPreset | "custom";
};

type LoadedImage = {
  file: File;
  objectUrl: string;
  decodedImage: HTMLImageElement;
  width: number;
  height: number;
  orientation: number;
};

const presetOptions: EnhancementPreset[] = ["natural", "portrait", "document", "vivid"];
const formatOptions: OutputFormat[] = ["jpeg", "png"];
const scaleOptions: OutputScale[] = ["original", "2x", "4x"];

export default function PhotoEnhancer() {
  const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);
  const [settings, setSettings] = useState<EnhancementSettings>(initialSettings);
  const [preset, setPreset] = useState<EnhancementPreset | "custom">("custom");
  const [outputScale, setOutputScale] = useState<OutputScale>("original");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpeg");
  const [jpegQuality, setJpegQuality] = useState(92);
  const [comparison, setComparison] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const renderJobIdRef = useRef(0);
  const loadedImageRef = useRef<LoadedImage | null>(null);

  useEffect(() => {
    loadedImageRef.current = loadedImage;

    return () => {
      if (loadedImage?.objectUrl) {
        URL.revokeObjectURL(loadedImage.objectUrl);
      }
    };
  }, [loadedImage]);

  const currentFileName = useMemo(() => {
    if (!loadedImage?.file.name) {
      return "enhanced-photo";
    }

    const baseName = loadedImage.file.name.replace(/\.[^/.]+$/, "") || "enhanced-photo";
    return `${baseName}.${outputFormat === "png" ? "png" : "jpg"}`;
  }, [loadedImage, outputFormat]);

  const previewLabel = useMemo(() => {
    if (!loadedImage) {
      return "Preview";
    }

    return `${loadedImage.width} × ${loadedImage.height}`;
  }, [loadedImage]);

  const handleLoadImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG, or WebP image file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("This file is larger than 20 MB. Please choose a smaller image.");
      return;
    }

    if (isBusy) {
      return;
    }

    setIsBusy(true);
    setError(null);

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("This image could not be loaded. Please try another file."));
        image.src = objectUrl;
      });

      const orientation = await getExifOrientation(file);
      const nextImage: LoadedImage = {
        file,
        objectUrl,
        decodedImage: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        orientation,
      };

      setLoadedImage((current) => {
        if (current?.objectUrl && current.objectUrl !== objectUrl) {
          URL.revokeObjectURL(current.objectUrl);
        }
        return nextImage;
      });
      setSettings(initialSettings);
      setPreset("custom");
      setComparison(50);
      setOutputScale("original");
      setOutputFormat("jpeg");
      setJpegQuality(92);
      setHistory([]);
      setPreviewUrl(objectUrl);
    } catch (loadError) {
      URL.revokeObjectURL(objectUrl);
      setError(loadError instanceof Error ? loadError.message : "Image loading failed.");
    } finally {
      setIsBusy(false);
    }
  }, [isBusy]);

  useEffect(() => {
    if (!loadedImage) {
      return;
    }

    const jobId = ++renderJobIdRef.current;
    let active = true;

    const renderPreview = async () => {
      setIsProcessing(true);
      try {
        const previewWidth = Math.max(1, Math.min(loadedImage.width, 1400));
        const previewHeight = Math.round((previewWidth / loadedImage.width) * loadedImage.height);
        const sourceImage = loadedImage.decodedImage;
        const canvas = await renderEnhancedCanvas(sourceImage, settings, previewWidth, previewHeight, loadedImage.orientation);
        const url = canvas.toDataURL("image/webp", 0.9);
        if (active && jobId === renderJobIdRef.current) {
          setPreviewUrl(url);
          setError(null);
        }
      } catch (renderError) {
        if (active && jobId === renderJobIdRef.current) {
          const friendlyError = renderError instanceof Error && renderError.message.includes("decode")
            ? "The source image could not be processed. The last valid preview is still available."
            : "The source image could not be processed. Please try another file.";
          setError(friendlyError);
        }
      } finally {
        if (active && jobId === renderJobIdRef.current) {
          setIsProcessing(false);
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      void renderPreview();
    }, 160);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [loadedImage, settings]);

  const derivedOutputSize = useMemo(() => {
    if (!loadedImage) {
      return null;
    }

    const dimensions = resolveOutputDimensions(loadedImage.width, loadedImage.height, outputScale);
    return {
      width: dimensions.width,
      height: dimensions.height,
      estimated: formatBytes(estimateOutputSizeBytes(dimensions.width, dimensions.height, outputFormat, jpegQuality)),
    };
  }, [loadedImage, outputScale, outputFormat, jpegQuality]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    void handleLoadImage(file);
    event.target.value = "";
  }

  function updateSetting<Key extends keyof EnhancementSettings>(key: Key, value: number) {
    setSettings((current) => {
      const nextSettings = { ...current, [key]: value };
      setHistory((currentHistory) => {
        const limitHistory = currentHistory.length > 10 ? currentHistory.slice(1) : currentHistory;
        return [...limitHistory, { settings: nextSettings, preset: "custom" }];
      });
      return nextSettings;
    });
    setPreset("custom");
  }

  function applyPreset(nextPreset: EnhancementPreset) {
    setPreset(nextPreset);
    setSettings(presetSettings[nextPreset]);
    setHistory((currentHistory) => [...currentHistory, { settings: presetSettings[nextPreset], preset: nextPreset }]);
  }

  function applyAutoEnhance() {
    const autoSettings: EnhancementSettings = {
      brightness: 104,
      contrast: 108,
      saturation: 103,
      sharpness: 10,
      clarity: 12,
      highlights: 6,
      shadows: -4,
      noiseReduction: 6,
    };

    setPreset("custom");
    setSettings(autoSettings);
    setHistory((currentHistory) => [...currentHistory, { settings: autoSettings, preset: "custom" }]);
  }

  function undoLastChange() {
    if (history.length === 0) {
      return;
    }

    const previousEntry = history[history.length - 1];
    setSettings(previousEntry.settings);
    setPreset(previousEntry.preset);
    setHistory((currentHistory) => currentHistory.slice(0, -1));
  }

  function resetAdjustments() {
    setSettings(initialSettings);
    setPreset("custom");
    setHistory([]);
  }

  async function downloadEnhancedPhoto() {
    if (!loadedImage) {
      return;
    }

    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const sourceImage = loadedImage.decodedImage;

      const dimensions = resolveOutputDimensions(loadedImage.width, loadedImage.height, outputScale);
      const canvas = await renderEnhancedCanvas(sourceImage, settings, dimensions.width, dimensions.height, loadedImage.orientation);
      const downloadUrl = outputFormat === "png"
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", jpegQuality / 100);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = currentFileName;
      link.click();
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "The download could not be completed.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6 lg:p-8">
      {!loadedImage ? (
        <label className="flex min-h-[28rem] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50/70 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50">
          <span className="text-5xl" aria-hidden="true">
            ✦
          </span>
          <span className="mt-5 text-xl font-bold text-slate-800">Upload a photo to enhance</span>
          <span className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Smart Auto Enhance works entirely in your browser using Canvas APIs. It preserves the original character of your image while improving brightness, contrast, clarity, and tone.
          </span>
          <span className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white">Choose photo</span>
          <span className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-500">JPG • PNG • WEBP • up to 20 MB</span>
          <input ref={fileInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="space-y-7">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Smart Auto Enhance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Compare the original and enhanced version, fine-tune the result, and download a polished file in your browser.
              </p>
            </div>
            <label className="cursor-pointer self-start rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-700">
              Choose another photo
              <input ref={fileInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
            </label>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">Before / After</span>
                    <span className="text-xs font-medium text-slate-500">{previewLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">Original</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">Enhanced</span>
                  </div>
                </div>

                <div className="relative flex min-h-[26rem] items-center justify-center overflow-hidden p-3 sm:p-4">
                  <img
                    src={loadedImage.objectUrl}
                    alt="Original photograph"
                    className="absolute inset-0 m-auto h-full w-full object-contain opacity-100"
                    style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}
                  />
                  <img
                    src={previewUrl ?? loadedImage.objectUrl}
                    alt="Enhanced preview"
                    className="absolute inset-0 m-auto h-full w-full object-contain opacity-100"
                    style={{ clipPath: `inset(0 0 0 ${comparison}%)` }}
                  />
                  <div className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.4)]" style={{ left: `${comparison}%` }} />
                  <input
                    aria-label="Compare original and enhanced preview"
                    className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent"
                    type="range"
                    min={0}
                    max={100}
                    value={comparison}
                    onChange={(event) => setComparison(Number(event.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard label="Original size" value={`${loadedImage.width} × ${loadedImage.height}`} />
                <InfoCard label="Output size" value={derivedOutputSize ? `${derivedOutputSize.width} × ${derivedOutputSize.height}` : `${loadedImage.width} × ${loadedImage.height}`} />
                <InfoCard label="Estimated size" value={derivedOutputSize?.estimated || "—"} />
              </div>
            </div>

            <aside className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">Controls</h3>
                  <p className="text-sm text-slate-500">Fine-tune in real time, then download safely.</p>
                </div>
                <button type="button" onClick={applyAutoEnhance} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700" disabled={isBusy || isProcessing}>
                  Smart Auto Enhance
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {presetOptions.map((option) => (
                  <button key={option} type="button" onClick={() => applyPreset(option)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${preset === option ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}>
                    {getPresetLabel(option)}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <AdjustmentControl label="Brightness" value={settings.brightness} min={70} max={130} step={1} onChange={(value) => updateSetting("brightness", value)} />
                <AdjustmentControl label="Contrast" value={settings.contrast} min={80} max={130} step={1} onChange={(value) => updateSetting("contrast", value)} />
                <AdjustmentControl label="Colour" value={settings.saturation} min={80} max={130} step={1} onChange={(value) => updateSetting("saturation", value)} />
                <AdjustmentControl label="Sharpness" value={settings.sharpness} min={0} max={20} step={1} onChange={(value) => updateSetting("sharpness", value)} />
                <AdjustmentControl label="Clarity" value={settings.clarity} min={0} max={20} step={1} onChange={(value) => updateSetting("clarity", value)} />
                <AdjustmentControl label="Highlights" value={settings.highlights} min={-20} max={20} step={1} onChange={(value) => updateSetting("highlights", value)} />
                <AdjustmentControl label="Shadows" value={settings.shadows} min={-20} max={20} step={1} onChange={(value) => updateSetting("shadows", value)} />
                <AdjustmentControl label="Noise Reduction" value={settings.noiseReduction} min={0} max={20} step={1} onChange={(value) => updateSetting("noiseReduction", value)} />
              </div>

              <div className="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
                <button type="button" onClick={undoLastChange} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400" disabled={history.length === 0}>
                  Undo
                </button>
                <button type="button" onClick={resetAdjustments} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                  Reset
                </button>
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="output-scale">Output scale</label>
                  <select id="output-scale" value={outputScale} onChange={(event) => setOutputScale(event.target.value as OutputScale)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                    {scaleOptions.map((scale) => (
                      <option key={scale} value={scale}>{scale === "original" ? "Original" : `${scale} output`}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="output-format">Export format</label>
                  <select id="output-format" value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as OutputFormat)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                    {formatOptions.map((format) => (
                      <option key={format} value={format}>{format === "jpeg" ? "JPG" : "PNG"}</option>
                    ))}
                  </select>
                </div>

                {outputFormat === "jpeg" && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="jpg-quality">JPG quality</label>
                    <input id="jpg-quality" type="range" min={70} max={98} step={1} value={jpegQuality} onChange={(event) => setJpegQuality(Number(event.target.value))} className="mt-2 w-full accent-blue-600" />
                    <div className="mt-1 text-xs text-slate-500">{jpegQuality}% quality</div>
                  </div>
                )}
              </div>

              <button type="button" onClick={downloadEnhancedPhoto} className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700" disabled={isBusy || isProcessing || isDownloading}>
                {isDownloading ? "Preparing download…" : `Download ${outputFormat === "jpeg" ? "JPG" : "PNG"}`}
              </button>
            </aside>
          </div>
        </div>
      )}

      {isProcessing && <p className="mt-4 text-sm text-slate-500">Processing preview…</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}

function AdjustmentControl({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span className="text-slate-500">{value}</span>
      </span>
      <input className="mt-2 w-full accent-blue-600" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</div>
      <div className="mt-1 font-semibold text-slate-800">{value}</div>
    </div>
  );
}
