import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Barcode,
  Search,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
  Flame,
  Plus,
  Sliders,
  AlertCircle,
  HelpCircle,
  Layers,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  ChevronDown,
  Utensils,
  AlertTriangle,
  Tag,
  Lock,
  LogIn,
  Shield,
  Clock,
} from 'lucide-react';
import { MealItem } from '../types';
import {
  FoodDatabaseEntry,
  lookupFoodByBarcode,
} from '../data/foodDatabase';
import { useAppSettings } from '../services/appSettingsContext';
import {
  getUserAIQuotaStatus,
  consumeUserDailyScan,
  DAILY_SCAN_LIMIT,
  UserAIQuotaStatus,
} from '../services/aiUsageManager';
import { analyzePlatePhoto } from '../services/aiPlateAndRecipeService';

export interface AnalyzedPlateItem {
  id: string;
  name: string;
  quantityDescription: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  notes?: string;
  selected?: boolean;
}

export interface FoodAnalysisResult {
  mealName: string;
  dishType: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  confidence: string;
  items: AnalyzedPlateItem[];
  summary: string;
  healthTip: string;
  macronutrientInsight: string;
  dietaryFlags: string[];
  source: 'smart-vision' | 'nutrition-engine';
  cached?: boolean;
}

interface SmartFoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogItem: (sectionId: string, item: MealItem) => void;
  defaultSectionId?: string;
  userEmail?: string | null;
  userId?: string;
  onOpenAuth?: () => void;
}

export const SmartFoodScannerModal: React.FC<SmartFoodScannerModalProps> = ({
  isOpen,
  onClose,
  onLogItem,
  defaultSectionId = 'lunch',
  userEmail,
  userId,
  onOpenAuth,
}) => {
  const { t, language } = useAppSettings();
  const [activeMode, setActiveMode] = useState<'camera' | 'barcode'>('camera');
  const [selectedSection, setSelectedSection] = useState(defaultSectionId);

  // AI Fair-Usage & Daily Quota State
  const [quota, setQuota] = useState<UserAIQuotaStatus>(() =>
    getUserAIQuotaStatus(userId, userEmail)
  );

  useEffect(() => {
    setQuota(getUserAIQuotaStatus(userId, userEmail));
  }, [userId, userEmail, isOpen]);

  // Camera & Image state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [userNote, setUserNote] = useState('');

  // AI Vision Analysis result state
  const [aiAnalysis, setAiAnalysis] = useState<FoodAnalysisResult | null>(null);
  const [includedItems, setIncludedItems] = useState<Record<string, boolean>>({});
  const [logAsSeparateItems, setLogAsSeparateItems] = useState(false);

  // Barcode state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanningBarcodeAnimation, setScanningBarcodeAnimation] = useState(false);

  // Selected item from barcode with portion scaler
  const [matchedFood, setMatchedFood] = useState<FoodDatabaseEntry | null>(null);
  const [selectedServingIndex, setSelectedServingIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [scannerNotice, setScannerNotice] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // Request live camera stream
  const requestLiveCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Camera API is not supported by your browser environment. You can upload any meal photo directly below.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setCameraError(null);
      }
    } catch (err: any) {
      console.warn('Camera access denied or restricted:', err);
      setCameraActive(false);
      setCameraError(
        'Camera access was denied or restricted in this browser frame. Click "Upload Plate Photo" to analyze your food image.'
      );
    }
  };

  // Helper to downscale large camera photos to fast, optimal resolution
  const resizeImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.88));
          } else {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Capture current frame from camera as base64
  const captureCameraFrame = (): string | null => {
    if (!videoRef.current || !cameraActive) return null;
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      console.warn('Failed to capture frame from video:', e);
      return null;
    }
  };

  // Run Real Vision Analysis via Server API
  const runVisionAnalysis = async (imageData: string, hintNote?: string) => {
    // Quota Enforcement Guard
    if (quota.isGuest) {
      setScannerError('Member login is strictly required for optical plate recognition.');
      return;
    }

    if (quota.scansRemaining <= 0) {
      setScannerError(
        'Daily fair-usage limit reached (3/3 scans used today). Your 3 daily scans renew tomorrow at midnight.'
      );
      return;
    }

    setAnalyzingPhoto(true);
    setScannerNotice(null);
    setScannerError(null);
    setAiAnalysis(null);

    try {
      const data = await analyzePlatePhoto(
        imageData,
        hintNote || userNote,
        language || 'en'
      );

      if (!data || !data.items || data.items.length === 0) {
        throw new Error('Could not identify food items in this photo. Please ensure good lighting and clear view.');
      }

      setAiAnalysis(data);

      // Deduct from daily limit if not served from zero-cost optical cache
      if (userId && !data.cached) {
        consumeUserDailyScan(userId);
        setQuota(getUserAIQuotaStatus(userId, userEmail));
      }

      // Default all items to selected
      const initialSelection: Record<string, boolean> = {};
      data.items.forEach((item: any) => {
        initialSelection[item.id] = true;
      });
      setIncludedItems(initialSelection);
      setQuantity(1);

      if (data.cached) {
        setScannerNotice(
          `Optical Recognition verified (Cached Instant Result): "${data.mealName}" (~${data.totalCalories} kcal) • 0 Daily Scans Used!`
        );
      } else {
        setScannerNotice(
          `Optical Recognition verified: "${data.mealName}" (~${data.totalCalories} kcal) with ${data.confidence} confidence.`
        );
      }
    } catch (err: any) {
      console.error('Vision analysis error:', err);
      setAiAnalysis(null);
      const cleanMsg = err?.message && !err.message.includes('<!doctype')
        ? err.message
        : 'Optical vision engine was busy. Please click "Retry Scan" to try again.';
      setScannerError(cleanMsg);
    } finally {
      setAnalyzingPhoto(false);
    }
  };

  // Handle uploaded meal image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannerError(null);
    setScannerNotice(null);
    try {
      const resizedBase64 = await resizeImageFile(file);
      if (!resizedBase64) return;
      setUploadedImagePreview(resizedBase64);
      runVisionAnalysis(resizedBase64, userNote);
    } catch (err: any) {
      console.error('Failed to process image upload:', err);
      setScannerError('Failed to process file. Please try another image.');
    }
  };

  // Handle manual snap button
  const handleSnapButtonClick = () => {
    let imageToAnalyze = uploadedImagePreview;
    if (!imageToAnalyze && cameraActive) {
      imageToAnalyze = captureCameraFrame();
      if (imageToAnalyze) {
        setUploadedImagePreview(imageToAnalyze);
      }
    }

    if (!imageToAnalyze) {
      setScannerNotice('Please upload a meal photo or activate live camera first.');
      return;
    }

    runVisionAnalysis(imageToAnalyze, userNote);
  };

  // Barcode lookup
  const handleBarcodeLookup = (codeToTest?: string) => {
    const targetCode = codeToTest || barcodeInput;
    if (!targetCode.trim()) return;

    setScanningBarcodeAnimation(true);
    setTimeout(() => {
      setScanningBarcodeAnimation(false);
      const food = lookupFoodByBarcode(targetCode);
      if (food) {
        setMatchedFood(food);
        setSelectedServingIndex(0);
        setQuantity(1);
        setScannerNotice(`Barcode verified: [${food.barcode}] → ${food.name}`);
      } else {
        setScannerNotice(`Barcode ${targetCode} not found in database. Search from 100+ global foods below.`);
      }
    }, 600);
  };

  // Calculate dynamic totals for AI analysis based on active checkboxes and quantity
  const activeAiItems = (aiAnalysis?.items || []).filter((it) => includedItems[it.id] !== false);
  const aiCalculatedCalories = Math.round(
    activeAiItems.reduce((acc, it) => acc + it.calories, 0) * quantity
  );
  const aiCalculatedProtein =
    Math.round(activeAiItems.reduce((acc, it) => acc + it.protein, 0) * quantity * 10) / 10;
  const aiCalculatedCarbs =
    Math.round(activeAiItems.reduce((acc, it) => acc + it.carbs, 0) * quantity * 10) / 10;
  const aiCalculatedFats =
    Math.round(activeAiItems.reduce((acc, it) => acc + it.fats, 0) * quantity * 10) / 10;
  const aiCalculatedFiber =
    Math.round(activeAiItems.reduce((acc, it) => acc + it.fiber, 0) * quantity * 10) / 10;

  // Logging handler for AI Analysis
  const handleConfirmLogAiMeal = () => {
    if (!aiAnalysis) return;

    if (logAsSeparateItems && activeAiItems.length > 1) {
      // Log each plate component as an individual meal item
      activeAiItems.forEach((item) => {
        const itemCalories = Math.round(item.calories * quantity);
        const itemProtein = Math.round(item.protein * quantity * 10) / 10;
        const itemCarbs = Math.round(item.carbs * quantity * 10) / 10;
        const itemFats = Math.round(item.fats * quantity * 10) / 10;

        const mealItem: MealItem = {
          id: `ai-item-${Date.now()}-${item.id}`,
          name: `${item.name} (${item.quantityDescription}${quantity !== 1 ? ` × ${quantity}` : ''})`,
          portion: item.quantityDescription,
          calories: itemCalories,
          carbs: itemCarbs,
          protein: itemProtein,
          fats: itemFats,
        };
        onLogItem(selectedSection, mealItem);
      });
    } else {
      // Log as a single unified thali / plate item
      const itemNamesSummary = activeAiItems.map((i) => i.name.split(' ')[0]).join(', ');
      const mealItem: MealItem = {
        id: `ai-thali-${Date.now()}`,
        name: `${aiAnalysis.mealName} (${quantity > 1 ? `${quantity}x ` : ''}${itemNamesSummary})`,
        portion: `${activeAiItems.length} items (${quantity}x plate)`,
        calories: aiCalculatedCalories,
        carbs: aiCalculatedCarbs,
        protein: aiCalculatedProtein,
        fats: aiCalculatedFats,
        image: uploadedImagePreview || undefined,
      };
      onLogItem(selectedSection, mealItem);
    }

    onClose();
  };

  // Database item log handler
  const handleConfirmLogDatabase = () => {
    if (!matchedFood) return;
    const currentServing = matchedFood.servingSizes[selectedServingIndex] || {
      label: matchedFood.portion,
      grams: 100,
      multiplier: 1,
    };

    const itemToLog: MealItem = {
      id: `scanned-${Date.now()}`,
      name: `${matchedFood.name} (${quantity > 1 ? `${quantity}x ` : ''}${currentServing.label})`,
      portion: `${currentServing.grams * quantity}g`,
      calories: Math.round(matchedFood.calories * currentServing.multiplier * quantity),
      carbs: Math.round(matchedFood.carbs * currentServing.multiplier * quantity * 10) / 10,
      protein: Math.round(matchedFood.protein * currentServing.multiplier * quantity * 10) / 10,
      fats: Math.round(matchedFood.fats * currentServing.multiplier * quantity * 10) / 10,
      image: matchedFood.image,
    };

    onLogItem(selectedSection, itemToLog);
    onClose();
  };

  // Cleanup camera on unmount/close
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && activeMode === 'camera' && cameraActive) {
      // camera already requested
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, activeMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FBF9F9] dark:bg-[#161718] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col transition-colors">
        {/* Modal Header */}
        <div className="p-4 bg-white dark:bg-[#1C1D1F] border-b border-[#E5E5E5] dark:border-[#2C2D30] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#242424] dark:bg-amber-400 text-white dark:text-black flex items-center justify-center">
              <Camera size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base md:text-lg text-[#1B1C1C] dark:text-white">
                  Smart Food & Plate Vision Scanner
                </h2>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold rounded-full flex items-center gap-1">
                  <Sparkles size={10} />
                  AI VISION
                </span>
              </div>
              <p className="text-xs text-[#767676] dark:text-zinc-400">
                Real-time optical nutrition recognition for any regional or global food
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#767676] hover:text-[#1B1C1C] dark:text-zinc-400 dark:hover:text-white hover:bg-[#F2F2F2] dark:hover:bg-[#252629] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-2 bg-white dark:bg-[#1C1D1F] border-b border-[#E5E5E5] dark:border-[#2C2D30] flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'camera'
                ? 'bg-[#242424] dark:bg-amber-400 text-white dark:text-black shadow-2xs font-bold'
                : 'bg-[#F2F2F2] dark:bg-[#232427] text-[#4A4A4A] dark:text-zinc-300 hover:bg-[#EAEAEA]'
            }`}
          >
            <Camera size={14} />
            <span>Plate Optical Vision</span>
          </button>

          <button
            onClick={() => setActiveMode('barcode')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'barcode'
                ? 'bg-[#242424] dark:bg-amber-400 text-white dark:text-black shadow-2xs font-bold'
                : 'bg-[#F2F2F2] dark:bg-[#232427] text-[#4A4A4A] dark:text-zinc-300 hover:bg-[#EAEAEA]'
            }`}
          >
            <Barcode size={14} />
            <span>Barcode Scanner</span>
          </button>
        </div>

        {/* Fair-Usage Daily Quota Status Banner (Active for logged-in members) */}
        {activeMode === 'camera' && !quota.isGuest && (
          <div className="px-4 py-2 bg-[#F7F7F8] dark:bg-[#1A1B1E] border-b border-[#E5E5E5] dark:border-[#2C2D30] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  quota.scansRemaining > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="font-medium text-[#4A4A4A] dark:text-zinc-300">
                Daily Fair-Usage Quota:
              </span>
              <span
                className={`font-mono font-bold ${
                  quota.scansRemaining > 0
                    ? 'text-emerald-700 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {quota.scansRemaining} of {quota.limit} scans left today
              </span>
            </div>
            <span className="text-[11px] text-[#767676] dark:text-zinc-400 font-mono hidden sm:inline">
              Breakfast, Lunch, Dinner • Resets 00:00
            </span>
          </div>
        )}

        {/* Notice Toast */}
        {scannerNotice && (
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{scannerNotice}</span>
          </div>
        )}

        {/* Error Toast */}
        {scannerError && (
          <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="truncate">{scannerError}</span>
            </div>
            {uploadedImagePreview && !quota.isGuest && quota.scansRemaining > 0 && (
              <button
                onClick={() => runVisionAnalysis(uploadedImagePreview, userNote)}
                disabled={analyzingPhoto}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-md shrink-0 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={11} className={analyzingPhoto ? 'animate-spin' : ''} />
                <span>Retry Scan</span>
              </button>
            )}
          </div>
        )}

        {/* Mode Viewports */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* CAMERA / PHOTO VISION MODE */}
          {activeMode === 'camera' && (
            quota.isGuest ? (
              /* STRICT LOGIN REQUIRED CARD FOR GUEST VISITORS */
              <div className="p-6 md:p-8 flex flex-col items-center text-center space-y-4 max-w-md mx-auto my-6 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shadow-inner">
                  <Lock size={30} />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-lg text-[#1B1C1C] dark:text-white">
                    Member Login Required for Plate Vision
                  </h3>
                  <p className="text-xs text-[#767676] dark:text-zinc-400 leading-relaxed">
                    Guest visitors can freely scan barcodes or quick-log food. Optical plate recognition is reserved for verified members with 3 free daily scans (Breakfast, Lunch, Dinner).
                  </p>
                </div>

                <div className="w-full p-3.5 bg-white dark:bg-[#1D1E22] rounded-xl border border-[#E5E5E5] dark:border-zinc-800 text-left space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center gap-2 text-[#1B1C1C] dark:text-zinc-200 font-semibold">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>3 Daily Optical Plate Scans (Zero Spam Abuse)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1B1C1C] dark:text-zinc-200 font-semibold">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Instant Multi-Item Macro & Calorie Breakdown</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1B1C1C] dark:text-zinc-200 font-semibold">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Zero-Cost In-Memory Optical Caching for Repeated Foods</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth?.();
                    }}
                    className="w-full py-3 bg-[#242424] hover:bg-black dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-black font-display font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <LogIn size={15} />
                    <span>Sign In to Unlock AI Scanner</span>
                  </button>

                  <button
                    onClick={() => setActiveMode('barcode')}
                    className="w-full py-3 bg-[#F2F2F2] dark:bg-[#252629] text-[#4A4A4A] dark:text-zinc-300 hover:bg-[#EAEAEA] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Barcode size={15} />
                    <span>Use Barcode Scanner</span>
                  </button>
                </div>
              </div>
            ) : (
            <div className="space-y-4">
              {/* Photo Viewport Container */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-16/10 flex items-center justify-center border border-zinc-700 shadow-inner">
                {uploadedImagePreview ? (
                  <img
                    src={uploadedImagePreview}
                    alt="Uploaded meal"
                    className="w-full h-full object-cover"
                  />
                ) : cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <Camera size={38} className="mx-auto text-zinc-500" />
                    <div>
                      <p className="text-xs text-zinc-200 font-bold">
                        AI Plate Vision & Multi-Item Food Recognition
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
                        Upload or photograph any meal. Smart Vision AI accurately recognizes specific dishes
                        (Rajma Chawal, Dal Baati Churma, Puri Sabzi, Biryani, Roti Sabzi, salads, etc.), computes calories,
                        and breaks down every component on the plate.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        onClick={requestLiveCamera}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Camera size={13} />
                        <span>Activate Live Camera</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-zinc-600 transition-colors"
                      >
                        <Upload size={13} />
                        <span>Upload Meal Photo</span>
                      </button>
                    </div>

                    {cameraError && (
                      <div className="text-[10px] text-amber-300/90 max-w-sm mx-auto bg-amber-950/40 p-2 rounded-lg border border-amber-800/50">
                        {cameraError}
                      </div>
                    )}
                  </div>
                )}

                {/* Laser Reticle & Scan FX */}
                <div className="absolute inset-6 border border-white/30 rounded-xl pointer-events-none flex flex-col items-center justify-between p-3">
                  <div className="w-full flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-amber-400"></span>
                    <span className="w-4 h-4 border-t-2 border-r-2 border-amber-400"></span>
                  </div>
                  {analyzingPhoto && (
                    <div className="w-full h-1 bg-emerald-400 shadow-[0_0_16px_#34d399] animate-pulse"></div>
                  )}
                  <div className="w-full flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-amber-400"></span>
                    <span className="w-4 h-4 border-b-2 border-r-2 border-amber-400"></span>
                  </div>
                </div>

                {/* Bottom Overlay Controls */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                  <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-md text-[10px] font-mono text-zinc-300">
                    {analyzingPhoto
                      ? 'Analyzing Plate & Nutrition...'
                      : uploadedImagePreview
                      ? 'Plate Photo Loaded'
                      : cameraActive
                      ? 'Live Camera Stream'
                      : 'Standby'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-white text-[11px] font-medium rounded-lg backdrop-blur-md border border-zinc-600 flex items-center gap-1"
                    >
                      <Upload size={12} />
                      <span>{uploadedImagePreview ? 'Replace Photo' : 'Upload'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      onClick={handleSnapButtonClick}
                      disabled={analyzingPhoto || quota.scansRemaining <= 0}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {analyzingPhoto ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : quota.scansRemaining <= 0 ? (
                        <Clock size={13} />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      <span>
                        {analyzingPhoto
                          ? 'Analyzing...'
                          : quota.scansRemaining <= 0
                          ? 'Daily Limit Reached'
                          : 'Scan Plate Optical Vision'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Quota Exhausted Alert */}
              {quota.scansRemaining <= 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
                  <Clock size={16} className="shrink-0 text-amber-500" />
                  <div>
                    <span className="font-bold">Daily Fair-Usage Limit Reached (3/3 scans used today)</span>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                      Your 3 daily optical scans renew tonight at 12:00 AM midnight. You can continue using the Barcode Scanner or Quick Log unlimited times!
                    </p>
                  </div>
                </div>
              )}

              {/* AI MULTI-ITEM ANALYSIS RESULT CARD */}
              {aiAnalysis && (
                <div className="p-4 bg-white dark:bg-[#1C1D1F] border-2 border-emerald-500/40 rounded-2xl space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Plate Header & Total Kcal */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[9px] font-mono font-bold rounded-xs uppercase flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          AI VISION VERIFIED • {aiAnalysis.confidence}
                        </span>
                        <span className="text-[10px] text-[#767676] dark:text-zinc-400 font-mono">
                          {aiAnalysis.dishType}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-base md:text-lg text-[#1B1C1C] dark:text-white">
                        {aiAnalysis.mealName}
                      </h3>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {aiAnalysis.dietaryFlags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono rounded"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <div className="font-display font-bold text-2xl text-emerald-950 dark:text-emerald-300">
                        {aiCalculatedCalories}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 uppercase font-semibold">
                        Plate Total Kcal
                      </div>
                    </div>
                  </div>

                  {/* Macro Ratios Summary Bar */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 bg-[#FBF9F9] dark:bg-[#232427] rounded-lg border border-[#E5E5E5] dark:border-[#2C2D30]">
                        <div className="font-bold text-[#1B1C1C] dark:text-white">{aiCalculatedProtein}g</div>
                        <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                          PROTEIN
                        </div>
                      </div>
                      <div className="p-2 bg-[#FBF9F9] dark:bg-[#232427] rounded-lg border border-[#E5E5E5] dark:border-[#2C2D30]">
                        <div className="font-bold text-[#1B1C1C] dark:text-white">{aiCalculatedCarbs}g</div>
                        <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                          CARBS
                        </div>
                      </div>
                      <div className="p-2 bg-[#FBF9F9] dark:bg-[#232427] rounded-lg border border-[#E5E5E5] dark:border-[#2C2D30]">
                        <div className="font-bold text-[#1B1C1C] dark:text-white">{aiCalculatedFats}g</div>
                        <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
                          FATS
                        </div>
                      </div>
                      <div className="p-2 bg-[#FBF9F9] dark:bg-[#232427] rounded-lg border border-[#E5E5E5] dark:border-[#2C2D30]">
                        <div className="font-bold text-[#1B1C1C] dark:text-white">{aiCalculatedFiber}g</div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          FIBER
                        </div>
                      </div>
                    </div>

                    {/* Proportional Macro Distribution Visual Bar */}
                    <div className="w-full h-2 rounded-full overflow-hidden flex bg-zinc-200 dark:bg-zinc-800">
                      <div
                        style={{ width: `${(aiCalculatedProtein * 4 / Math.max(1, aiCalculatedCalories)) * 100}%` }}
                        className="bg-blue-500"
                        title="Protein"
                      ></div>
                      <div
                        style={{ width: `${(aiCalculatedCarbs * 4 / Math.max(1, aiCalculatedCalories)) * 100}%` }}
                        className="bg-amber-500"
                        title="Carbs"
                      ></div>
                      <div
                        style={{ width: `${(aiCalculatedFats * 9 / Math.max(1, aiCalculatedCalories)) * 100}%` }}
                        className="bg-rose-500"
                        title="Fats"
                      ></div>
                    </div>
                  </div>

                  {/* ITEM-BY-ITEM BREAKDOWN TABLE (Just like ChatGPT's table) */}
                  <div className="space-y-2 pt-2 border-t border-[#F2F2F2] dark:border-[#2A2B2E]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#1B1C1C] dark:text-white uppercase flex items-center gap-1.5">
                        <Layers size={13} className="text-amber-500" />
                        Plate Component Breakdown ({activeAiItems.length} items)
                      </span>
                      <span className="text-[10px] text-[#767676] dark:text-zinc-400">
                        Check/uncheck items you consumed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {aiAnalysis.items.map((item) => {
                        const isChecked = includedItems[item.id] !== false;
                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-xl border transition-all ${
                              isChecked
                                ? 'bg-[#FBF9F9] dark:bg-[#232427] border-[#E5E5E5] dark:border-[#383A3F]'
                                : 'bg-zinc-50 dark:bg-[#1A1B1D] border-dashed border-zinc-300 dark:border-zinc-800 opacity-60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) =>
                                    setIncludedItems((prev) => ({
                                      ...prev,
                                      [item.id]: e.target.checked,
                                    }))
                                  }
                                  className="mt-0.5 rounded text-amber-500 focus:ring-0 w-4 h-4"
                                />
                                <div>
                                  <div className="font-semibold text-xs text-[#1B1C1C] dark:text-white">
                                    {item.name}
                                  </div>
                                  <div className="text-[11px] font-mono text-[#767676] dark:text-zinc-400">
                                    Est. Portion: {item.quantityDescription}
                                  </div>
                                  {item.notes && (
                                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 italic">
                                      {item.notes}
                                    </div>
                                  )}
                                </div>
                              </label>

                              <div className="text-right shrink-0">
                                <div className="font-mono font-bold text-xs text-[#1B1C1C] dark:text-white">
                                  ~{Math.round(item.calories * quantity)} kcal
                                </div>
                                <div className="text-[10px] font-mono text-[#767676] dark:text-zinc-400">
                                  P: {Math.round(item.protein * quantity)}g • C: {Math.round(item.carbs * quantity)}g • F: {Math.round(item.fats * quantity)}g
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nutritionist Insights Box */}
                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-300">
                      <Info size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Clinical Nutritionist Insights</span>
                    </div>
                    <p className="text-[11px] text-amber-900 dark:text-amber-200/90 leading-relaxed">
                      {aiAnalysis.summary}
                    </p>
                    <div className="pt-1 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-950 dark:text-amber-300 font-medium">
                      <strong>Coach Tip:</strong> {aiAnalysis.healthTip}
                    </div>
                  </div>

                  {/* Portion & Quantity Scaler */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F2F2F2] dark:border-[#2A2B2E] text-xs">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#767676] dark:text-zinc-400 mb-1">
                        Portion Multiplier (Plate Size):
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[0.5, 1, 1.5, 2].map((mul) => (
                          <button
                            key={mul}
                            onClick={() => setQuantity(mul)}
                            className={`px-2.5 py-1.5 rounded-lg font-mono text-xs font-semibold flex-1 transition-colors ${
                              quantity === mul
                                ? 'bg-[#242424] dark:bg-amber-400 text-white dark:text-black shadow-xs'
                                : 'bg-[#F2F2F2] dark:bg-[#2A2B2E] text-[#1B1C1C] dark:text-white hover:bg-[#EAEAEA]'
                            }`}
                          >
                            {mul}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#767676] dark:text-zinc-400 mb-1">
                        Logging Format:
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-[#1B1C1C] dark:text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={logAsSeparateItems}
                            onChange={(e) => setLogAsSeparateItems(e.target.checked)}
                            className="rounded text-amber-500 focus:ring-0"
                          />
                          <span>Log items separately in diary</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Destination Meal Section Picker & Log Action */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#F2F2F2] dark:border-[#2A2B2E]">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[11px] font-mono text-[#767676] dark:text-zinc-400 uppercase">
                        Log into:
                      </span>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1B1C1C] dark:text-white"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snacks">Snacks</option>
                      </select>
                    </div>

                    <button
                      onClick={handleConfirmLogAiMeal}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#242424] dark:bg-amber-400 hover:bg-black dark:hover:bg-amber-500 text-white dark:text-black text-xs font-display font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <Check size={15} />
                      <span>
                        Log {aiCalculatedCalories} kcal to {selectedSection.toUpperCase()}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            )
          )}

          {/* BARCODE SCANNER MODE */}
          {activeMode === 'barcode' && (
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-[#1C1D1F] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Barcode size={20} className="text-[#242424] dark:text-amber-400" />
                  <h3 className="font-bold text-sm text-[#1B1C1C] dark:text-white">
                    Scan or Enter Packaged Product Barcode
                  </h3>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Enter 13-digit EAN / UPC (e.g. 8901030381099)"
                    className="flex-1 bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-xl px-3 py-2 text-xs font-mono text-[#1B1C1C] dark:text-white focus:outline-hidden"
                  />
                  <button
                    onClick={() => handleBarcodeLookup()}
                    disabled={scanningBarcodeAnimation || !barcodeInput.trim()}
                    className="px-4 py-2 bg-[#242424] dark:bg-amber-400 text-white dark:text-black font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {scanningBarcodeAnimation ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Search size={13} />
                    )}
                    <span>Verify</span>
                  </button>
                </div>

                {/* Quick demo barcodes */}
                <div className="pt-2 border-t border-[#F2F2F2] dark:border-[#2A2B2E]">
                  <div className="text-[10px] font-mono text-[#767676] dark:text-zinc-400 uppercase mb-2">
                    Quick Sample Barcodes:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Puri Sabzi Thali', code: '8901030381099' },
                      { label: 'Fresh Paneer (Amul)', code: '8901262010053' },
                      { label: 'Whey Protein Isolate', code: '748927028669' },
                      { label: 'Rolled Oats (Quaker)', code: '8901499008018' },
                    ].map((b) => (
                      <button
                        key={b.code}
                        onClick={() => {
                          setBarcodeInput(b.code);
                          handleBarcodeLookup(b.code);
                        }}
                        className="px-2.5 py-1 bg-[#FBF9F9] dark:bg-[#232427] text-[#1B1C1C] dark:text-zinc-200 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#2C2D30] hover:bg-[#F2F2F2]"
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SINGLE FOOD NUTRITION SCALER CARD (If selected from Barcode) */}
          {matchedFood && activeMode === 'barcode' && (
            <div className="p-4 bg-white dark:bg-[#1C1D1F] border-2 border-emerald-500/40 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-mono font-bold rounded-xs uppercase">
                      PRODUCT NUTRITION
                    </span>
                    <span className="text-[10px] text-[#767676] dark:text-zinc-400 font-mono">
                      Category: {matchedFood.category}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-[#1B1C1C] dark:text-white">
                    {matchedFood.name}
                  </h3>
                  <p className="text-xs text-[#767676] dark:text-zinc-400">
                    Standard Serving: {matchedFood.portion}
                  </p>
                </div>

                <div className="text-right bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
                  <div className="font-display font-bold text-xl text-emerald-950 dark:text-emerald-300">
                    {Math.round(
                      matchedFood.calories *
                        (matchedFood.servingSizes[selectedServingIndex]?.multiplier || 1) *
                        quantity
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 uppercase font-semibold">
                    Total Kcal
                  </div>
                </div>
              </div>

              {/* Serving Size & Multiplier Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#F2F2F2] dark:border-[#2A2B2E] text-xs">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#767676] dark:text-zinc-400 mb-1">
                    Select Serving Portion:
                  </label>
                  <select
                    value={selectedServingIndex}
                    onChange={(e) => setSelectedServingIndex(Number(e.target.value))}
                    className="w-full bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-lg p-2 text-xs font-semibold text-[#1B1C1C] dark:text-white focus:outline-hidden"
                  >
                    {matchedFood.servingSizes.map((s, idx) => (
                      <option key={idx} value={idx}>
                        {s.label} ({s.grams}g)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#767676] dark:text-zinc-400 mb-1">
                    Quantity / Number of Servings:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity((q) => Math.max(0.5, q - 0.5))}
                      className="w-8 h-8 rounded-lg bg-[#F2F2F2] dark:bg-[#2A2B2E] text-[#1B1C1C] dark:text-white hover:bg-[#EAEAEA] font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-bold text-sm text-[#1B1C1C] dark:text-white">
                      {quantity}x
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 0.5)}
                      className="w-8 h-8 rounded-lg bg-[#F2F2F2] dark:bg-[#2A2B2E] text-[#1B1C1C] dark:text-white hover:bg-[#EAEAEA] font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Log Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#F2F2F2] dark:border-[#2A2B2E]">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[11px] font-mono text-[#767676] dark:text-zinc-400 uppercase">
                    Log into:
                  </span>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="bg-[#FBF9F9] dark:bg-[#232427] border border-[#E5E5E5] dark:border-[#2C2D30] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1B1C1C] dark:text-white"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                  </select>
                </div>

                <button
                  onClick={handleConfirmLogDatabase}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#242424] dark:bg-amber-400 hover:bg-black dark:hover:bg-amber-500 text-white dark:text-black text-xs font-display font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Check size={14} />
                  <span>Log to {selectedSection.toUpperCase()}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
