import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Camera, Sparkles, Activity } from 'lucide-react';

interface AIFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIFormModal: React.FC<AIFormModalProps> = ({ isOpen, onClose }) => {
  const [activeJointAngle, setActiveJointAngle] = useState('88°');
  const [formScore, setFormScore] = useState(94);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="font-display font-bold text-base text-[#1B1C1C]">
              AI Kinetic Form Coach
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

        {/* Video / Pose Tracker Viewfinder */}
        <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80"
            alt="AI Form Tracking"
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />

          {/* SVG Skeletal Pose Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 400 300"
          >
            {/* Skeletal lines */}
            <line x1="200" y1="90" x2="160" y2="120" stroke="#10b981" strokeWidth="3" />
            <line x1="200" y1="90" x2="240" y2="120" stroke="#10b981" strokeWidth="3" />
            <line x1="160" y1="120" x2="150" y2="170" stroke="#10b981" strokeWidth="3" />
            <line x1="240" y1="120" x2="250" y2="170" stroke="#10b981" strokeWidth="3" />
            <line x1="200" y1="90" x2="200" y2="190" stroke="#10b981" strokeWidth="3" />
            <line x1="200" y1="190" x2="170" y2="230" stroke="#10b981" strokeWidth="3" />
            <line x1="200" y1="190" x2="230" y2="230" stroke="#10b981" strokeWidth="3" />
            <line x1="170" y1="230" x2="170" y2="280" stroke="#10b981" strokeWidth="3" />
            <line x1="230" y1="230" x2="230" y2="280" stroke="#10b981" strokeWidth="3" />

            {/* Joints */}
            {[
              [200, 70], // Head
              [200, 90], // Neck
              [160, 120], // Left Shoulder
              [240, 120], // Right Shoulder
              [150, 170], // Left Hand
              [250, 170], // Right Hand
              [200, 190], // Pelvis
              [170, 230], // Left Knee
              [230, 230], // Right Knee
              [170, 280], // Left Ankle
              [230, 280], // Right Ankle
            ].map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="5"
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth="2"
              />
            ))}
          </svg>

          {/* Form Score Badge */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-white text-xs font-mono flex items-center gap-1.5">
            <Activity size={13} className="text-emerald-400" />
            <span>DEPTH: {formScore}% OPTIMAL</span>
          </div>

          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-white text-xs font-mono">
            <span>KNEE: {activeJointAngle}</span>
          </div>
        </div>

        {/* Biomechanical Telemetry Checklist */}
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="text-[10px] font-mono uppercase text-[#767676] font-semibold">
            BIOMECHANICAL REAL-TIME ANALYSIS
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#FBF9F9] border border-[#E5E5E5] text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="font-medium text-[#1B1C1C]">Spine & Neck Neutral</span>
              </div>
              <span className="font-mono text-emerald-700 font-semibold">180° Checked</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#FBF9F9] border border-[#E5E5E5] text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="font-medium text-[#1B1C1C]">Knees Tracking Over Toes</span>
              </div>
              <span className="font-mono text-emerald-700 font-semibold">Zero Valgus</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#FBF9F9] border border-[#E5E5E5] text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                <span className="font-medium text-[#1B1C1C]">Elbow Flare on Press</span>
              </div>
              <span className="font-mono text-amber-700 font-semibold">Tuck 5° In</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-2 py-2.5 bg-[#242424] hover:bg-[#1B1C1C] text-white font-display font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors"
          >
            Resume Live Session
          </button>
        </div>
      </div>
    </div>
  );
};
