import type { SampleImage, ImageMetadata, VectorSettings, VectorizeResponse, ExportFormatType } from '../types/vector';

const API_BASE = '/api';

export async function checkHealth(): Promise<{ status: string; engines: string[] }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend service unavailable');
  return res.json();
}

export async function fetchSamples(): Promise<SampleImage[]> {
  const res = await fetch(`${API_BASE}/samples`);
  if (!res.ok) throw new Error('Failed to load sample images');
  const data = await res.json();
  return data.samples;
}

export async function uploadImageFile(file: File): Promise<{
  success: boolean;
  imageId: string;
  metadata: ImageMetadata;
  previewUrl: string;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(errorData.detail || 'Upload failed');
  }

  return res.json();
}

export async function vectorizeImage(
  params: {
    imageId?: string;
    imageBase64?: string;
    filename?: string;
    settings: VectorSettings;
  }
): Promise<VectorizeResponse> {
  const payload = {
    image_id: params.imageId,
    image_base64: params.imageBase64,
    filename: params.filename,
    algorithm: params.settings.algorithm,
    color_mode: params.settings.colorMode,
    num_colors: params.settings.numColors,
    detail_level: params.settings.detailLevel,
    filter_speckle: params.settings.filterSpeckle,
    color_precision: params.settings.colorPrecision,
    layer_difference: params.settings.layerDifference,
    corner_threshold: params.settings.cornerThreshold,
    length_threshold: params.settings.lengthThreshold,
    max_iterations: params.settings.maxIterations,
    splice_threshold: params.settings.spliceThreshold,
    path_precision: params.settings.pathPrecision,
    noise_reduction: params.settings.noiseReduction,
    remove_background: params.settings.removeBackground,
    bg_tolerance: params.settings.bgTolerance,
    threshold: params.settings.threshold,
    hierarchical: params.settings.hierarchical,
    curve_mode: params.settings.curveMode,
  };

  const res = await fetch(`${API_BASE}/vectorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Vectorization failed' }));
    throw new Error(errorData.detail || 'Vectorization process encountered an error');
  }

  return res.json();
}

export interface ExportResult {
  success: boolean;
  cancelled?: boolean;
  savedName?: string;
}

const FORMAT_CONFIGS: Record<
  ExportFormatType,
  { description: string; ext: string; mime: string }
> = {
  svg: {
    description: 'Scalable Vector Graphics (.svg)',
    ext: 'svg',
    mime: 'image/svg+xml',
  },
  pdf: {
    description: 'Adobe PDF Vector Document (.pdf)',
    ext: 'pdf',
    mime: 'application/pdf',
  },
  eps: {
    description: 'Encapsulated PostScript (.eps)',
    ext: 'eps',
    mime: 'application/postscript',
  },
  ai: {
    description: 'Adobe Illustrator Vector Artwork (.ai)',
    ext: 'ai',
    mime: 'application/illustrator',
  },
  zip: {
    description: 'Vector Studio All Formats Bundle (.zip)',
    ext: 'zip',
    mime: 'application/zip',
  },
};

export async function exportVectorFile(
  svg: string,
  format: ExportFormatType,
  filename: string
): Promise<ExportResult> {
  const res = await fetch(`${API_BASE}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      svg,
      format,
      filename,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || 'Failed to export vector file');
  }

  const blob = await res.blob();
  const config = FORMAT_CONFIGS[format] || FORMAT_CONFIGS.svg;
  const cleanName = filename.replace(/\.[^/.]+$/, '') || 'vector_artwork';
  const suggestedName = `${cleanName}.${config.ext}`;

  // 1. Try Native File System Access API (showSaveFilePicker)
  // This opens the OS "Save As" file picker dialog, asking user exactly where to save!
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      // @ts-ignore
      const fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: config.description,
            accept: {
              [config.mime]: [`.${config.ext}`],
            },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { success: true, savedName: fileHandle.name };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User clicked cancel in the save picker dialog
        return { success: false, cancelled: true };
      }
      // If error other than abort, continue to fallback below
      console.warn('showSaveFilePicker failed, falling back to download link:', err);
    }
  }

  // 2. Fallback for browsers without showSaveFilePicker
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  return { success: true, savedName: suggestedName };
}

export async function fetchIllustratorGuide(): Promise<string> {
  const res = await fetch(`${API_BASE}/guide`);
  if (!res.ok) throw new Error('Failed to fetch guide');
  const data = await res.json();
  return data.guide;
}
