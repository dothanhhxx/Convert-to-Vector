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

export async function exportVectorFile(
  svg: string,
  format: ExportFormatType,
  filename: string
): Promise<void> {
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

  // Trigger browser download
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Extract filename from header or build fallback
  const ext = format === 'ai' ? 'ai' : format === 'pdf' ? 'pdf' : format === 'eps' ? 'eps' : format === 'zip' ? 'zip' : 'svg';
  const cleanName = filename.replace(/\.[^/.]+$/, '') || 'vector_artwork';
  a.download = `${cleanName}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function fetchIllustratorGuide(): Promise<string> {
  const res = await fetch(`${API_BASE}/guide`);
  if (!res.ok) throw new Error('Failed to fetch guide');
  const data = await res.json();
  return data.guide;
}
