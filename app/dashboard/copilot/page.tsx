'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  RefreshCw,
  User,
} from 'lucide-react';
import { CopilotMessage } from '@/lib/ai/copilot-rag';

export default function KrishiCopilotPage() {
  const { language, t } = useI18n();

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-01',
      sender: 'assistant',
      text:
        language === 'hi'
          ? 'राम-राम किसान भाई! मैं आपका **कृषि सारथी (Krishi Copilot)** हूँ।\n\nआप मुझसे आपकी **सोयाबीन व गेहूं** की फसल, सिंचाई, खाद-उर्वरक, मौसम जोखिम अथवा मंडी भाव संबंधी कोई भी सवाल पूछ सकते हैं।'
          : 'Welcome! I am your **Krishi Copilot**.\n\nAsk me anything about your **Soybean and Wheat** crops, irrigation schedules, fertilizer dosages, weather alerts, or mandi selling strategies.',
      timestamp: new Date().toISOString(),
      sources: [
        {
          title: 'आईसीएआर एवं कृषि विज्ञान केंद्र (KVK) सीहोर वैज्ञानिक संदर्शिका',
          organization: 'ICAR / RVSKVV',
        },
      ],
      suggestedFollowUps: [
        'गेहूं में पहली सिंचाई का सही समय क्या है?',
        'आज सीहोर व इंदौर मंडी में क्या भाव चल रहा है?',
        'सोयाबीन में पीला मोजेक वायरस से कैसे बचाव करें?',
        'क्या उपज अभी बेचना चाहिए या वेयरहाउस में रखना बेहतर है?',
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice recognition setup
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('आपके ब्राउज़र में बोलकर इनपुट (Speech Recognition) की सुविधा समर्थित नहीं है। कृपया टेक्स्ट टाइप करें।');
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
      setInputValue(transcript);
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
    if (!('speechSynthesis' in window)) {
      alert('टेक्स्ट-टू-स्पीच आपके ब्राउज़र में उपलब्ध नहीं है।');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown asterisks
    const cleanText = text.replace(/[*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          language,
          context: {
            farmerName: 'Ramesh Patel',
            district: 'Sehore',
            activeCrop: 'Soybean & Wheat',
            farmSizeAcres: 8,
            latestMandiModalPrice: 4680,
          },
        }),
      });

      if (res.ok) {
        const replyMsg = await res.json();
        setMessages((prev) => [...prev, replyMsg]);
      } else {
        const errorMsg: CopilotMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'क्षमा करें, सारथी सेवा से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2">
            <Bot className="w-6 h-6 text-agri-600" />
            <span>{t.copilot.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5">
            {t.copilot.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="demo">
            सत्यापित ICAR स्रोत आधारित
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.speechSynthesis?.cancel();
              setIsSpeaking(false);
              setMessages([messages[0]]);
            }}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>बातचीत रीसेट</span>
          </Button>
        </div>
      </div>

      {/* Main Chat Window Card */}
      <Card className="h-[650px] flex flex-col border-charcoal-300 shadow-md">
        {/* Chat History View */}
        <CardContent className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-cream-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-forest-800 text-white'
                      : 'bg-agri-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-forest-800 text-white rounded-tr-none'
                        : 'bg-white text-charcoal-900 border border-charcoal-200/90 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {!isUser && (
                      <div className="pt-2 mt-2 border-t border-charcoal-100 flex items-center justify-between">
                        <span className="text-[10px] text-charcoal-400">
                          {new Date(msg.timestamp).toLocaleTimeString('hi-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          onClick={() => handleSpeak(msg.text)}
                          className="p-1 hover:bg-cream-200 rounded text-charcoal-500 hover:text-forest-800 transition-colors flex items-center gap-1 text-[11px]"
                          aria-label="Speak response aloud"
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px]">बोलकर सुनें</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sources Footnote */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-cream-100 border border-charcoal-200/80 text-[11px] text-charcoal-700 space-y-1">
                      <span className="font-bold text-forest-900 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-agri-600" />
                        <span>सत्यापित संदर्भ व स्रोत:</span>
                      </span>
                      <ul className="space-y-0.5">
                        {msg.sources.map((src, i) => (
                          <li key={i} className="flex items-center gap-1 text-charcoal-600">
                            <span>• {src.title}</span>
                            <span className="text-charcoal-400 font-mono text-[10px]">
                              ({src.organization})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Follow up chips */}
                  {!isUser && msg.suggestedFollowUps && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-forest-50 border border-charcoal-200 text-[11px] font-medium text-forest-900 hover:border-forest-600 transition-colors text-left"
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

          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-agri-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-white rounded-2xl rounded-tl-none border border-charcoal-200 text-xs text-charcoal-600 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-agri-600 animate-ping" />
                <span>कृषि सारथी विश्लेषण कर रहा है...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Chat Input Bar */}
        <CardFooter className="p-3 bg-white border-t border-charcoal-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 w-full"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-lg transition-colors ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-cream-200 text-charcoal-700 hover:bg-cream-300'
              }`}
              title={isListening ? 'माइक बंद करें' : 'बोलकर पूछें'}
              aria-label="Voice input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.copilot.placeholder}
              className="flex-1 px-4 py-2.5 rounded-lg border border-charcoal-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
            />

            <Button
              type="submit"
              variant="agri"
              size="md"
              disabled={!inputValue.trim() || loading}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
