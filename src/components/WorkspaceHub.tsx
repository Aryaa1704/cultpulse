import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  Users,
  Mail,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Send,
  Check,
  AlertTriangle,
  FileText,
  Clock,
  ChevronRight,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logout, getAccessToken } from '../services/googleAuth';
import {
  listDriveFiles,
  uploadFileToDrive,
  deleteDriveFile,
  createFitnessSpreadsheet,
  listCalendarEvents,
  createCalendarWorkoutEvent,
  deleteCalendarEvent,
  listGoogleContacts,
  sendGmailMessage,
  DriveFile,
  CalendarEvent,
  ContactPerson,
} from '../services/workspaceApi';
import { MealSection, WorkoutProtocol, AnalyticsData } from '../types';

interface WorkspaceHubProps {
  currentDate: string;
  mealSections: MealSection[];
  activeCalories: number;
  waterMl: number;
  analyticsData: AnalyticsData;
  protocols: WorkoutProtocol[];
  onClose?: () => void;
}

type WorkspaceTab = 'drive' | 'sheets' | 'calendar' | 'contacts' | 'gmail';

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  currentDate,
  mealSections,
  activeCalories,
  waterMl,
  analyticsData,
  protocols,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('drive');

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  // Sheets state
  const [activeSheetUrl, setActiveSheetUrl] = useState<string | null>(null);
  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedProtocolForEvent, setSelectedProtocolForEvent] = useState(protocols[0]?.title || 'HIIT Session');
  const [eventDateTime, setEventDateTime] = useState('2026-10-25T08:00');
  // Contacts state
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  // Gmail state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState(`CultPulse Daily Performance Log - ${currentDate}`);
  const [emailBody, setEmailBody] = useState('');

  // Confirmation Modal state for destructive / mutating actions
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Initialize email body when data changes
  useEffect(() => {
    const totalFoodKcal = mealSections.reduce((acc, s) => acc + s.calories, 0);
    const totalProtein = mealSections.reduce((acc, s) => acc + s.protein, 0);
    const body = `CultPulse Performance Log - ${currentDate}
----------------------------------------
Athlete: ${analyticsData.athlete.name}
Streak: ${analyticsData.athlete.streakDays} Days
Active Output: ${activeCalories} kcal
Food Logged: ${totalFoodKcal} kcal (Protein: ${totalProtein}g)
Hydration: ${waterMl} ml / 3000 ml
Current Weight: ${analyticsData.lifetime.currentWeightKg} kg

Meal Breakdown:
${mealSections
  .map(
    (s) =>
      `• ${s.title.toUpperCase()} (${s.calories} kcal): ${
        s.items.length > 0 ? s.items.map((i) => i.name).join(', ') : 'No items logged'
      }`
  )
  .join('\n')}

Generated via CultPulse Workspace Integration`;
    setEmailBody(body);
  }, [currentDate, mealSections, activeCalories, waterMl, analyticsData]);

  // Handle Sign-In
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setToken(res.accessToken);
        if (res.user.email) {
          setRecipientEmail(res.user.email);
        }
        setActionSuccess('Connected to Google Workspace!');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setToken(null);
    setDriveFiles([]);
    setCalendarEvents([]);
    setContacts([]);
    setActionSuccess('Signed out of Google Workspace');
  };

  // Load active tab data
  useEffect(() => {
    if (!token) return;
    loadTabData(activeTab);
  }, [activeTab, token]);

  const loadTabData = async (tab: WorkspaceTab) => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (tab === 'drive') {
        const files = await listDriveFiles(token);
        setDriveFiles(files);
      } else if (tab === 'calendar') {
        const events = await listCalendarEvents(token);
        setCalendarEvents(events);
      } else if (tab === 'contacts') {
        const people = await listGoogleContacts(token);
        setContacts(people);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error communicating with Google API');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Drive Actions ---
  const handleBackupToDrive = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const summaryData = {
        date: currentDate,
        athlete: analyticsData.athlete.name,
        streakDays: analyticsData.athlete.streakDays,
        caloriesBurned: activeCalories,
        waterIntakeMl: waterMl,
        nutrition: mealSections,
        exportedAt: new Date().toISOString(),
      };
      const filename = `CultPulse-Log-${currentDate.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      await uploadFileToDrive(token, filename, JSON.stringify(summaryData, null, 2), 'application/json');
      setActionSuccess(`Uploaded "${filename}" to Google Drive`);
      const files = await listDriveFiles(token);
      setDriveFiles(files);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload log to Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const requestDeleteFile = (file: DriveFile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Google Drive File?',
      description: `Are you sure you want to permanently delete "${file.name}" from your Google Drive? This action cannot be undone.`,
      onConfirm: async () => {
        if (!token) return;
        setIsLoading(true);
        try {
          await deleteDriveFile(token, file.id);
          setActionSuccess(`Deleted "${file.name}" from Google Drive`);
          setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to delete file');
        } finally {
          setIsLoading(false);
          setConfirmModal(null);
        }
      },
    });
  };

  // --- Sheets Actions ---
  const handleExportToSheets = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const rows: (string | number)[][] = [
        ['Date', 'Category', 'Item Name', 'Calories (kcal)', 'Carbs (g)', 'Protein (g)', 'Fats (g)'],
      ];

      mealSections.forEach((section) => {
        section.items.forEach((item) => {
          rows.push([
            currentDate,
            section.title,
            item.name,
            item.calories,
            item.carbs,
            item.protein,
            item.fats,
          ]);
        });
      });

      // Add Burn synced row
      rows.push([currentDate, 'Workout Output', 'CultPulse Active Session', activeCalories, 0, 0, 0]);

      const res = await createFitnessSpreadsheet(
        token,
        `CultPulse Fitness & Macros - ${currentDate}`,
        rows
      );

      setActiveSheetUrl(res.spreadsheetUrl);
      setActionSuccess('Spreadsheet created and synced successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to export to Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calendar Actions ---
  const handleScheduleWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    try {
      const start = new Date(eventDateTime);
      const end = new Date(start.getTime() + 45 * 60 * 1000); // 45 min duration

      await createCalendarWorkoutEvent(
        token,
        `⚡ CultPulse: ${selectedProtocolForEvent}`,
        `Scheduled training routine from CultPulse fitness app.\nProtocol: ${selectedProtocolForEvent}\nTarget Burn: 350-450 kcal`,
        start.toISOString(),
        end.toISOString()
      );

      setActionSuccess(`Scheduled "${selectedProtocolForEvent}" on Google Calendar`);
      const events = await listCalendarEvents(token);
      setCalendarEvents(events);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to schedule calendar event');
    } finally {
      setIsLoading(false);
    }
  };

  const requestDeleteEvent = (event: CalendarEvent) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Calendar Workout?',
      description: `Remove "${event.summary}" from your Google Calendar?`,
      onConfirm: async () => {
        if (!token) return;
        setIsLoading(true);
        try {
          await deleteCalendarEvent(token, event.id);
          setActionSuccess('Workout event removed from Google Calendar');
          setCalendarEvents((prev) => prev.filter((ev) => ev.id !== event.id));
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to delete event');
        } finally {
          setIsLoading(false);
          setConfirmModal(null);
        }
      },
    });
  };

  // --- Gmail Actions ---
  const requestSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return;

    setConfirmModal({
      isOpen: true,
      title: 'Send Performance Log via Gmail?',
      description: `Send email with daily workout and nutrition summary to "${recipientEmail}"?`,
      onConfirm: async () => {
        if (!token) return;
        setIsLoading(true);
        try {
          await sendGmailMessage(token, recipientEmail, emailSubject, emailBody);
          setActionSuccess(`Email sent successfully to ${recipientEmail}`);
        } catch (err: any) {
          setErrorMessage(err.message || 'Failed to send Gmail message');
        } finally {
          setIsLoading(false);
          setConfirmModal(null);
        }
      },
    });
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.displayName.toLowerCase().includes(contactSearch.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(contactSearch.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-28">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#242424] text-white flex items-center justify-center font-display font-bold">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-[#1B1C1C]">
                  Google Workspace
                </h2>
                <span className="px-2 py-0.2 bg-[#F2F2F2] border border-[#E5E5E5] text-[10px] font-mono font-semibold rounded-xs">
                  5 APIs ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#767676]">
                Google Drive • Sheets • Calendar • Contacts • Gmail
              </p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E5] hover:border-red-400 text-xs text-[#767676] hover:text-red-600 transition-colors"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </div>
          ) : null}
        </div>

        {/* User Status Bar */}
        {currentUser && (
          <div className="mt-3 pt-3 border-t border-[#F2F2F2] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <UserIcon size={14} className="text-[#767676]" />
              )}
              <span className="font-medium text-[#1B1C1C] truncate max-w-[200px]">
                {currentUser.displayName || currentUser.email}
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>OAuth Authenticated</span>
            </div>
          </div>
        )}
      </div>

      {/* Action / Error Alerts */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check size={14} className="shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-700 hover:text-red-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Unauthenticated State */}
      {!currentUser && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 text-center shadow-2xs space-y-4">
          <div className="max-w-sm mx-auto space-y-2">
            <h3 className="font-display font-bold text-lg text-[#1B1C1C]">
              Connect Your Google Account
            </h3>
            <p className="text-xs text-[#767676] leading-relaxed">
              Enable CultPulse to seamlessly sync workouts with <strong>Google Calendar</strong>,
              archive nutrition logs to <strong>Google Drive</strong>, stream metrics into{' '}
              <strong>Google Sheets</strong>, invite workout partners from{' '}
              <strong>Contacts</strong>, and email coaching summaries via <strong>Gmail</strong>.
            </p>
          </div>

          {/* Official Google Sign-In Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center justify-center gap-3 px-6 py-2.5 bg-white border border-[#747775] hover:bg-[#F8F9FA] rounded-full text-sm font-medium text-[#1F1F1F] shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-5 h-5"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>

          <div className="pt-2 text-[11px] font-mono text-[#767676]">
            Secure token flow with in-memory persistence
          </div>
        </div>
      )}

      {/* Authenticated Workspace Hub Tabs */}
      {currentUser && (
        <div className="space-y-4">
          {/* Navigation Pill Bar (5 services) */}
          <div className="grid grid-cols-5 gap-1.5 bg-white p-1.5 border border-[#E5E5E5] rounded-xl shadow-2xs">
            {[
              { id: 'drive', label: 'Drive', icon: FolderGit2 },
              { id: 'sheets', label: 'Sheets', icon: FileSpreadsheet },
              { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
              { id: 'contacts', label: 'Contacts', icon: Users },
              { id: 'gmail', label: 'Gmail', icon: Mail },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as WorkspaceTab)}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                    isActive
                      ? 'bg-[#242424] text-white'
                      : 'text-[#767676] hover:bg-[#F2F2F2] hover:text-[#1B1C1C]'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-[10px]">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* 1. DRIVE TAB */}
          {activeTab === 'drive' && (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-[#1B1C1C]">
                    Google Drive Storage
                  </h3>
                  <p className="text-xs text-[#767676]">
                    Backup daily nutrition logs & telemetry files
                  </p>
                </div>
                <button
                  onClick={() => loadTabData('drive')}
                  disabled={isLoading}
                  className="p-1.5 rounded-md border border-[#E5E5E5] hover:bg-[#F2F2F2] text-[#767676]"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Action Banner */}
              <div className="p-4 rounded-xl bg-[#FBF9F9] border border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-xs text-[#1B1C1C]">
                    Backup Today's Session & Food Diary
                  </div>
                  <div className="text-[11px] text-[#767676]">
                    Saves JSON payload directly to your Google Drive root folder
                  </div>
                </div>
                <button
                  onClick={handleBackupToDrive}
                  disabled={isLoading}
                  className="py-2 px-3 bg-[#242424] hover:bg-[#1B1C1C] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Upload size={14} />
                  <span>Upload to Drive</span>
                </button>
              </div>

              {/* File list */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-mono uppercase text-[#767676]">
                  RECENT GOOGLE DRIVE FILES ({driveFiles.length})
                </div>

                {driveFiles.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#767676] bg-[#FBF9F9] rounded-xl border border-dashed border-[#E5E5E5]">
                    No files found or loading Drive files...
                  </div>
                ) : (
                  <div className="divide-y divide-[#F2F2F2] max-h-72 overflow-y-auto pr-1">
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="py-2.5 flex items-center justify-between text-xs group"
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <FileText size={16} className="text-[#767676] shrink-0" />
                          <div className="truncate">
                            <div className="font-medium text-[#1B1C1C] truncate">{file.name}</div>
                            <div className="text-[10px] text-[#767676]">
                              {file.modifiedTime
                                ? new Date(file.modifiedTime).toLocaleDateString()
                                : 'Recent'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded text-[#767676] hover:text-[#1B1C1C]"
                              title="Open in Google Drive"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => requestDeleteFile(file)}
                            className="p-1 rounded text-[#767676] hover:text-red-600"
                            title="Delete file"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. SHEETS TAB */}
          {activeTab === 'sheets' && (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-2xs space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-[#1B1C1C]">
                  Google Sheets Synchronizer
                </h3>
                <p className="text-xs text-[#767676]">
                  Export nutritional tables, daily caloric burn, and macro ratios
                </p>
              </div>

              <div className="p-4 bg-[#FBF9F9] border border-[#E5E5E5] rounded-xl space-y-3">
                <div className="text-xs text-[#1B1C1C] font-semibold">
                  Live Spreadsheet Export
                </div>
                <p className="text-xs text-[#767676]">
                  Exports {mealSections.reduce((acc, s) => acc + s.items.length, 0)} logged food
                  items, macro distributions, and active energy burn into a structured Google
                  Sheet.
                </p>

                <div className="pt-1 flex flex-wrap gap-2">
                  <button
                    onClick={handleExportToSheets}
                    disabled={isLoading}
                    className="py-2.5 px-4 bg-[#242424] hover:bg-[#1B1C1C] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <FileSpreadsheet size={15} />
                    <span>Create & Sync Spreadsheet</span>
                  </button>

                  {activeSheetUrl && (
                    <a
                      href={activeSheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-4 border border-[#E5E5E5] bg-white hover:bg-[#F2F2F2] text-[#1B1C1C] rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <ExternalLink size={15} />
                      <span>Open in Google Sheets</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#767676]">
                  CURRENT LOG DATA PREVIEW
                </div>
                <div className="border border-[#E5E5E5] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F2F2F2] border-b border-[#E5E5E5] text-[10px] font-mono uppercase text-[#767676]">
                      <tr>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Item</th>
                        <th className="py-2 px-3 text-right">KCAL</th>
                        <th className="py-2 px-3 text-right">Protein</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {mealSections.flatMap((sec) =>
                        sec.items.map((item) => (
                          <tr key={item.id} className="hover:bg-[#FBF9F9]">
                            <td className="py-2 px-3 capitalize font-medium text-[#767676]">
                              {sec.title}
                            </td>
                            <td className="py-2 px-3 text-[#1B1C1C]">{item.name}</td>
                            <td className="py-2 px-3 text-right font-mono font-semibold">
                              {item.calories}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-[#767676]">
                              {item.protein}g
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-[#1B1C1C]">
                    Google Calendar Scheduling
                  </h3>
                  <p className="text-xs text-[#767676]">
                    Plan workouts and sync alarms directly with your primary calendar
                  </p>
                </div>
                <button
                  onClick={() => loadTabData('calendar')}
                  disabled={isLoading}
                  className="p-1.5 rounded-md border border-[#E5E5E5] hover:bg-[#F2F2F2] text-[#767676]"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Schedule Form */}
              <form
                onSubmit={handleScheduleWorkout}
                className="p-4 bg-[#FBF9F9] border border-[#E5E5E5] rounded-xl space-y-3 text-xs"
              >
                <div className="font-semibold text-xs text-[#1B1C1C]">
                  Schedule New Training Session
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#767676] mb-1">
                      Workout Protocol
                    </label>
                    <select
                      value={selectedProtocolForEvent}
                      onChange={(e) => setSelectedProtocolForEvent(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E5] rounded-lg px-2.5 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
                    >
                      {protocols.map((p) => (
                        <option key={p.id} value={p.title}>
                          {p.title} ({p.durationMinutes}m)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#767676] mb-1">
                      Date & Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={eventDateTime}
                      onChange={(e) => setEventDateTime(e.target.value)}
                      className="w-full bg-white border border-[#E5E5E5] rounded-lg px-2.5 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2.5 px-4 bg-[#242424] hover:bg-[#1B1C1C] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add to Google Calendar</span>
                </button>
              </form>

              {/* Upcoming Events */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-mono uppercase text-[#767676]">
                  UPCOMING CALENDAR SESSIONS ({calendarEvents.length})
                </div>

                {calendarEvents.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#767676] bg-[#FBF9F9] rounded-xl border border-dashed border-[#E5E5E5]">
                    No upcoming events found on primary calendar.
                  </div>
                ) : (
                  <div className="divide-y divide-[#F2F2F2] max-h-64 overflow-y-auto pr-1">
                    {calendarEvents.map((event) => (
                      <div
                        key={event.id}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-[#1B1C1C] truncate">
                            {event.summary}
                          </div>
                          <div className="text-[11px] text-[#767676] flex items-center gap-1.5 mt-0.5">
                            <Clock size={12} />
                            <span>
                              {event.start.dateTime
                                ? new Date(event.start.dateTime).toLocaleString()
                                : event.start.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {event.htmlLink && (
                            <a
                              href={event.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded text-[#767676] hover:text-[#1B1C1C]"
                              title="Open in Google Calendar"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => requestDeleteEvent(event)}
                            className="p-1 rounded text-[#767676] hover:text-red-600"
                            title="Delete event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. CONTACTS TAB */}
          {activeTab === 'contacts' && (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-[#1B1C1C]">
                    Google Contacts (People API)
                  </h3>
                  <p className="text-xs text-[#767676]">
                    Select workout buddies, trainers, and accountability coaches
                  </p>
                </div>
                <button
                  onClick={() => loadTabData('contacts')}
                  disabled={isLoading}
                  className="p-1.5 rounded-md border border-[#E5E5E5] hover:bg-[#F2F2F2] text-[#767676]"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search contacts by name or email..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
              />

              {/* Contact list */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase text-[#767676]">
                  SYNCED CONTACTS ({filteredContacts.length})
                </div>

                {filteredContacts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#767676] bg-[#FBF9F9] rounded-xl border border-dashed border-[#E5E5E5]">
                    No contacts found.
                  </div>
                ) : (
                  <div className="divide-y divide-[#F2F2F2] max-h-72 overflow-y-auto pr-1">
                    {filteredContacts.map((c) => (
                      <div
                        key={c.resourceName}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3 truncate pr-2">
                          {c.photoUrl ? (
                            <img
                              src={c.photoUrl}
                              alt={c.displayName}
                              className="w-8 h-8 rounded-full object-cover border border-[#E5E5E5]"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[#767676] font-semibold text-xs">
                              {c.displayName[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="truncate">
                            <div className="font-semibold text-[#1B1C1C] truncate">
                              {c.displayName}
                            </div>
                            <div className="text-[11px] text-[#767676] truncate">
                              {c.email || c.phone || 'No email attached'}
                            </div>
                          </div>
                        </div>

                        {c.email && (
                          <button
                            onClick={() => {
                              setRecipientEmail(c.email!);
                              setActiveTab('gmail');
                            }}
                            className="py-1 px-2.5 bg-[#F2F2F2] hover:bg-[#242424] hover:text-white rounded-md text-[11px] font-semibold text-[#242424] transition-colors"
                          >
                            Send Report
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. GMAIL TAB */}
          {activeTab === 'gmail' && (
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-2xs space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-[#1B1C1C]">
                  Gmail Delivery
                </h3>
                <p className="text-xs text-[#767676]">
                  Dispatch workout telemetry & nutrition logs to coaches and partners
                </p>
              </div>

              <form onSubmit={requestSendEmail} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#767676] mb-1">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="coach@example.com or partner@gmail.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#767676] mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-[#242424]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#767676] mb-1">
                    Message Body (Auto-Generated Summary)
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full font-mono bg-[#FBF9F9] border border-[#E5E5E5] rounded-lg p-3 text-[11px] focus:outline-hidden focus:border-[#242424]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-2.5 px-4 bg-[#242424] hover:bg-[#1B1C1C] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Send size={14} />
                  <span>Send via Gmail</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Mutating / Destructive actions */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-[#1B1C1C]">
                  {confirmModal.title}
                </h4>
                <p className="text-xs text-[#767676] mt-1 leading-relaxed">
                  {confirmModal.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F2F2F2]">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="py-1.5 px-3 rounded-lg border border-[#E5E5E5] hover:bg-[#F2F2F2] text-xs font-medium text-[#4A4A4A] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="py-1.5 px-3 rounded-lg bg-[#242424] hover:bg-red-700 text-xs font-medium text-white transition-colors"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
