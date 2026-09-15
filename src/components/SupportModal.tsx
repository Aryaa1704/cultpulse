import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Copy,
  Check,
  Send,
  LifeBuoy,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  PUBLIC_SUPPORT_EMAIL,
  submitSupportTicket,
  SupportTicket,
} from '../services/securityEngine';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  userName?: string | null;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName,
}) => {
  const [copied, setCopied] = useState(false);
  const [formRenderTime, setFormRenderTime] = useState<number>(Date.now());
  const [category, setCategory] = useState<SupportTicket['category']>('GENERAL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState(userName || '');
  const [senderEmail, setSenderEmail] = useState(userEmail || '');
  
  // Anti-bot Honeypot trap (Hidden from legitimate humans)
  const [honeypot, setHoneypot] = useState('');

  // Anti-bot Interactive Challenge
  const [challengeNum1, setChallengeNum1] = useState(4);
  const [challengeNum2, setChallengeNum2] = useState(3);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeError, setChallengeError] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormRenderTime(Date.now());
      setFormError(null);
      setSubmittedTicketId(null);
      // Generate randomized human challenge
      const n1 = Math.floor(Math.random() * 8) + 2;
      const n2 = Math.floor(Math.random() * 7) + 1;
      setChallengeNum1(n1);
      setChallengeNum2(n2);
      setChallengeAnswer('');
      setChallengeError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSendDirectMail = () => {
    const encodedSubject = encodeURIComponent(subject ? `[CultPulse Support] ${subject}` : '[CultPulse Support] Help Request');
    const encodedBody = encodeURIComponent(
      `Hello CultPulse Support Team,\n\n${message || 'I have a question regarding the CultPulse application:'}\n\nFrom: ${senderName || 'Athlete'}\nEmail: ${senderEmail || 'N/A'}`
    );
    window.location.href = `mailto:${PUBLIC_SUPPORT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Human challenge validation
    const expected = challengeNum1 + challengeNum2;
    if (parseInt(challengeAnswer.trim(), 10) !== expected) {
      setChallengeError(true);
      setFormError('Anti-Bot Security: Incorrect math verification answer. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSupportTicket({
        category,
        subject,
        message,
        senderName,
        senderEmail,
        honeypotVal: honeypot,
        formRenderTime,
      });

      if (res.success && res.ticketId) {
        setSubmittedTicketId(res.ticketId);
        setSubject('');
        setMessage('');
      } else {
        setFormError(res.error || 'Failed to submit ticket. Please try emailing us directly.');
      }
    } catch {
      setFormError('An unexpected network error occurred. Please contact support via direct email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How does Google Workspace sync work?',
      a: 'CultPulse connects via OAuth to Google Drive, Sheets, and Calendar to automatically log workouts, nutrition summaries, and sync schedules without saving your files on third-party servers.',
    },
    {
      q: 'Is my personal health data private?',
      a: 'Yes. CultPulse utilizes local-first client architecture with zero public data sharing. Your personal records and calories are stored securely in your isolated profile.',
    },
    {
      q: 'How fast does the support team reply?',
      a: `Our support team reviews tickets directly sent to ${PUBLIC_SUPPORT_EMAIL} within 24 business hours.`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-gradient-to-r from-neutral-50 via-white to-amber-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#242424] text-white flex items-center justify-center shadow-xs">
              <LifeBuoy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-[#1B1C1C]">
                  Help & Support Center
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} />
                  <span>Bot-Protected</span>
                </span>
              </div>
              <p className="text-xs text-[#767676]">
                Direct assistance from the CultPulse support team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg border border-[#E5E5E5] hover:border-[#242424] text-[#767676] hover:text-[#1B1C1C] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Official Email Banner */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold tracking-wider text-amber-800 uppercase flex items-center gap-1">
                  <Mail size={12} />
                  <span>Official Support Channel</span>
                </div>
                <div className="font-mono font-bold text-base text-[#1B1C1C] select-all">
                  {PUBLIC_SUPPORT_EMAIL}
                </div>
                <p className="text-xs text-[#555] leading-relaxed">
                  Have an issue, bug report, or feature request? Email us anytime.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-mono font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Email'}</span>
                </button>
                <button
                  onClick={handleSendDirectMail}
                  className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-black text-white text-xs font-display font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Send size={12} />
                  <span>Send Mail</span>
                </button>
              </div>
            </div>
          </div>

          {/* Success State */}
          {submittedTicketId ? (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-emerald-900">
                  Support Ticket Created!
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Your ticket ID is <strong className="font-mono font-bold">{submittedTicketId}</strong>.
                  Our team will review your inquiry and follow up at <strong>{senderEmail}</strong>.
                </p>
              </div>
              <button
                onClick={() => setSubmittedTicketId(null)}
                className="mt-2 px-4 py-2 bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            /* Ticket Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#1B1C1C] uppercase tracking-wider">
                  In-App Support Ticket
                </span>
                <span className="text-[10px] text-[#767676] flex items-center gap-1">
                  <Clock size={11} />
                  <span>Typical response &lt; 24h</span>
                </span>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Invisible Honeypot Trap - Invisible to humans, bots auto-fill it */}
              <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                <label htmlFor="_website_bot_trap">Do not fill this field</label>
                <input
                  type="text"
                  id="_website_bot_trap"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-mono text-[#767676] uppercase tracking-wider mb-1">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'GENERAL', label: '❓ General Question' },
                    { id: 'BUG', label: '🐛 Bug / Issue' },
                    { id: 'SYNC', label: '🔄 Google Sync' },
                    { id: 'ACCOUNT', label: '👤 Account & Login' },
                    { id: 'FEATURE', label: '💡 Feature Idea' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id as SupportTicket['category'])}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        category === cat.id
                          ? 'bg-[#1B1C1C] text-white border-[#1B1C1C] shadow-2xs'
                          : 'bg-[#F9F9F9] text-[#4A4A4A] border-[#E5E5E5] hover:border-[#767676]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#767676] uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Athlete Name"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs focus:outline-hidden focus:border-[#242424]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#767676] uppercase tracking-wider mb-1">
                    Your Reply Email
                  </label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs focus:outline-hidden focus:border-[#242424]"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-mono text-[#767676] uppercase tracking-wider mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Issue syncing nutrition to Google Sheets"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs focus:outline-hidden focus:border-[#242424]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-mono text-[#767676] uppercase tracking-wider mb-1">
                  Message Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe what happened and how we can assist you..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-xs focus:outline-hidden focus:border-[#242424] resize-none"
                />
              </div>

              {/* Anti-Bot Human Verification Challenge */}
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1B1C1C]">Anti-Bot Verification: </span>
                    <span className="font-mono text-neutral-600">
                      What is {challengeNum1} + {challengeNum2}?
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    placeholder="Answer"
                    value={challengeAnswer}
                    onChange={(e) => {
                      setChallengeAnswer(e.target.value);
                      setChallengeError(false);
                    }}
                    className={`w-24 px-2.5 py-1.5 text-center text-xs font-mono font-bold rounded-md border ${
                      challengeError ? 'border-rose-400 bg-rose-50' : 'border-[#D0D0D0] bg-white'
                    } focus:outline-hidden focus:border-[#242424]`}
                  />
                  <span className="text-[10px] text-neutral-400 font-mono">Humans only</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-[#1E1E1E] hover:bg-black text-white text-xs font-display font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Securing & Transmitting...' : 'Submit Support Ticket'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendDirectMail}
                  title="Open mail app directly"
                  className="py-2.5 px-3 rounded-xl border border-[#E5E5E5] hover:border-[#242424] text-[#242424] text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  <span>Email App</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick FAQ Accordion */}
          <div className="pt-2 border-t border-[#E5E5E5] space-y-2">
            <span className="text-[11px] font-mono font-bold text-[#767676] uppercase tracking-wider">
              Frequently Asked Questions
            </span>
            <div className="space-y-1.5">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-[#E5E5E5] rounded-lg overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-[#1B1C1C] flex items-center justify-between hover:bg-[#F9F9F9]"
                  >
                    <span>{faq.q}</span>
                    {activeFaq === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {activeFaq === idx && (
                    <div className="px-3 pb-2.5 pt-1 text-[11px] text-[#555] bg-[#FBFBFB] border-t border-[#EAEAEA] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Anti-Hacking Security Badge */}
          <div className="p-2.5 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-between text-[10px] text-neutral-600 font-mono">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-600" />
              <span>CultPulse Sentinel: End-to-end Input Sanitization & Anti-Scraper Active</span>
            </div>
            <span className="text-emerald-700 font-bold">● SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
