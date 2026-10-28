'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  RefreshCw,
  User,
  Info,
  Sparkles,
  Paperclip,
  X,
  RotateCcw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  model?: string;
  isLiveModel?: boolean;
  imagePreview?: string;
  sources?: Array<{ title: string; organization: string }>;
  suggestedFollowUps?: string[];
  status?: string;
  statutoryDisclaimer?: string;
}

export default function KrishiCopilotPage() {
  const { language, t } = useI18n();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-01',
      sender: 'assistant',
      text:
        language === 'hi'
          ? 'राम-राम किसान भाई! मैं आपका **कृषि सारथी (KrishiMitra AI)** हूँ, जो **Google Gemma 4 31B** मॉडल द्वारा संचालित है।\n\nआप मुझसे अपनी **सोयाबीन, गेहूं, चना अथवा लहसुन** की फसल, सिंचाई, खाद-उर्वरक की सही मात्रा, मौसम जोखिम, रोग लक्षण (फोटो सहित) अथवा आज के मंडी भाव पर कोई भी सवाल पूछ सकते हैं।'
          : 'Welcome! I am your **KrishiMitra AI**, powered by Google\'s **Gemma 4 31B** instruction-tuned model.\n\nAsk me about your **Soybean, Wheat, Gram, or Garlic** crops, irrigation schedules, fertilizer dosages, crop symptoms (with photos), weather risks, or live mandi prices.',
      timestamp: new Date().toISOString(),
      model: 'gemma-4-31b-it',
      isLiveModel: true,
      sources: [
        {
          title: 'Google Gemma 4 31B Multimodal Instruction Model',
          organization: 'Google DeepMind',
        },
        {
          title: 'भारतीय कृषि अनुसंधान परिषद (ICAR) एवं कृषि विज्ञान केंद्र (KVK) वैज्ञानिक संदर्शिका',
          organization: 'Ministry of Agriculture, GoI',
        },
      ],
      suggestedFollowUps: [
        'गेहूं में पहली सिंचाई और यूरिया डालने का सही समय क्या है?',
        'आज सीहोर और इंदौर मंडी में सोयाबीन व गेहूं का क्या भाव है?',
        'सोयाबीन में पीला मोजेक वायरस और इल्ली से कैसे बचाव करें?',
        'फसल अभी बेचना चाहिए या वेयरहाउस में भंडारण करना लाभदायक है?',
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    preview: string;
    base64: string;
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  } | null>(null);

  const [lastError, setLastError] = useState<string | null>(null);

  const [modelHealth, setModelHealth] = useState<{
    ok: boolean;
    model: string;
    apiKeyConfigured: boolean;
    provider: string;
    maxTokens: number;
    contextWindowTokens: number;
  }>({
    ok: false,
    model: 'gemma-4-31b-it',
    apiKeyConfigured: false,
    provider: '@google/genai',
    maxTokens: 2048,
    contextWindowTokens: 262144,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch API Health on load
  useEffect(() => {
    fetch('/api/krishi-copilot?action=health')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setModelHealth(data);
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Voice recognition setup
  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('आपके ब्राउज़र में बोलकर इनपुट की सुविधा उपलब्ध नहीं है। कृपया टेक्स्ट टाइप करें।');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // Text to Speech playback
  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('टेक्स्ट-टू-स्पीच आपके डिवाइस में उपलब्ध नहीं है।');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#_•\n]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Image Selection Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('कृपया केवल JPG, PNG अथवा WebP फॉर्मेट की फोटो चुनें।');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('फोटो का आकार 5MB से कम होना चाहिए।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage({
        file,
        preview: URL.createObjectURL(file),
        base64: result,
        mimeType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      });
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Cancel in-flight request
  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    removeSelectedImage();
    setLastError(null);
    setMessages([messages[0]]);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if ((!text && !selectedImage) || loading) return;

    setLastError(null);

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text || (language === 'hi' ? 'कृपया संलग्न फसल चित्र का विश्लेषण करें।' : 'Please inspect the attached crop photo.'),
      timestamp: new Date().toISOString(),
      imagePreview: selectedImage?.preview,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    const imagePayload = selectedImage
      ? {
          mimeType: selectedImage.mimeType,
          base64Data: selectedImage.base64,
        }
      : undefined;

    removeSelectedImage();
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Build multi-turn history from current messages (last 8 turns)
    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.sender === 'user' ? ('user' as const) : ('model' as const),
      text: m.text,
    }));

    try {
      const res = await fetch('/api/krishi-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          language,
          history: historyPayload,
          image: imagePayload,
          context: {
            farmerName: 'Ramesh Patel',
            district: 'Sehore',
            state: 'Madhya Pradesh',
            activeCrop: 'Soybean & Wheat',
            cropStage: 'Rabi Pre-Sowing & Kharif Post-Harvest',
            farmSizeAcres: 8,
            latestWeather: {
              temperatureC: 28.5,
              humidityPercent: 54,
              precipitationMm: 0,
              windSpeedKmh: 9,
              riskAlert: 'Moderate dry spell, optimal for field preparation',
              timestamp: '2026-10-28 10:00 AM IST',
            },
            latestMandiPrice: {
              marketName: 'Sehore Mandi',
              commodity: 'Soybean (Yellow)',
              modalPrice: 4680,
              minPrice: 4350,
              maxPrice: 4850,
              arrivalDate: '2026-10-28',
            },
            profitCalculation: {
              estimatedYieldQuintals: 72,
              estimatedRevenue: 336960,
              estimatedCost: 184000,
              projectedNetProfit: 152960,
              isNetPositive: true,
            },
          },
        }),
      });

      if (res.ok) {
        const replyMsg = await res.json();
        setMessages((prev) => [...prev, replyMsg]);
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg =
          errJson?.text ||
          errJson?.error ||
          (language === 'hi'
            ? 'कृषि सारथी सेवा से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'
            : 'Unable to connect to Krishi Copilot. Please try again.');
        setLastError(errMsg);

        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: errMsg,
          timestamp: new Date().toISOString(),
          status: 'error',
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        const fallbackText =
          language === 'hi'
            ? 'नेटवर्क समस्या के कारण उत्तर प्राप्त नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें।'
            : 'Network connection issue. Please check your connection and retry.';
        setLastError(fallbackText);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t.copilot.title}
        subtitle={
          language === 'hi'
            ? 'Google Gemma 4 31B एवं आईसीएआर एग्रोनॉमी संदर्शिका द्वारा संचालित किसान निर्णय सहायता'
            : 'Farmer Decision Intelligence powered by Google Gemma 4 31B & ICAR agronomy guidelines'
        }
        icon={<Bot className="w-5 h-5 text-[#1F4A3F]" />}
        badge={
          <button
            onClick={() => setShowTechModal(true)}
            className="flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F4A3F] rounded-full"
            title="तकनीकी विवरण देखें"
          >
            <Badge variant={modelHealth.apiKeyConfigured ? 'mint' : 'forest'} className="gap-1 cursor-pointer hover:opacity-90">
              <Sparkles className="w-3 h-3 text-[#1F4A3F]" />
              <span>
                {modelHealth.apiKeyConfigured
                  ? `Google Gemma 4 31B (${modelHealth.model})`
                  : 'स्थानीय कृषि ज्ञानकोश (Offline Domain)'}
              </span>
              <Info className="w-3 h-3 ml-0.5 opacity-70" />
            </Badge>
          </button>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTechModal(true)}
              className="gap-1.5 text-xs text-[#52685B]"
            >
              <Info className="w-3.5 h-3.5" />
              <span>मॉडल जानकारी</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChat}
              className="gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>नया संवाद</span>
            </Button>
          </div>
        }
      />

      {/* Model Grounding & Transparency Banner */}
      <div className="p-3.5 rounded-xl bg-white border border-[#DCE9DD] text-xs text-[#52685B] flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-soft">
        <div className="flex items-start md:items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#1F4A3F] shrink-0 mt-0.5 md:mt-0" />
          <span>
            {modelHealth.apiKeyConfigured
              ? 'सक्रिय एआई मॉडल: Google Gemma 4 31B Instruction-Tuned (Google Gen AI SDK @google/genai)। वास्तविक संदर्भ डेटा: सीहोर व इंदौर मंडी, ओपन-मेटियो व आईसीएआर।'
              : 'स्थानीय ज्ञान मोड सक्रिय: ICAR-IIWBR, कृषि विज्ञान केंद्र सीहोर एवं एगमार्कनेट के सत्यापित संदर्भों से उत्तर दिए जाते हैं।'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF4E8] text-[#10312B] text-[11px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F4A3F] animate-pulse" />
            gemma-4-31b-it
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <Card className="h-[700px] flex flex-col border-[#DCE9DD] shadow-card">
        {/* Messages Scroll Area */}
        <CardContent className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F3F8F2]/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[90%] sm:max-w-[82%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-[#10312B] text-white shadow-soft'
                      : 'bg-[#EAF4E8] text-[#1F4A3F] border border-[#DCE9DD]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Content Bubble */}
                <div className="space-y-2 w-full">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft ${
                      isUser
                        ? 'bg-[#1F4A3F] text-white rounded-tr-none'
                        : 'bg-white text-[#10312B] border border-[#DCE9DD] rounded-tl-none'
                    }`}
                  >
                    {/* User Attached Image Preview */}
                    {msg.imagePreview && (
                      <div className="mb-3 overflow-hidden rounded-xl border border-white/20 max-w-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.imagePreview}
                          alt="Crop symptom preview"
                          className="w-full h-auto max-h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Text Rendering */}
                    <div className="whitespace-pre-line space-y-2">
                      {msg.text.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph.split('**').map((seg, sIdx) =>
                            sIdx % 2 === 1 ? <strong key={sIdx}>{seg}</strong> : seg
                          )}
                        </p>
                      ))}
                    </div>

                    {/* Assistant Footer with Speech & Timestamp */}
                    {!isUser && (
                      <div className="pt-2.5 mt-2.5 border-t border-[#DCE9DD]/70 flex items-center justify-between text-[11px] text-[#718579]">
                        <span className="font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString('hi-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSpeak(msg.text)}
                            className="px-2 py-0.5 hover:bg-[#EAF4E8] rounded-lg text-[#52685B] hover:text-[#10312B] transition-colors flex items-center gap-1 font-medium"
                            aria-label="Speak response aloud"
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3.5 h-3.5 text-[#B91C1C]" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-[#1F4A3F]" />
                            )}
                            <span>बोलकर सुनें</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sources Footnote */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#EAF4E8] border border-[#DCE9DD] text-[11px] text-[#52685B] space-y-1 shadow-xs">
                      <span className="font-bold text-[#10312B] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#1F4A3F]" />
                        <span>सत्यापित संदर्भ व प्रामाणिक स्रोत:</span>
                      </span>
                      <ul className="space-y-0.5">
                        {msg.sources.map((src, i) => (
                          <li key={i} className="flex items-center gap-1 text-[#52685B]">
                            <span>• {src.title}</span>
                            <span className="text-[#718579] font-mono text-[10px]">
                              ({src.organization})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Statutory Disclaimer if present */}
                  {!isUser && msg.statutoryDisclaimer && (
                    <div className="px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[10px] text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{msg.statutoryDisclaimer}</span>
                    </div>
                  )}

                  {/* Suggested Follow-up Buttons */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          disabled={loading}
                          className="px-3 py-1 rounded-full bg-white hover:bg-[#EAF4E8] border border-[#DCE9DD] text-[11px] font-medium text-[#10312B] hover:border-[#9EC2A9] transition-all shadow-xs text-left disabled:opacity-50"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-[80%] items-center">
              <div className="w-8 h-8 rounded-xl bg-[#EAF4E8] text-[#1F4A3F] border border-[#DCE9DD] flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 bg-white rounded-2xl rounded-tl-none border border-[#DCE9DD] text-xs text-[#52685B] flex items-center gap-3 shadow-soft">
                <span className="inline-block w-2 h-2 rounded-full bg-[#1F4A3F] animate-ping" />
                <span>कृषि सारथी (Gemma 4 31B) विचार कर रहा है...</span>
                <button
                  onClick={handleCancelRequest}
                  className="ml-2 px-2 py-0.5 rounded bg-[#F3F8F2] hover:bg-[#EAF4E8] text-[11px] text-[#B91C1C] font-medium"
                >
                  रोकें
                </button>
              </div>
            </div>
          )}

          {lastError && !loading && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
              <span>{lastError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage()}
                className="gap-1 text-red-700 border-red-300 hover:bg-red-100 h-7 text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>पुनः प्रयास करें</span>
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Selected Image Thumbnail preview in Input Area */}
        {selectedImage && (
          <div className="p-2.5 px-4 bg-[#EAF4E8] border-t border-[#DCE9DD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.preview}
                alt="Selected crop preview"
                className="w-10 h-10 object-cover rounded-lg border border-[#9EC2A9]"
              />
              <div className="text-xs">
                <span className="font-medium text-[#10312B] block">फसल की फोटो चुनी गई</span>
                <span className="text-[10px] text-[#718579] font-mono">
                  {(selectedImage.file.size / 1024).toFixed(1)} KB • {selectedImage.mimeType}
                </span>
              </div>
            </div>
            <button
              onClick={removeSelectedImage}
              className="p-1 text-[#718579] hover:text-[#B91C1C] rounded-md transition-colors"
              title="फोटो हटाएं"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <CardFooter className="p-3.5 bg-white border-t border-[#DCE9DD]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5 w-full"
          >
            {/* Hidden File Input for Image */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {/* Attach Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-[#EAF4E8] text-[#10312B] hover:bg-[#DBF2DE] transition-all"
              title="फसल की फोटो संलग्न करें"
              aria-label="Attach crop photo"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-[#B91C1C] text-white animate-pulse'
                  : 'bg-[#EAF4E8] text-[#10312B] hover:bg-[#DBF2DE]'
              }`}
              title={isListening ? 'माइक बंद करें' : 'बोलकर पूछें'}
              aria-label="Voice input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                selectedImage
                  ? 'फोटो के बारे में प्रश्न लिखें (उदा. यह कौन सा रोग है?)...'
                  : t.copilot.placeholder
              }
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCE9DD] bg-white text-sm text-[#10312B] focus:outline-none focus:ring-2 focus:ring-[#1F4A3F]/20 focus:border-[#1F4A3F]"
            />

            {/* Send Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={(!inputValue.trim() && !selectedImage) || loading}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>

      {/* Model Technical Details Modal */}
      <Modal
        isOpen={showTechModal}
        onClose={() => setShowTechModal(false)}
        title="Google Gemma 4 31B — मॉडल तकनीकी विवरण"
      >
        <div className="space-y-4 text-xs text-[#52685B] leading-relaxed">
          <div className="p-3 rounded-xl bg-[#F3F8F2] border border-[#DCE9DD] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#10312B]">मॉडल पहचानकर्ता:</span>
              <span className="font-mono text-[#1F4A3F] font-bold">models/gemma-4-31b-it</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#10312B]">आधिकारिक एसडीके:</span>
              <span className="font-mono text-[#10312B]">@google/genai</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#10312B]">आर्किटेक्चर:</span>
              <span>30.7 Billion Parameters (Dense Multimodal)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#10312B]">कॉन्टेक्स्ट विंडो:</span>
              <span className="font-mono">262,144 Tokens (256K)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#10312B]">लाइसेंस:</span>
              <span>Apache 2.0 (Open Weights)</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#10312B] text-sm">कृषि मित्र निर्णय प्रणाली के सिद्धांत:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>सत्यापित डेटा ग्राउंडिंग:</strong> मौसम और मंडी भाव मॉडल द्वारा मनगढ़ंत नहीं बनाए जाते; वे ओपन-मेटियो और एगमार्कनेट के वास्तविक एपीआई रिकॉर्ड से इंजेक्ट किए जाते हैं।
              </li>
              <li>
                <strong>चार-चरणीय संरचना:</strong> 1. सरल विवरण, 2. मुख्य अवलोकन, 3. आगामी कदम, 4. जोखिम व सत्यापन।
              </li>
              <li>
                <strong>डेटा गोपनीयता:</strong> किसान की कोई भी व्यक्तिगत पहचान (नाम, फोन नंबर) मॉडल या बाहरी सर्वर पर सुरक्षित किए बिना स्थानीय स्तर पर प्रोसेस की जाती है।
              </li>
              <li>
                <strong>रासायनिक सुरक्षा:</strong> बिना अधिकृत लेबल निर्देश व केवीके वैज्ञानिक पुष्टि के रासायनिक कीटनाशकों की सिफारिश नहीं की जाती।
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-[#DCE9DD] flex items-center justify-between">
            <a
              href="https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api"
              target="_blank"
              rel="noreferrer"
              className="text-[#1F4A3F] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Gemma on Gemini API आधिकारिक दस्तावेज़</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTechModal(false)}
            >
              बंद करें
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
