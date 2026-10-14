import React, { useState } from 'react';
import { Space, Button, Tag, message } from 'antd';
import {
  FileImageOutlined,
  FilePdfOutlined,
  FormatPainterOutlined,
  CodeOutlined,
  FileZipOutlined,
} from '@ant-design/icons';
import type { VectorStats, ExportFormatType } from '../types/vector';
import { exportVectorFile } from '../services/api';

interface ExportBarProps {
  svg: string | null;
  stats: VectorStats | null;
  filename: string;
}

export const ExportBar: React.FC<ExportBarProps> = ({ svg, stats, filename }) => {
  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormatType | null>(null);

  if (!svg || !stats) {
    return null;
  }

  const handleDownload = async (format: ExportFormatType) => {
    try {
      setDownloadingFormat(format);
      await exportVectorFile(svg, format, filename);
      message.success(`Successfully downloaded ${format.toUpperCase()} vector file!`);
    } catch (err: any) {
      message.error(err.message || `Failed to download ${format.toUpperCase()}`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="app-export-bar">
      {/* Left: Statistics & Metrics */}
      <div className="export-stats-group">
        <div className="stat-item">
          <span className="stat-label">Paths:</span>
          <span className="stat-value">{stats.pathCount.toLocaleString()}</span>
        </div>
        <div className="stat-divider" />

        <div className="stat-item">
          <span className="stat-label">Nodes:</span>
          <span className="stat-value">{stats.nodeCount.toLocaleString()}</span>
        </div>
        <div className="stat-divider" />

        <div className="stat-item">
          <span className="stat-label">Vector Size:</span>
          <span className="stat-value stat-highlight">{stats.svgSizeFormatted}</span>
        </div>
        <div className="stat-divider" />

        <div className="stat-item">
          <span className="stat-label">Time:</span>
          <span className="stat-value">{stats.elapsedMs}ms</span>
        </div>
        <div className="stat-divider" />

        <div className="stat-item">
          <span className="stat-label">Engine:</span>
          <Tag color="cyan" style={{ margin: 0, fontWeight: 600, fontSize: 11 }}>
            {stats.engine.replace(' Engine', '')}
          </Tag>
        </div>
      </div>

      {/* Right: Export Format Actions */}
      <div className="export-buttons-group">
        <Space orientation="horizontal" size="small">
          {/* SVG */}
          <Button
            icon={<FileImageOutlined />}
            onClick={() => handleDownload('svg')}
            loading={downloadingFormat === 'svg'}
            style={{ fontWeight: 600 }}
          >
            SVG
          </Button>

          {/* PDF */}
          <Button
            icon={<FilePdfOutlined />}
            onClick={() => handleDownload('pdf')}
            loading={downloadingFormat === 'pdf'}
            style={{ fontWeight: 600 }}
          >
            PDF (Vector)
          </Button>

          {/* EPS */}
          <Button
            icon={<FormatPainterOutlined />}
            onClick={() => handleDownload('eps')}
            loading={downloadingFormat === 'eps'}
            style={{ fontWeight: 600 }}
          >
            EPS
          </Button>

          {/* AI */}
          <Button
            icon={<CodeOutlined />}
            onClick={() => handleDownload('ai')}
            loading={downloadingFormat === 'ai'}
            style={{ fontWeight: 600 }}
          >
            AI (Illustrator)
          </Button>

          {/* Download All ZIP */}
          <Button
            type="primary"
            icon={<FileZipOutlined />}
            onClick={() => handleDownload('zip')}
            loading={downloadingFormat === 'zip'}
            style={{ fontWeight: 600 }}
          >
            Download All (.ZIP)
          </Button>
        </Space>
      </div>
    </div>
  );
};
