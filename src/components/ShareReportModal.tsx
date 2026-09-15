import React, { useState } from 'react';
import { X, Copy, Check, Download, Share2 } from 'lucide-react';
import { AnalyticsData } from '../types';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalyticsData;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `CultPulse Performance Report - Alex Rivera\n🔥 7-Day Streak Active\n⚡ 24,850 kcal Total Output\n⏱ 42.5 hrs Training\n⚖️ 68.4 kg (-3.6 kg Net Change)\n🎯 96% Deficit Adherence`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-[#242424]" />
            <h2 className="font-display font-bold text-base text-[#1B1C1C]">
              Share Pulse Report
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-[#767676] hover:text-[#1B1C1C] hover:bg-[#F2F2F2]"
          >
            <X size={18} />
          </button>
        </div>

        {/* High-Resolution Report Card Preview */}
        <div className="p-5 space-y-4">
          <div className="p-5 bg-[#1B1C1C] text-white rounded-xl shadow-inner space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold text-[10px]">
                  CP
                </div>
                <span className="font-display font-bold tracking-tight text-sm">CultPulse</span>
              </div>
              <span className="text-[10px] font-mono text-white/70">W32 TELEMETRY</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <img
                src={data.athlete.avatarUrl}
                alt="Alex"
                className="w-10 h-10 rounded-full border border-white/30 object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-display font-bold text-sm">{data.athlete.name}</div>
                <div className="text-[10px] text-white/70">7-Day Perfect Adherence</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-xs">
              <div>
                <div className="text-[9px] font-mono text-white/60 uppercase">TOTAL SESSIONS</div>
                <div className="font-display font-bold text-base mt-0.5">
                  {data.lifetime.completedSessions}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-white/60 uppercase">OUTPUT BURN</div>
                <div className="font-display font-bold text-base mt-0.5">
                  {data.lifetime.totalOutputKcal.toLocaleString()} kcal
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-white/60 uppercase">WEIGHT DELTA</div>
                <div className="font-display font-bold text-base mt-0.5 text-emerald-400">
                  {data.lifetime.weightNetChangeKg} kg
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-white/60 uppercase">DEFICIT TARGET</div>
                <div className="font-display font-bold text-base mt-0.5">96% Met</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-lg border border-[#E5E5E5] bg-[#FBF9F9] hover:bg-[#F2F2F2] text-xs font-semibold text-[#242424] flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Metrics'}</span>
            </button>
            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-lg bg-[#242424] hover:bg-[#1B1C1C] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span>Export Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
