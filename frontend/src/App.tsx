import React, { useState, useEffect, useCallback } from 'react';
import { ConfigProvider, theme, message } from 'antd';
import type {
  VectorSettings,
  ImageMetadata,
  VectorStats,
  SampleImage,
} from './types/vector';
import {
  fetchSamples,
  uploadImageFile,
  vectorizeImage,
} from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CanvasPreview } from './components/CanvasPreview';
import { ExportBar } from './components/ExportBar';
import { IllustratorModal } from './components/IllustratorModal';
import './App.css';

const DEFAULT_SETTINGS: VectorSettings = {
  algorithm: 'vtracer',
  colorMode: 'color',
  numColors: 16,
  detailLevel: 'high',
  filterSpeckle: 4,
  colorPrecision: 6,
  layerDifference: 16,
  cornerThreshold: 60,
  lengthThreshold: 4.0,
  maxIterations: 10,
  spliceThreshold: 45,
  pathPrecision: 3,
  noiseReduction: 0,
  removeBackground: false,
  bgTolerance: 25,
  threshold: 128,
  hierarchical: 'stacked',
  curveMode: 'spline',
};

export const App: React.FC = () => {
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [vectorSvg, setVectorSvg] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [stats, setStats] = useState<VectorStats | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<VectorSettings>(DEFAULT_SETTINGS);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [activeFilename, setActiveFilename] = useState<string>('vector_artwork');

  // Load sample graphics on startup
  useEffect(() => {
    fetchSamples()
      .then((data) => setSamples(data))
      .catch((err) => console.warn('Could not load samples:', err));
  }, []);

  // Vectorize current image with settings
  const handleRunVectorization = useCallback(
    async (
      imgId: string | null = imageId,
      imgUrl: string | null = originalUrl,
      customSettings: VectorSettings = settings,
      name: string = activeFilename
    ) => {
      if (!imgId && !imgUrl) return;

      setIsProcessing(true);
      setError(null);

      try {
        const res = await vectorizeImage({
          imageId: imgId || undefined,
          imageBase64: !imgId && imgUrl ? imgUrl : undefined,
          filename: name,
          settings: customSettings,
        });

        if (res.success && res.svg) {
          setVectorSvg(res.svg);
          setStats(res.stats);
          message.success('Vectorization completed successfully!');
        } else {
          throw new Error('Vectorization returned empty result');
        }
      } catch (err: any) {
        const msg = err.message || 'Failed to vectorize image';
        setError(msg);
        message.error(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [imageId, originalUrl, settings, activeFilename]
  );

  // Upload file handler
  const handleUploadFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await uploadImageFile(file);
      setImageId(res.imageId);
      setOriginalUrl(res.previewUrl);
      setMetadata(res.metadata);
      setActiveFilename(file.name);

      // Trigger immediate initial vectorization
      await handleRunVectorization(res.imageId, res.previewUrl, settings, file.name);
    } catch (err: any) {
      const msg = err.message || 'Failed to upload image';
      setError(msg);
      message.error(msg);
      setIsProcessing(false);
    }
  };

  // Select sample image handler
  const handleSelectSample = async (sample: SampleImage) => {
    setIsProcessing(true);
    setError(null);
    setImageId(null); // using direct base64
    setOriginalUrl(sample.preview);
    setActiveFilename(sample.filename);
    setMetadata({
      filename: sample.filename,
      format: 'PNG',
      width: sample.width,
      height: sample.height,
      aspectRatio: roundNum(sample.width / sample.height),
      mode: 'RGBA',
      hasAlpha: true,
      sizeBytes: 4096,
      sizeFormatted: sample.sizeFormatted,
    });

    // Auto-adjust setting if vintage crest (B&W)
    let sampleSettings = { ...settings };
    if (sample.id === 'vintage_crest') {
      sampleSettings = {
        ...sampleSettings,
        algorithm: 'potrace',
        colorMode: 'binary',
        threshold: 128,
      };
      setSettings(sampleSettings);
    } else {
      sampleSettings = {
        ...sampleSettings,
        algorithm: 'vtracer',
        colorMode: 'color',
      };
      setSettings(sampleSettings);
    }

    await handleRunVectorization(null, sample.preview, sampleSettings, sample.filename);
  };

  // Reset all state back to initial empty dropzone
  const handleReset = () => {
    setOriginalUrl(null);
    setVectorSvg(null);
    setImageId(null);
    setMetadata(null);
    setStats(null);
    setError(null);
    setSettings(DEFAULT_SETTINGS);
    setActiveFilename('vector_artwork');
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
          colorBgBase: '#0b0f17',
          colorBgContainer: '#151b26',
          colorBorder: '#283347',
          colorTextBase: '#f1f5f9',
          colorTextSecondary: '#94a3b8',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          borderRadius: 6,
        },
      }}
    >
      <div className="vector-app-layout">
        {/* Header */}
        <Header
          samples={samples}
          onSelectSample={handleSelectSample}
          onReset={handleReset}
          onOpenGuide={() => setGuideOpen(true)}
          hasImage={Boolean(originalUrl)}
          isProcessing={isProcessing}
          hasVector={Boolean(vectorSvg)}
        />

        {/* Main Studio Workbench */}
        <div className="workbench-body">
          {/* Settings Sidebar (Visible when image is loaded or always accessible) */}
          <Sidebar
            settings={settings}
            onChangeSettings={setSettings}
            onConvert={() => handleRunVectorization()}
            onResetSettings={() => setSettings(DEFAULT_SETTINGS)}
            isProcessing={isProcessing}
            metadata={metadata}
          />

          {/* Center Canvas Preview */}
          <CanvasPreview
            originalUrl={originalUrl}
            vectorSvg={vectorSvg}
            metadata={metadata}
            stats={stats}
            isProcessing={isProcessing}
            error={error}
            onUploadFile={handleUploadFile}
            samples={samples}
            onSelectSample={handleSelectSample}
            onRetry={() => handleRunVectorization()}
          />
        </div>

        {/* Bottom Docked Export Bar */}
        <ExportBar
          svg={vectorSvg}
          stats={stats}
          filename={activeFilename}
        />

        {/* Adobe Illustrator Workflow Guide Modal */}
        <IllustratorModal
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
        />
      </div>
    </ConfigProvider>
  );
};

function roundNum(num: number): number {
  return Math.round(num * 100) / 100;
}

export default App;
