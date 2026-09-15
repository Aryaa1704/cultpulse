import React, { useState, useEffect } from 'react';
import { X, Barcode, Check, RefreshCw } from 'lucide-react';
import { MealItem } from '../types';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogItem: (sectionId: string, item: MealItem) => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ isOpen, onClose, onLogItem }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [detectedItem, setDetectedItem] = useState<MealItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setDetectedItem(null);
      const timer = setTimeout(() => {
        setIsScanning(false);
        setDetectedItem({
          id: `scanned-${Date.now()}`,
          name: 'Icelandic Vanilla Skyr (Organic)',
          portion: '1 tub (170g)',
          calories: 130,
          carbs: 11,
          protein: 17,
          fats: 0.5,
          image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=160&auto=format&fit=crop&q=80',
        });
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (detectedItem) {
      onLogItem('snacks', detectedItem);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Barcode size={18} className="text-[#242424]" />
            <h2 className="font-display font-bold text-base text-[#1B1C1C]">
              Barcode Scanner
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

        {/* Viewfinder simulation */}
        <div className="relative bg-black p-6 flex items-center justify-center aspect-square">
          <div className="relative w-48 h-48 border-2 border-white/60 rounded-xl overflow-hidden flex flex-col items-center justify-center">
            {/* Corner guides */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white"></div>

            {/* Laser Line */}
            {isScanning && (
              <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-bounce"></div>
            )}

            <Barcode size={64} className="text-white/40" />
            <span className="text-[10px] font-mono text-white/70 mt-2">
              {isScanning ? 'Align code within frame...' : 'Barcode Verified'}
            </span>
          </div>
        </div>

        {/* Recognition Result */}
        <div className="p-4 space-y-3">
          {isScanning ? (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-[#767676]">
              <RefreshCw size={14} className="animate-spin" />
              <span>Querying FDA Nutritional Index...</span>
            </div>
          ) : detectedItem ? (
            <div className="space-y-3">
              <div className="p-3 bg-[#FBF9F9] border border-[#E5E5E5] rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-[#1B1C1C]">
                    {detectedItem.name}
                  </div>
                  <div className="text-[11px] text-[#767676]">
                    {detectedItem.portion} • {detectedItem.carbs}g C • {detectedItem.protein}g P
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-sm text-[#1B1C1C]">
                    {detectedItem.calories}
                  </div>
                  <div className="text-[10px] text-[#767676]">kcal</div>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-2.5 bg-[#242424] hover:bg-[#1B1C1C] text-white font-display font-semibold text-xs tracking-wider uppercase rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Check size={14} />
                <span>Log to Snacks</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
