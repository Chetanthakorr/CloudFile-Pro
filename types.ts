
export type FileStatus = 'queued' | 'processing' | 'completed' | 'error';

export interface FileJob {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  status: FileStatus;
  progress: number;
  targetFormat: string;
  outputUrl?: string;
  outputSize?: number; // Added to track compressed size
  error?: string;
  settings?: any;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  CONVERTER = 'converter',
  COMPRESSOR = 'compressor',
  TOOLS = 'tools',
  URL_TO_PDF = 'url-to-pdf',
  HISTORY = 'history',
  SETTINGS = 'settings'
}

export interface ConversionCategory {
  name: string;
  icon: string;
  formats: string[];
}
