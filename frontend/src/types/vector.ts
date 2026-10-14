export type AlgorithmType = 'vtracer' | 'potrace';
export type ColorModeType = 'color' | 'grayscale' | 'binary';
export type DetailLevelType = 'low' | 'medium' | 'high' | 'ultra';
export type HierarchicalType = 'stacked' | 'cutout';
export type CurveModeType = 'spline' | 'polygon';
export type ViewModeType = 'split' | 'side-by-side' | 'vector' | 'original';
export type CanvasBgType = 'checkerboard' | 'dark' | 'light' | 'gray';
export type ExportFormatType = 'svg' | 'pdf' | 'eps' | 'ai' | 'zip';

export interface ImageMetadata {
  filename: string;
  format: string;
  width: number;
  height: number;
  aspectRatio: number;
  mode: string;
  hasAlpha: boolean;
  sizeBytes: number;
  sizeFormatted: string;
  colorCountEstimate?: string;
  isHighResolution?: boolean;
}

export interface VectorSettings {
  algorithm: AlgorithmType;
  colorMode: ColorModeType;
  numColors: number;
  detailLevel: DetailLevelType;
  filterSpeckle: number;
  colorPrecision: number;
  layerDifference: number;
  cornerThreshold: number;
  lengthThreshold: number;
  maxIterations: number;
  spliceThreshold: number;
  pathPrecision: number;
  noiseReduction: number;
  removeBackground: boolean;
  bgTolerance: number;
  threshold: number;
  hierarchical: HierarchicalType;
  curveMode: CurveModeType;
}

export interface VectorStats {
  pathCount: number;
  nodeCount: number;
  svgSizeBytes: number;
  svgSizeFormatted: string;
  originalSizeFormatted: string;
  compressionRatio: string;
  elapsedMs: number;
  engine: string;
  dimensions: string;
  processedDimensions?: string;
  colorMode?: string;
  quantizedColors?: number;
  backgroundRemoved?: boolean;
}

export interface SampleImage {
  id: string;
  filename: string;
  title: string;
  description: string;
  width: number;
  height: number;
  sizeFormatted: string;
  preview: string;
}

export interface VectorizeResponse {
  success: boolean;
  svg: string;
  stats: VectorStats;
  preprocessedPreview?: string;
}
