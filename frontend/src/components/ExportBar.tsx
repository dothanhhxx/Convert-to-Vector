import React, { useState } from 'react';
import { Space, Button, Input, Tooltip, message } from 'antd';
import {
  FileImageOutlined,
  FilePdfOutlined,
  FormatPainterOutlined,
  CodeOutlined,
  FileZipOutlined,
  EditOutlined,
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
  const [exportName, setExportName] = useState<string>(() => {
    return filename.replace(/\.[^/.]+$/, '') || 'vector_artwork';
  });

  // Update exportName when input filename changes
  React.useEffect(() => {
    setExportName(filename.replace(/\.[^/.]+$/, '') || 'vector_artwork');
  }, [filename]);

  if (!svg || !stats) {
    return null;
  }

  const handleDownload = async (format: ExportFormatType) => {
    try {
      setDownloadingFormat(format);
      const res = await exportVectorFile(svg, format, exportName.trim() || 'vector_artwork');
      if (res.cancelled) {
        // User closed or cancelled the Save As dialog
        return;
      }
      if (res.success) {
        message.success(`Đã lưu "${res.savedName}" vào thư mục bạn chọn!`);
      }
    } catch (err: any) {
      message.error(err.message || `Lỗi khi xuất file ${format.toUpperCase()}`);
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
          <span className="stat-label">Size:</span>
          <span className="stat-value stat-highlight">{stats.svgSizeFormatted}</span>
        </div>
        <div className="stat-divider" />

        <div className="stat-item">
          <span className="stat-label">Time:</span>
          <span className="stat-value">{stats.elapsedMs}ms</span>
        </div>
        <div className="stat-divider" />

        {/* Custom Export File Name Input */}
        <div className="stat-item" style={{ minWidth: 200 }}>
          <Tooltip title="Nhập tên file bạn muốn lưu (khi tải xuống hệ thống sẽ hỏi vị trí thư mục lưu)">
            <Input
              size="small"
              prefix={<EditOutlined style={{ color: '#94a3b8', fontSize: 11 }} />}
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              placeholder="Tên file lưu..."
              style={{
                width: 170,
                backgroundColor: '#1c2433',
                borderColor: '#283347',
                color: '#f1f5f9',
                fontSize: 12,
              }}
            />
          </Tooltip>
        </div>
      </div>

      {/* Right: Export Format Actions with Save As Dialog */}
      <div className="export-buttons-group">
        <Space orientation="horizontal" size="small">
          {/* SVG */}
          <Tooltip title="Hỏi vị trí lưu file SVG trên máy tính (Save As...)">
            <Button
              icon={<FileImageOutlined />}
              onClick={() => handleDownload('svg')}
              loading={downloadingFormat === 'svg'}
              style={{ fontWeight: 600 }}
            >
              SVG
            </Button>
          </Tooltip>

          {/* PDF */}
          <Tooltip title="Hỏi vị trí lưu file PDF vector trên máy tính (Save As...)">
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => handleDownload('pdf')}
              loading={downloadingFormat === 'pdf'}
              style={{ fontWeight: 600 }}
            >
              PDF
            </Button>
          </Tooltip>

          {/* EPS */}
          <Tooltip title="Hỏi vị trí lưu file EPS trên máy tính (Save As...)">
            <Button
              icon={<FormatPainterOutlined />}
              onClick={() => handleDownload('eps')}
              loading={downloadingFormat === 'eps'}
              style={{ fontWeight: 600 }}
            >
              EPS
            </Button>
          </Tooltip>

          {/* AI */}
          <Tooltip title="Hỏi vị trí lưu file AI Illustrator trên máy tính (Save As...)">
            <Button
              icon={<CodeOutlined />}
              onClick={() => handleDownload('ai')}
              loading={downloadingFormat === 'ai'}
              style={{ fontWeight: 600 }}
            >
              AI
            </Button>
          </Tooltip>

          {/* Download All ZIP */}
          <Tooltip title="Hỏi vị trí lưu gói ZIP (chứa đủ cả SVG, PDF, EPS, AI) trên máy tính">
            <Button
              type="primary"
              icon={<FileZipOutlined />}
              onClick={() => handleDownload('zip')}
              loading={downloadingFormat === 'zip'}
              style={{ fontWeight: 600 }}
            >
              Lưu Tất Cả (.ZIP)
            </Button>
          </Tooltip>
        </Space>
      </div>
    </div>
  );
};
