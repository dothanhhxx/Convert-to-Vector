import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Segmented,
  Button,
  Space,
  Tooltip,
  Upload,
  Typography,
  Spin,
  Alert,
  Tag,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  InboxOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  OneToOneOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type {
  ViewModeType,
  CanvasBgType,
  ImageMetadata,
  VectorStats,
  SampleImage,
} from '../types/vector';

const { Text, Title } = Typography;
const { Dragger } = Upload;

interface CanvasPreviewProps {
  originalUrl: string | null;
  vectorSvg: string | null;
  metadata: ImageMetadata | null;
  stats: VectorStats | null;
  isProcessing: boolean;
  error: string | null;
  onUploadFile: (file: File) => void;
  samples: SampleImage[];
  onSelectSample: (sample: SampleImage) => void;
  onRetry: () => void;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  originalUrl,
  vectorSvg,
  metadata,
  stats,
  isProcessing,
  error,
  onUploadFile,
  samples,
  onSelectSample,
  onRetry,
}) => {
  const [viewMode, setViewMode] = useState<ViewModeType>('split');
  const [canvasBg, setCanvasBg] = useState<CanvasBgType>('checkerboard');
  const [isOutlineMode, setIsOutlineMode] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0 - 100
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 25));
  const handleZoomReset = () => setZoom(100);
  const handleZoomFit = () => setZoom(85);

  // Dragging comparison slider
  const handleMouseDownSplit = () => {
    setIsDraggingSplit(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!isDraggingSplit || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'clientX' in e ? e.clientX : (e as unknown as TouchEvent).touches[0].clientX;
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSplitPosition(pct);
    },
    [isDraggingSplit]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingSplit(false);
  }, []);

  useEffect(() => {
    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove as any);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingSplit, handleMouseMove, handleMouseUp]);

  // Antd upload dragger config
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      onUploadFile(file);
      return false; // prevent default upload
    },
    accept: 'image/png,image/jpeg,image/jpg,image/webp,image/bmp',
  };

  // Prepare vector SVG for display (with wireframe/outline if enabled)
  const renderVectorContent = () => {
    if (!vectorSvg) return null;

    if (isOutlineMode) {
      // Inject outline styles into SVG
      const outlineSvg = vectorSvg.replace(
        /<path /g,
        '<path style="fill:none !important; stroke:#06b6d4 !important; stroke-width:1px !important;" '
      ).replace(
        /<polygon /g,
        '<polygon style="fill:none !important; stroke:#06b6d4 !important; stroke-width:1px !important;" '
      );
      return <div dangerouslySetInnerHTML={{ __html: outlineSvg }} className="svg-container" />;
    }

    return <div dangerouslySetInnerHTML={{ __html: vectorSvg }} className="svg-container" />;
  };

  // 1. EMPTY STATE (No image uploaded yet)
  if (!originalUrl) {
    return (
      <main className="canvas-workspace empty-workspace">
        <div className="empty-dropzone-card">
          <Dragger {...uploadProps} className="custom-dragger">
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 52, color: '#3b82f6' }} />
            </p>
            <Title level={4} style={{ color: '#f1f5f9', fontWeight: 600, marginTop: 12 }}>
              Click or Drag & Drop Image Here
            </Title>
            <p style={{ color: '#94a3b8', fontSize: 13, maxWidth: 440, margin: '8px auto 16px' }}>
              Upload any PNG, JPG, WEBP, or BMP image to convert it into clean, high-precision vector
              geometry with editable Bézier paths.
            </p>
            <Space size="small" wrap style={{ justifyContent: 'center' }}>
              <Tag color="blue">PNG / JPG / WEBP / BMP</Tag>
              <Tag color="cyan">Max 50MB</Tag>
              <Tag color="geekblue">Auto Transparency</Tag>
            </Space>
          </Dragger>

          {samples.length > 0 && (
            <div className="sample-quick-pick">
              <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 10, fontWeight: 600 }}>
                OR TRY SAMPLE GRAPHICS:
              </div>
              <div className="sample-cards-row">
                {samples.map((s) => (
                  <div
                    key={s.id}
                    className="sample-card"
                    onClick={() => onSelectSample(s)}
                    role="button"
                    tabIndex={0}
                  >
                    <img src={s.preview} alt={s.title} className="sample-card-thumb" />
                    <div className="sample-card-info">
                      <div className="sample-card-title">{s.title}</div>
                      <div className="sample-card-desc">{s.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // 2. ACTIVE WORKSPACE WITH TOOLBAR
  return (
    <main className="canvas-workspace">
      {/* Top Workspace Toolbar */}
      <div className="workspace-toolbar">
        <div className="toolbar-left">
          <Segmented<ViewModeType>
            value={viewMode}
            onChange={(val) => setViewMode(val)}
            options={[
              { label: 'Split Compare', value: 'split' },
              { label: 'Side-by-Side', value: 'side-by-side' },
              { label: 'Vector Only', value: 'vector' },
              { label: 'Original Only', value: 'original' },
            ]}
          />
        </div>

        <div className="toolbar-center">
          <Space orientation="horizontal" size="small">
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Canvas:</span>
            <Segmented<CanvasBgType>
              size="small"
              value={canvasBg}
              onChange={(val) => setCanvasBg(val)}
              options={[
                { label: 'Checker', value: 'checkerboard' },
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
                { label: 'Gray', value: 'gray' },
              ]}
            />

            {vectorSvg && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                type={isOutlineMode ? 'primary' : 'default'}
                onClick={() => setIsOutlineMode(!isOutlineMode)}
                style={{ fontWeight: 600 }}
              >
                {isOutlineMode ? 'Outline: ON' : 'Outline: OFF'}
              </Button>
            )}
          </Space>
        </div>

        <div className="toolbar-right">
          <Space orientation="horizontal" size="small">
            <Tooltip title="Zoom Out">
              <Button size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            </Tooltip>
            <span style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600, minWidth: 42, textAlign: 'center' }}>
              {zoom}%
            </span>
            <Tooltip title="Zoom In">
              <Button size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            </Tooltip>
            <Tooltip title="100% Reset">
              <Button size="small" icon={<OneToOneOutlined />} onClick={handleZoomReset} />
            </Tooltip>
            <Tooltip title="Fit Viewport">
              <Button size="small" icon={<ExpandOutlined />} onClick={handleZoomFit} />
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* Error Notification */}
      {error && (
        <Alert
          message="Conversion Notification"
          description={error}
          type="error"
          showIcon
          closable
          action={
            <Button size="small" danger onClick={onRetry}>
              Retry
            </Button>
          }
          style={{ margin: '8px 16px 0 16px' }}
        />
      )}

      {/* Main Canvas Viewport */}
      <div className={`canvas-viewport bg-${canvasBg}`}>
        <div
          className="canvas-scalable-stage"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          {/* A. SPLIT COMPARISON SLIDER */}
          {viewMode === 'split' && (
            <div
              className="split-comparison-container"
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* Left Side: Original Image */}
              <div
                className="split-pane split-original"
                style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}
              >
                <img src={originalUrl} alt="Original raster" className="split-image" />
                <div className="split-badge badge-original">Original (Raster)</div>
              </div>

              {/* Right Side: Vector SVG */}
              <div
                className="split-pane split-vector"
                style={{ clipPath: `inset(0 0 0 ${splitPosition}%)` }}
              >
                {vectorSvg ? (
                  renderVectorContent()
                ) : (
                  <div className="split-vector-placeholder">
                    {isProcessing ? (
                      <Spin tip="Generating vector paths..." />
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: 13 }}>
                        Click "Convert to Vector" in sidebar to preview
                      </div>
                    )}
                  </div>
                )}
                <div className="split-badge badge-vector">Vector (Bézier SVG)</div>
              </div>

              {/* Draggable Divider Handle */}
              <div
                className="split-handle"
                style={{ left: `${splitPosition}%` }}
                onMouseDown={handleMouseDownSplit}
                onTouchStart={handleMouseDownSplit}
              >
                <div className="split-handle-line" />
                <div className="split-handle-thumb">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M8 7L3 12L8 17M16 7L21 12L16 17" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* B. SIDE-BY-SIDE MODE */}
          {viewMode === 'side-by-side' && (
            <div className="side-by-side-container">
              <div className="side-card">
                <div className="side-card-header">
                  <Text style={{ fontWeight: 600, color: '#f1f5f9' }}>Original Raster</Text>
                  {metadata && (
                    <Tag color="default" style={{ fontSize: 11 }}>
                      {metadata.format} • {metadata.sizeFormatted}
                    </Tag>
                  )}
                </div>
                <div className="side-card-body">
                  <img src={originalUrl} alt="Original" className="side-image" />
                </div>
              </div>

              <div className="side-card">
                <div className="side-card-header">
                  <Text style={{ fontWeight: 600, color: '#f1f5f9' }}>Vector SVG</Text>
                  {stats && (
                    <Tag color="blue" style={{ fontSize: 11 }}>
                      {stats.pathCount} Paths • {stats.svgSizeFormatted}
                    </Tag>
                  )}
                </div>
                <div className="side-card-body">
                  {vectorSvg ? (
                    renderVectorContent()
                  ) : (
                    <div className="vector-waiting-box">
                      {isProcessing ? (
                        <Spin tip="Tracing vectors..." />
                      ) : (
                        <Text style={{ color: '#94a3b8' }}>Vector preview will appear here</Text>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* C. VECTOR ONLY MODE */}
          {viewMode === 'vector' && (
            <div className="single-preview-container">
              {vectorSvg ? (
                renderVectorContent()
              ) : (
                <div className="vector-waiting-box">
                  {isProcessing ? (
                    <Spin size="large" tip="Tracing vector shapes..." />
                  ) : (
                    <Text style={{ color: '#94a3b8' }}>
                      Press "Convert to Vector" in sidebar to generate SVG
                    </Text>
                  )}
                </div>
              )}
            </div>
          )}

          {/* D. ORIGINAL ONLY MODE */}
          {viewMode === 'original' && (
            <div className="single-preview-container">
              <img src={originalUrl} alt="Original" className="single-preview-image" />
            </div>
          )}
        </div>

        {/* Floating loading overlay when converting */}
        {isProcessing && (
          <div className="canvas-processing-overlay">
            <Spin size="large" />
            <div style={{ marginTop: 12, fontWeight: 600, color: '#f1f5f9' }}>
              Vectorizing Artwork...
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              Fitting Bézier splines & calculating vector contours
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
