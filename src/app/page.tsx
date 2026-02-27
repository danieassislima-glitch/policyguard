"use client";

import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Upload, 
  FileText, 
  Type as TypeIcon, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  History,
  BookOpen,
  LayoutDashboard,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeComplianceAction, testCaptionSafetyAction } from '../lib/gemini';
import { AnalysisResult, ComplianceDecision } from '../types/compliance';
import Markdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'caption-tester' | 'history' | 'policy'>('dashboard');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [script, setScript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const runAnalysis = async () => {
    if (!videoFile && !caption && !script) {
      setError("Please provide at least one input (Video, Caption, or Script).");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      let videoBase64;
      if (videoFile) {
        videoBase64 = await fileToBase64(videoFile);
      }
      const data = await analyzeComplianceAction(videoBase64, caption, script);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runCaptionTest = async (testText: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await testCaptionSafetyAction(testText);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Caption test failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-black/5 flex flex-col">
        <div className="p-6 border-bottom border-black/5">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            <span>V2 COMPLIANCE</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-black/40 font-semibold mt-1">TikTok Shop Safety Engine</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setResult(null); }}
          />
          <SidebarItem 
            icon={<Search className="w-5 h-5" />} 
            label="Caption Tester" 
            active={activeTab === 'caption-tester'} 
            onClick={() => { setActiveTab('caption-tester'); setResult(null); }}
          />
          <SidebarItem 
            icon={<History className="w-5 h-5" />} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
          />
          <SidebarItem 
            icon={<BookOpen className="w-5 h-5" />} 
            label="Policy Guide" 
            active={activeTab === 'policy'} 
            onClick={() => setActiveTab('policy')}
          />
        </nav>

        <div className="p-6 border-t border-black/5">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Account Status</p>
            <p className="text-sm font-medium text-emerald-900">Protected by V2</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="font-semibold text-lg">
            {activeTab === 'dashboard' && "Multimodal Analysis"}
            {activeTab === 'caption-tester' && "Test Caption Safety"}
            {activeTab === 'history' && "Analysis History"}
            {activeTab === 'policy' && "TikTok Shop Policy Reference"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <RefreshCw className="w-5 h-5 text-black/40" />
            </button>
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold">
              RV
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {!result ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
                        <label className="block text-sm font-bold uppercase tracking-wider text-black/60 mb-4">1. Video Content</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
                            videoPreview ? "border-emerald-500/50 bg-emerald-50/30" : "border-black/10 hover:border-black/20 bg-black/[0.02]"
                          )}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="video/*" 
                            onChange={handleVideoUpload}
                          />
                          {videoPreview ? (
                            <video src={videoPreview} className="w-full h-full object-cover rounded-lg" controls onClick={(e) => e.stopPropagation()} />
                          ) : (
                            <>
                              <Upload className="w-10 h-10 text-black/20 mb-3" />
                              <p className="text-sm font-medium text-black/60">Drop video here or click to upload</p>
                              <p className="text-xs text-black/40 mt-1">MP4, MOV supported</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
                        <label className="block text-sm font-bold uppercase tracking-wider text-black/60 mb-4">2. Caption & Script</label>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-black/40 uppercase tracking-widest">
                              <TypeIcon className="w-3 h-3" />
                              <span>Caption / Description</span>
                            </div>
                            <textarea 
                              value={caption}
                              onChange={(e) => setCaption(e.target.value)}
                              placeholder="Paste your TikTok caption here..."
                              className="w-full h-24 bg-black/[0.02] border border-black/5 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-black/40 uppercase tracking-widest">
                              <FileText className="w-3 h-3" />
                              <span>Video Script (Optional)</span>
                            </div>
                            <textarea 
                              value={script}
                              onChange={(e) => setScript(e.target.value)}
                              placeholder="Paste the spoken script here for deeper analysis..."
                              className="w-full h-32 bg-black/[0.02] border border-black/5 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={runAnalysis}
                        disabled={isAnalyzing}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-all disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>ANALYZING COMPLIANCE...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-5 h-5" />
                            <span>RUN V2 SAFETY CHECK</span>
                          </>
                        )}
                      </button>
                      {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
                    </div>

                    {/* Guidelines Sidebar */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-4">V2 Analysis Scope</h3>
                        <ul className="space-y-3">
                          <AnalysisScopeItem label="Misleading Claims" active />
                          <AnalysisScopeItem label="Transformation Narratives" active />
                          <AnalysisScopeItem label="Health/Beauty Claims" active />
                          <AnalysisScopeItem label="Time-based Results" active />
                          <AnalysisScopeItem label="Absolute Language" active />
                          <AnalysisScopeItem label="Regulated Categories" active />
                        </ul>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-amber-900 text-sm">Conservative Mode Active</h4>
                            <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                              V2 prioritizes account safety. If a claim is borderline, it will be flagged for changes to prevent potential shadowbans or strikes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <AnalysisDashboard result={result} onReset={() => setResult(null)} />
                )}
              </motion.div>
            )}

            {activeTab === 'caption-tester' && (
              <motion.div 
                key="caption-tester"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
                  <h3 className="text-xl font-bold mb-2">Test Caption Safety</h3>
                  <p className="text-sm text-black/40 mb-6">Quickly verify if your product description or caption follows TikTok Shop policies.</p>
                  
                  <textarea 
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Paste your caption here..."
                    className="w-full h-48 bg-black/[0.02] border border-black/5 rounded-xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none mb-6"
                  />

                  <button 
                    onClick={() => runCaptionTest(caption)}
                    disabled={isAnalyzing || !caption}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-all disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>TESTING CAPTION...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>CHECK CAPTION COMPLIANCE</span>
                      </>
                    )}
                  </button>
                </div>

                {result && activeTab === 'caption-tester' && (
                  <div className="space-y-6">
                    <div className={cn(
                      "rounded-2xl p-6 border flex items-center justify-between",
                      result.decision === ComplianceDecision.SAFE ? "bg-emerald-50 border-emerald-200" :
                      result.decision === ComplianceDecision.CHANGES ? "bg-amber-50 border-amber-200" :
                      "bg-red-50 border-red-200"
                    )}>
                      <div className="flex items-center gap-4">
                        {result.decision === ComplianceDecision.SAFE ? <CheckCircle2 className="w-8 h-8 text-emerald-600" /> :
                         result.decision === ComplianceDecision.CHANGES ? <AlertTriangle className="w-8 h-8 text-amber-600" /> :
                         <XCircle className="w-8 h-8 text-red-600" />}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest opacity-60">Compliance Status</p>
                          <h4 className="text-xl font-bold">{result.decision}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60">Risk Score</p>
                        <p className="text-2xl font-black">{result.overallRiskScore}/100</p>
                      </div>
                    </div>

                    {result.saferCaption && (
                      <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Safe Rewrite Recommendation
                        </h4>
                        <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-100 italic text-emerald-900">
                          "{result.saferCaption}"
                        </div>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(result.saferCaption || ''); }}
                          className="mt-4 text-xs font-bold text-emerald-700 hover:underline"
                        >
                          COPY REWRITE
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <div className="text-center py-20">
                <History className="w-16 h-16 text-black/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold">No Analysis History</h3>
                <p className="text-black/40 mt-2">Your recent compliance checks will appear here.</p>
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5 space-y-8">
                <h3 className="text-2xl font-bold">TikTok Shop Policy Reference</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PolicyCard 
                    title="Misleading Claims" 
                    desc="Prohibits exaggerated product effects, unrealistic promises, and falsified results."
                    examples={["'Instant weight loss'", "'Cures all diseases'", "'Guaranteed results'"]}
                  />
                  <PolicyCard 
                    title="Transformation Narratives" 
                    desc="Visual or verbal before-and-after comparisons are strictly prohibited in many categories."
                    examples={["Side-by-side skin photos", "'Look at me before using this'"]}
                  />
                  <PolicyCard 
                    title="Absolute Language" 
                    desc="Avoid using superlative or definitive terms that cannot be objectively proven."
                    examples={["'The best in the world'", "'Only product that works'", "'100% effective'"]}
                  />
                  <PolicyCard 
                    title="Regulated Categories" 
                    desc="Supplements, cosmetics, and medical devices require specific disclaimers and verified claims."
                    examples={["FDA disclaimers", "Ingredient transparency"]}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
        active ? "bg-black text-white shadow-lg shadow-black/10" : "text-black/60 hover:bg-black/5"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function AnalysisScopeItem({ label, active }: { label: string, active?: boolean }) {
  return (
    <li className="flex items-center gap-3 text-sm font-medium">
      <div className={cn("w-2 h-2 rounded-full", active ? "bg-emerald-500" : "bg-black/10")} />
      <span className={active ? "text-black/80" : "text-black/40"}>{label}</span>
      {active && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />}
    </li>
  );
}

function PolicyCard({ title, desc, examples }: { title: string, desc: string, examples: string[] }) {
  return (
    <div className="p-6 rounded-xl border border-black/5 bg-black/[0.01]">
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-sm text-black/60 mb-4">{desc}</p>
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/60">Restricted Examples:</p>
        <ul className="space-y-1">
          {examples.map((ex, i) => (
            <li key={i} className="text-xs text-black/40 flex items-center gap-2">
              <span className="w-1 h-1 bg-black/20 rounded-full" />
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AnalysisDashboard({ result, onReset }: { result: AnalysisResult, onReset: () => void }) {
  const decisionColor = 
    result.decision === ComplianceDecision.SAFE ? "bg-emerald-600" :
    result.decision === ComplianceDecision.CHANGES ? "bg-amber-500" :
    "bg-red-600";

  const decisionIcon = 
    result.decision === ComplianceDecision.SAFE ? <ShieldCheck className="w-12 h-12" /> :
    result.decision === ComplianceDecision.CHANGES ? <ShieldAlert className="w-12 h-12" /> :
    <ShieldX className="w-12 h-12" />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Big Banner */}
      <div className={cn("rounded-3xl p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8", decisionColor)}>
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
            {decisionIcon}
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Final Decision</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{result.decision}</h1>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center min-w-[160px]">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Overall Risk</p>
          <p className="text-5xl font-black">{result.overallRiskScore}<span className="text-xl opacity-60">/100</span></p>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard label="Video Risk" score={result.videoRiskScore} />
        <ScoreCard label="Caption Risk" score={result.captionRiskScore} />
        <ScoreCard label="Category" value={result.categoryDetected} isText />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Flags & Reasoning */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Flagged Segments & Claims
            </h3>
            {result.flaggedSegments.length > 0 ? (
              <div className="space-y-4">
                {result.flaggedSegments.map((flag, i) => (
                  <div key={i} className="p-4 rounded-xl border border-black/5 bg-black/[0.02] flex gap-4">
                    <div className={cn(
                      "w-1 shrink-0 rounded-full",
                      flag.severity === 'HIGH' ? "bg-red-500" : flag.severity === 'MEDIUM' ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
                          {flag.timestamp ? `Timestamp: ${flag.timestamp}` : flag.policyViolation}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          flag.severity === 'HIGH' ? "bg-red-100 text-red-700" : flag.severity === 'MEDIUM' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {flag.severity} RISK
                        </span>
                      </div>
                      <p className="text-sm font-bold text-black/80 mb-1">{flag.text || "Visual/Narrative Flag"}</p>
                      <p className="text-sm text-black/60">{flag.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-emerald-900">No high-risk segments detected</p>
                <p className="text-xs text-emerald-700/70">Content appears to follow general safety guidelines.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
            <h3 className="text-xl font-bold mb-4">Detailed Reasoning</h3>
            <div className="prose prose-sm max-w-none text-black/70 leading-relaxed">
              <Markdown>{result.reasoning}</Markdown>
            </div>
          </div>
        </div>

        {/* Right Column: Fixes & Rewrites */}
        <div className="space-y-8">
          <div className="bg-black text-white rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Actionable Fixes
            </h3>
            <ul className="space-y-4">
              {result.requiredFixes.map((fix, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-400">{i + 1}</span>
                  </div>
                  <span className="opacity-90">{fix}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.saferCaption && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black/40 mb-4">Safer Caption Rewrite</h3>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 italic text-sm text-emerald-900 leading-relaxed">
                "{result.saferCaption}"
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(result.saferCaption || '')}
                className="mt-4 w-full py-2 text-xs font-bold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all"
              >
                COPY REWRITE
              </button>
            </div>
          )}

          {result.saferScript && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black/40 mb-4">Safer Script Rewrite</h3>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 italic text-sm text-blue-900 leading-relaxed">
                "{result.saferScript}"
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(result.saferScript || '')}
                className="mt-4 w-full py-2 text-xs font-bold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all"
              >
                COPY REWRITE
              </button>
            </div>
          )}

          <button 
            onClick={onReset}
            className="w-full py-4 rounded-2xl border-2 border-black/5 font-bold text-black/40 hover:bg-black/5 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            NEW ANALYSIS
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, score, value, isText }: { label: string, score?: number, value?: string, isText?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">{label}</p>
      {isText ? (
        <p className="text-xl font-bold text-black/80 truncate">{value}</p>
      ) : (
        <div className="flex items-end gap-2">
          <p className="text-3xl font-black text-black/80">{score}</p>
          <div className="flex-1 h-2 bg-black/5 rounded-full mb-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              className={cn(
                "h-full rounded-full",
                (score || 0) > 60 ? "bg-red-500" : (score || 0) > 30 ? "bg-amber-500" : "bg-emerald-500"
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
