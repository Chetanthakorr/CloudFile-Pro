
import React, { useState, useCallback, useEffect } from 'react';
import { AppRoute, FileJob, FileStatus } from './types';
import { FILE_CATEGORIES, Icons } from './constants';
import { geminiService } from './services/geminiService';

// --- Components ---

const Sidebar: React.FC<{ currentRoute: AppRoute, setRoute: (r: AppRoute) => void }> = ({ currentRoute, setRoute }) => {
  const menuItems = [
    { id: AppRoute.DASHBOARD, label: 'Dashboard', icon: <Icons.File /> },
    { id: AppRoute.CONVERTER, label: 'Converter', icon: <Icons.ArrowRight /> },
    { id: AppRoute.COMPRESSOR, label: 'Image Compressor', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg> },
    { id: AppRoute.TOOLS, label: 'File Tools', icon: <Icons.Settings /> },
    { id: AppRoute.URL_TO_PDF, label: 'URL to PDF', icon: <Icons.Link /> },
    { id: AppRoute.HISTORY, label: 'History', icon: <Icons.Cloud /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">C</div>
        <span className="text-xl font-bold text-white tracking-tight">CloudFile Pro</span>
      </div>
      <nav className="flex-1 mt-6 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setRoute(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentRoute === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-slate-800'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800 p-4 rounded-xl text-xs">
          <p className="font-semibold text-slate-100 mb-1">Free Plan</p>
          <div className="w-full h-1.5 bg-slate-700 rounded-full mb-2">
            <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
          </div>
          <p>750 / 1000 credits used</p>
          <button className="mt-3 w-full py-2 bg-blue-600/20 text-blue-400 font-bold rounded-lg border border-blue-600/30 hover:bg-blue-600 hover:text-white transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ title: string }> = ({ title }) => (
  <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-40">
    <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-slate-100 rounded-full transition-colors relative text-slate-500">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
        <img src="https://picsum.photos/32/32" alt="Avatar" />
      </div>
    </div>
  </header>
);

const FileJobCard: React.FC<{ job: FileJob, onRemove: (id: string) => void }> = ({ job, onRemove }) => {
  const handleDownload = () => {
    if (job.outputUrl) {
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Processed ' + job.name);
      link.download = job.name.replace(/\.[^/.]+$/, "") + (job.status === 'completed' ? `_optimized.${job.extension}` : `.${job.targetFormat.toLowerCase()}`);
      link.click();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 group hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${job.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
        <Icons.File />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-800 truncate">{job.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs ${job.outputSize ? 'text-slate-400 line-through' : 'text-slate-400'}`}>{(job.size / 1024 / 1024).toFixed(2)} MB</span>
          {job.outputSize && (
            <span className="text-xs font-bold text-green-600">{(job.outputSize / 1024).toFixed(1)} KB</span>
          )}
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{job.extension}</span>
        </div>
      </div>
      
      <div className="w-48 px-4">
        {job.status === 'processing' ? (
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${job.progress}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-tight">Processing {job.progress}%</p>
          </div>
        ) : job.status === 'completed' ? (
          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm justify-end">
            <Icons.Check />
            <span>Ready</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 text-right">Queued</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {job.status === 'completed' && (
          <button 
            onClick={handleDownload}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Download"
          >
            <Icons.Download />
          </button>
        )}
        <button 
          onClick={() => onRemove(job.id)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
};

// --- Main Views ---

const CompressorView: React.FC<{
  jobs: FileJob[],
  addJob: (f: File) => void,
  removeJob: (id: string) => void,
  startCompression: () => void,
  downloadAll: () => void
}> = ({ jobs, addJob, removeJob, startCompression, downloadAll }) => {
  const [level, setLevel] = useState(80);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Explicitly type 'f' as 'File' to resolve "Property 'type' does not exist on type 'unknown'"
      Array.from(e.target.files).forEach((f: File) => {
        if (['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)) {
          addJob(f);
        } else {
          alert("Only JPEG and PNG images are supported for compression in this module.");
        }
      });
    }
  };

  const isAnyQueued = jobs.some(j => j.status === 'queued');
  const allCompleted = jobs.length > 0 && jobs.every(j => j.status === 'completed');
  const isCompressing = jobs.some(j => j.status === 'processing');

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center group hover:border-emerald-400 transition-colors relative mb-8">
        <input 
          type="file" 
          multiple 
          accept="image/jpeg,image/png"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={onFileChange}
        />
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Compress Images (MB to KB)</h3>
        <p className="text-slate-500 max-w-sm mx-auto">Upload JPEG or PNG files. We optimize them while preserving visual quality.</p>
      </div>

      {jobs.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-slate-700 flex justify-between">
                <span>Optimization Level (Quality Preservation)</span>
                <span className="text-emerald-600">{level}%</span>
              </label>
              <input 
                type="range" min="10" max="95" value={level} 
                onChange={(e) => setLevel(parseInt(e.target.value))}
                disabled={isCompressing}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>Maximum Compression</span>
                <span>Maximum Quality</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100">
                ✨ High-Quality Lossless
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {jobs.map(job => (
              <FileJobCard key={job.id} job={job} onRemove={removeJob} />
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-6">
            {allCompleted && jobs.length > 1 && (
              <button 
                onClick={downloadAll}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Icons.Download />
                Download All Optimized
              </button>
            )}
            
            {isAnyQueued && (
              <button 
                onClick={startCompression}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Compress Now
                <Icons.ArrowRight />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ConverterView: React.FC<{ 
  jobs: FileJob[], 
  addJob: (f: File) => void, 
  removeJob: (id: string) => void,
  startConversion: () => void,
  targetFormat: string,
  setTargetFormat: (format: string) => void,
  downloadAll: () => void
}> = ({ jobs, addJob, removeJob, startConversion, targetFormat, setTargetFormat, downloadAll }) => {
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(addJob);
    }
  };

  const isAnyQueued = jobs.some(j => j.status === 'queued');
  const allCompleted = jobs.length > 0 && jobs.every(j => j.status === 'completed');
  const isConverting = jobs.some(j => j.status === 'processing');

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center group hover:border-blue-400 transition-colors relative">
        <input 
          type="file" 
          multiple 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={onFileChange}
        />
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Select Files to Convert</h3>
        <p className="text-slate-500 max-w-sm mx-auto">Drag & drop files here, or click to browse from your computer or cloud storage.</p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
            <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-4 h-4" alt="Drive" />
            Google Drive
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
            <img src="https://cdn-icons-png.flaticon.com/512/732/732221.png" className="w-4 h-4" alt="Dropbox" />
            Dropbox
          </button>
        </div>
      </div>

      {jobs.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-700">{jobs.length} Files Ready</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Convert to</span>
              <select 
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                disabled={isConverting}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="PDF">PDF</option>
                <option value="WEBP">WEBP</option>
                <option value="DOCX">DOCX</option>
                <option value="JPG">JPG</option>
                <option value="PNG">PNG</option>
                <option value="MP4">MP4</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            {jobs.map(job => (
              <FileJobCard key={job.id} job={job} onRemove={removeJob} />
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-6">
            {allCompleted && jobs.length > 1 && (
              <button 
                onClick={downloadAll}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:bg-green-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                Download All (ZIP)
              </button>
            )}
            
            {isAnyQueued && (
              <button 
                onClick={startConversion}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Convert All Files
                <Icons.ArrowRight />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardView: React.FC<{ setRoute: (r: AppRoute) => void }> = ({ setRoute }) => {
  const stats = [
    { label: 'Active Jobs', value: '0', color: 'blue' },
    { label: 'Files Processed', value: '1,248', color: 'green' },
    { label: 'Storage Used', value: '4.2 GB', color: 'purple' },
    { label: 'Est. CO2 Saved', value: '12kg', color: 'emerald' },
  ];

  const tools = [
    { name: 'Merge PDF', desc: 'Combine multiple PDFs into one.', icon: '📄', route: AppRoute.TOOLS },
    { name: 'Compress Image', desc: 'Reduce file size without losing quality.', icon: '🖼️', route: AppRoute.COMPRESSOR },
    { name: 'Video to GIF', desc: 'Convert short clips to animated GIFs.', icon: '🎥', route: AppRoute.CONVERTER },
    { name: 'OCR Text', desc: 'Extract text from scanned images using AI.', icon: '✨', route: AppRoute.TOOLS },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 text-left">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold text-slate-800`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-600 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="text-3xl font-bold">Try AI Smart Conversion</h2>
          <p className="text-blue-100">Use Gemini-powered OCR and summarizing tools to process your documents with professional intelligence.</p>
          <button 
            onClick={() => setRoute(AppRoute.CONVERTER)}
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-xl hover:bg-blue-50 transition-colors"
          >
            Start Converting
          </button>
        </div>
        <div className="flex-1 flex justify-center relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 w-full max-w-xs rotate-3">
             <div className="space-y-3">
               <div className="h-4 bg-white/20 rounded w-3/4"></div>
               <div className="h-4 bg-white/20 rounded w-1/2"></div>
               <div className="h-4 bg-white/20 rounded w-5/6"></div>
             </div>
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Popular Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((t, idx) => (
            <div 
              key={idx} 
              onClick={() => setRoute(t.route)}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">{t.icon}</div>
              <h4 className="font-bold text-slate-800 mb-2">{t.name}</h4>
              <p className="text-sm text-slate-500">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const URLToPDFView: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string, content: string } | null>(null);

  const handleConvert = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await geminiService.fetchWebsiteContent(url);
      setResult(res);
    } catch (e) {
      alert("Failed to fetch website content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 text-left">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Convert Website to PDF / Markdown</h3>
        <p className="text-slate-500 mb-6">Enter a public URL to extract its content into a professional document.</p>
        <div className="flex gap-4">
          <input 
            type="url" 
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <button 
            onClick={handleConvert}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Fetch Content'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-slate-800">{result.title}</h4>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Download PDF</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Save as Markdown</button>
            </div>
          </div>
          <div className="p-8 prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-600 font-mono text-sm leading-relaxed">
              {result.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- App Entry ---

export default function App() {
  const [route, setRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [jobs, setJobs] = useState<FileJob[]>([]);
  const [globalTargetFormat, setGlobalTargetFormat] = useState('PDF');

  // Reset jobs when switching modules to keep views clean
  useEffect(() => {
    setJobs([]);
  }, [route]);

  const addJob = (file: File) => {
    const ext = file.name.split('.').pop() || '';
    const newJob: FileJob = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      extension: ext,
      status: 'queued',
      progress: 0,
      targetFormat: route === AppRoute.COMPRESSOR ? ext.toUpperCase() : globalTargetFormat
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const updateGlobalTargetFormat = (format: string) => {
    setGlobalTargetFormat(format);
    setJobs(prev => prev.map(job => 
      job.status === 'queued' ? { ...job, targetFormat: format } : job
    ));
  };

  const startProcessing = useCallback(() => {
    setJobs(prev => prev.map(job => 
      job.status === 'queued' ? { ...job, status: 'processing' as FileStatus } : job
    ));

    const interval = setInterval(() => {
      setJobs(prev => {
        const stillProcessing = prev.some(j => j.status === 'processing' && j.progress < 100);
        if (!stillProcessing) {
          clearInterval(interval);
          return prev;
        }

        return prev.map(job => {
          if (job.status === 'processing' && job.progress < 100) {
            const nextProgress = Math.min(100, job.progress + Math.floor(Math.random() * 25) + 5);
            const isCompleted = nextProgress === 100;
            
            // Mock output size reduction if in compressor mode (MB to KB)
            let outputSize = job.outputSize;
            if (isCompleted && route === AppRoute.COMPRESSOR) {
              // Simulate significant size reduction (e.g., 2MB to 150KB)
              outputSize = Math.floor(job.size * 0.05 + Math.random() * 50000); 
            }

            return {
              ...job,
              progress: nextProgress,
              status: isCompleted ? 'completed' : 'processing',
              outputUrl: isCompleted ? '#' : undefined,
              outputSize
            } as FileJob;
          }
          return job;
        });
      });
    }, 800);
  }, [route]);

  const downloadAllAsZip = () => {
    const link = document.createElement('a');
    const label = route === AppRoute.COMPRESSOR ? 'optimized_images' : 'converted_files';
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Bulk download of ' + jobs.length + ' processed files');
    link.download = `cloudfile_pro_${label}_` + Date.now() + ".zip";
    link.click();
    alert(`Preparing your ZIP archive with ${jobs.length} items. Your download will begin shortly.`);
  };

  const renderContent = () => {
    switch(route) {
      case AppRoute.DASHBOARD: return <DashboardView setRoute={setRoute} />;
      case AppRoute.CONVERTER: return (
        <ConverterView 
          jobs={jobs} 
          addJob={addJob} 
          removeJob={removeJob} 
          startConversion={startProcessing} 
          targetFormat={globalTargetFormat}
          setTargetFormat={updateGlobalTargetFormat}
          downloadAll={downloadAllAsZip}
        />
      );
      case AppRoute.COMPRESSOR: return (
        <CompressorView 
          jobs={jobs} 
          addJob={addJob} 
          removeJob={removeJob} 
          startCompression={startProcessing} 
          downloadAll={downloadAllAsZip}
        />
      );
      case AppRoute.URL_TO_PDF: return <URLToPDFView />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <Icons.File />
          <p className="mt-4 text-lg">Module "{route}" is under development.</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pl-64 transition-all">
      <Sidebar currentRoute={route} setRoute={setRoute} />
      <div className="flex flex-col min-h-screen">
        <Header title={route.charAt(0).toUpperCase() + route.slice(1).replace('-', ' ')} />
        <main className="flex-1 p-8 text-center md:text-left">
          {renderContent()}
        </main>
        
        <footer className="px-8 py-6 text-center text-slate-400 text-xs border-t border-slate-200">
          <p>© 2024 CloudFile Pro. All files are automatically deleted after 24 hours. No data is stored permanently.</p>
          <div className="mt-2 flex justify-center gap-4">
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
            <a href="#" className="hover:text-slate-600">API Documentation</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
