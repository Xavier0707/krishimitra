'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from '@/components/navigation/language-switcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sprout,
  TrendingUp,
  CloudSun,
  Stethoscope,
  FlaskConical,
  Bot,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  MapPin,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const { t, formatCurrency } = useI18n();

  return (
    <div className="min-h-screen bg-[#F8F9F5] text-charcoal-900 flex flex-col">
      {/* 1. Public Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-charcoal-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-agri-400 flex items-center justify-center shadow-xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-forest-950 tracking-tight block">
                KrishiConnect <span className="text-agri-600">AI</span>
              </span>
              <span className="text-[11px] text-charcoal-500 font-medium block">
                किसान निर्णय बुद्धिमत्ता मंच
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-charcoal-700">
            <Link href="#features" className="hover:text-forest-800 transition-colors">
              सुविधाएं
            </Link>
            <Link href="#preview" className="hover:text-forest-800 transition-colors">
              डैशबोर्ड झलक
            </Link>
            <Link href="#transparency" className="hover:text-forest-800 transition-colors">
              डेटा पारदर्शिता
            </Link>
            <Link href="#faq" className="hover:text-forest-800 transition-colors">
              प्रश्नोत्तरी
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="hidden sm:inline-flex">
                {t.landing.getStarted}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative px-4 sm:px-8 pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-charcoal-200/60 bg-gradient-to-b from-cream-100 to-[#F8F9F5]">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-xs font-semibold text-forest-800">
              <ShieldCheck className="w-4 h-4 text-agri-600" />
              <span>प्रारंभिक ध्यान: मध्य प्रदेश (सीहोर, विदिशा, इंदौर, भोपाल)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-forest-950 tracking-tight leading-[1.15]">
              {t.brand.tagline}
            </h1>

            <p className="text-base sm:text-xl text-charcoal-700 max-w-3xl mx-auto font-normal leading-relaxed">
              {t.landing.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                  <span>{t.landing.getStarted}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/mandi" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t.landing.exploreMandi}
                </Button>
              </Link>
            </div>

            {/* Verifiable feature tags */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-charcoal-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-agri-600" />
                Agmarknet दैनिक मंडी भाव
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-agri-600" />
                Open-Meteo कृषि मौसम
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-agri-600" />
                हिंदी-प्रथम ग्रामीण इंटरफेस
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-agri-600" />
                पूर्णतः ओपन-सोर्स आर्किटेक्चर
              </span>
            </div>
          </div>
        </section>

        {/* 3. Interactive Preview of Farmer Dashboard */}
        <section id="preview" className="px-4 sm:px-8 py-14 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              किसान डैशबोर्ड की वास्तविक कार्यप्रणाली
            </h2>
            <p className="text-sm text-charcoal-600 mt-2">
              सीहोर, मध्य प्रदेश के किसान रामेश पटेल के 8 एकड़ खेत का वास्तविक निर्णय मॉडल
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-charcoal-200/90 shadow-xl overflow-hidden">
            {/* Mock Top bar */}
            <div className="bg-cream-100 border-b border-charcoal-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-charcoal-500 ml-2">
                  app.krishiconnect.ai/dashboard
                </span>
              </div>
              <Badge variant="demo" size="sm">
                सत्यापित डेमो डेटा
              </Badge>
            </div>

            {/* Dashboard Mock Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-cream-50/40">
              {/* Card 1: Mandi Modal Rates */}
              <div className="bg-white p-5 rounded-xl border border-charcoal-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                    मंडी भाव रडार (सीहोर)
                  </span>
                  <TrendingUp className="w-4 h-4 text-agri-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-forest-900">
                    {formatCurrency(4680)}{' '}
                    <span className="text-xs font-medium text-charcoal-500">
                      / क्विंटल
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 mt-0.5">
                    सोयाबीन (पीला) • सीहोर मंडी आज का मॉडल भाव
                  </p>
                </div>
                <div className="p-3 bg-agri-50 rounded-lg border border-agri-200/60 text-xs text-agri-900">
                  <span className="font-semibold">शुद्ध मुनाफा अंतर्दृष्टि:</span> ट्रॉली
                  किराया व हम्माली काटकर हाथ में <strong>₹4,590/क्विंटल</strong> बचेगा।
                </div>
              </div>

              {/* Card 2: Weather & Risks */}
              <div className="bg-white p-5 rounded-xl border border-charcoal-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                    मौसम व जोखिम (Open-Meteo)
                  </span>
                  <CloudSun className="w-4 h-4 text-forest-700" />
                </div>
                <div>
                  <div className="text-2xl font-black text-forest-900">
                    29°C{' '}
                    <span className="text-xs font-medium text-charcoal-500">
                      (साफ आसमान)
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 mt-0.5">
                    हवा: 14 किमी/घंटा • आर्द्रता: 58%
                  </p>
                </div>
                <div className="p-3 bg-cream-100 rounded-lg border border-charcoal-200 text-xs text-charcoal-800">
                  <span className="font-semibold">कृषि कार्य सलाह:</span> आगामी 48
                  घंटों में बारिश नहीं। कीटनाशक छिड़काव व सिंचाई के लिए आदर्श समय।
                </div>
              </div>

              {/* Card 3: Storage Scenario */}
              <div className="bg-white p-5 rounded-xl border border-charcoal-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                    भंडारण बनाम बिक्री
                  </span>
                  <Warehouse className="w-4 h-4 text-earth-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-earth-600">
                    +₹48,900{' '}
                    <span className="text-xs font-medium text-charcoal-500">
                      संभावित लाभ
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 mt-0.5">
                    100 क्विंटल सोयाबीन 4 माह वेयरहाउस रखने पर
                  </p>
                </div>
                <div className="p-3 bg-earth-50 rounded-lg border border-earth-200 text-xs text-earth-900">
                  <span className="font-semibold">ब्रेक-इवन भाव:</span> खर्च काटने के बाद
                  न्यूनतम <strong>₹4,801/क्विंटल</strong> मिलना आवश्यक है।
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-charcoal-200 text-center">
              <Link href="/dashboard">
                <Button variant="agri" size="md" className="gap-2">
                  <span>पूर्ण डैशबोर्ड खोलें और स्वयं चलाएं</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Core Features Grid */}
        <section id="features" className="px-4 sm:px-8 py-16 bg-white border-y border-charcoal-200/80">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-charcoal-900">
                {t.landing.featuresTitle}
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 max-w-2xl mx-auto">
                {t.landing.featuresSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-cream-50 border border-charcoal-200/80 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-forest-800 text-agri-400 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900">
                  मंडी लाभ रडार व शुद्ध आय
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  केवल मंडी का मॉडल भाव नहीं, बल्कि ट्रॉली भाड़ा, तुलाई, हम्माली व बारदाना खर्च
                  घटाकर किसान के हाथ में आने वाला शुद्ध पैसा जानें।
                </p>
                <Link
                  href="/dashboard/mandi"
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 pt-2"
                >
                  <span>रडार देखें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-cream-50 border border-charcoal-200/80 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-forest-800 text-agri-400 flex items-center justify-center">
                  <CloudSun className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900">
                  मौसम व फसल जोखिम चेतावनी
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Open-Meteo द्वारा 7-दिवसीय कृषि मौसम पूर्वानुमान। वर्षा, पाला (frost) और अधिक
                  आर्द्रता से पनपने वाले रतुआ व फंगस की अग्रिम सूचना।
                </p>
                <Link
                  href="/dashboard/weather"
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 pt-2"
                >
                  <span>मौसम जांचें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-cream-50 border border-charcoal-200/80 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-forest-800 text-agri-400 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900">
                  क्रॉप डॉक्टर — लक्षण पहचान
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  पत्ती या तने का फोटो अपलोड करें। पीला मोजेक, रिंग कटर अथवा उकठा रोग की
                  प्रारंभिक पहचान, जैविक देसी उपाय एवं सुरक्षित रासायनिक परामर्श।
                </p>
                <Link
                  href="/dashboard/crop-doctor"
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 pt-2"
                >
                  <span>क्रॉप डॉक्टर शुरू करें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-cream-50 border border-charcoal-200/80 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-forest-800 text-agri-400 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900">
                  मिट्टी-से-फसल अनुकूलता
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  मृदा स्वास्थ्य कार्ड (Soil Health Card) के pH, कार्बन व NPK मान दर्ज करें।
                  जानें आपकी जमीन के लिए सोयाबीन, गेहूं या लहसुन में से कौन सबसे अनुकूल है।
                </p>
                <Link
                  href="/dashboard/soil"
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 pt-2"
                >
                  <span>मिट्टी जांचें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl bg-cream-50 border border-charcoal-200/80 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-forest-800 text-agri-400 flex items-center justify-center">
                  <Warehouse className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900">
                  स्मार्ट भंडारण बनाम तुरंत बिक्री
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  वेयरहाउस में अनाज रखने का मासिक किराया, वजन घटौती (moisture loss) और भविष्य
                  के ब्रेक-इवन भाव की सटीक वित्तीय गणना।
                </p>
                <Link
                  href="/dashboard/storage-planner"
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 pt-2"
                >
                  <span>कैलकुलेटर खोलें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl bg-cream-50 border border-charcoal-200/80 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-forest-800 text-agri-400 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900">
                  कृषि सारथी (Krishi Copilot)
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  अपनी मातृभाषा हिंदी में खेती, खाद, सिंचाई और दवाओं के बारे में सवाल पूछें।
                  आईसीएआर और कृषि विश्वविद्यालयों के सत्यापित स्रोतों से जुड़े उत्तर।
                </p>
                <Link
                  href="/dashboard/copilot"
                  className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 pt-2"
                >
                  <span>सारथी से पूछें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Trust and Transparency Section */}
        <section id="transparency" className="px-4 sm:px-8 py-16 bg-[#F8F9F5]">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-100 text-agri-900 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-agri-700" />
              <span>सत्यता, विज्ञान और पारदर्शी सिद्धांत</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              {t.landing.transparencyTitle}
            </h2>

            <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
              {t.landing.transparencyDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-charcoal-200 shadow-xs">
                <h4 className="text-sm font-bold text-forest-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-agri-600" />
                  कोई झूठी उपज या लाभ गारंटी नहीं
                </h4>
                <p className="text-xs text-charcoal-600 mt-1">
                  हम कभी यह दावा नहीं करते कि हमारा ऐप उत्पादन दोगुना करने या बीमारी 100% ठीक
                  करने की गारंटी देता है। निर्णय हमेशा किसान का अपना होता है।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-charcoal-200 shadow-xs">
                <h4 className="text-sm font-bold text-forest-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-agri-600" />
                  लाइव, कैश्ड और डेमो डेटा का स्पष्ट भेद
                </h4>
                <p className="text-xs text-charcoal-600 mt-1">
                  प्रत्येक स्क्रीन पर डेटा का वास्तविक स्रोत, एपीआई स्थिति और प्राप्ति समय
                  (timestamp) स्पष्ट रूप से प्रदर्शित किया जाता है।
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section id="faq" className="px-4 sm:px-8 py-16 bg-white border-t border-charcoal-200/80">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                {t.landing.faqTitle}
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600">
                कृषि कनेक्ट AI के उपयोग और डेटा स्रोतों से संबंधित महत्वपूर्ण जानकारी
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-cream-50 border border-charcoal-200">
                <h3 className="font-bold text-sm sm:text-base text-charcoal-900">
                  क्या कृषि कनेक्ट उपयोग करने के लिए कोई शुल्क देना होता है?
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 mt-2 leading-relaxed">
                  नहीं। कृषि कनेक्ट AI एक खुला, किसान-हितैषी मंच है। मौसम पूर्वानुमान, मंडी
                  भाव, शुद्ध मुनाफा कैलकुलेटर और बुनियादी परामर्श पूरी तरह निःशुल्क हैं।
                </p>
              </div>

              <div className="p-5 rounded-xl bg-cream-50 border border-charcoal-200">
                <h3 className="font-bold text-sm sm:text-base text-charcoal-900">
                  मंडी भाव कहाँ से प्राप्त होते हैं?
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 mt-2 leading-relaxed">
                  भाव भारत सरकार के आधिकारिक पोर्टल (data.gov.in) तथा एगमार्कनेट (Agmarknet) से
                  मध्य प्रदेश की कृषि उपज मंडियों के लिए प्राप्त किए जाते हैं।
                </p>
              </div>

              <div className="p-5 rounded-xl bg-cream-50 border border-charcoal-200">
                <h3 className="font-bold text-sm sm:text-base text-charcoal-900">
                  यदि इंटरनेट कनेक्शन धीमा या बंद हो, तो क्या ऐप काम करेगा?
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 mt-2 leading-relaxed">
                  हाँ! कृषि कनेक्ट प्रोग्रेसिव वेब ऐप (PWA) तकनीक पर बना है। आपके खेत के
                  अभिलेख और हाल ही में देखा गया मौसम डेटा ऑफलाइन भी सुरक्षित रहता है।
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Public Footer */}
      <footer className="bg-forest-950 text-forest-200 border-t border-forest-900 px-4 sm:px-8 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-agri-400" />
              <span className="font-bold text-base text-white">KrishiConnect AI</span>
            </div>
            <p className="text-xs text-forest-300 leading-relaxed">
              भारतीय किसानों के लिए सशक्त, वैज्ञानिक एवं पारदर्शी निर्णय समर्थन प्रणाली।
            </p>
            <p className="text-[11px] text-forest-400">
              © {new Date().getFullYear()} KrishiConnect AI. Open Source Initiative.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              मॉड्यूल्स
            </h4>
            <ul className="space-y-2 text-xs text-forest-300">
              <li>
                <Link href="/dashboard/mandi" className="hover:text-white">
                  मंडी लाभ रडार
                </Link>
              </li>
              <li>
                <Link href="/dashboard/weather" className="hover:text-white">
                  मौसम व जोखिम
                </Link>
              </li>
              <li>
                <Link href="/dashboard/crop-doctor" className="hover:text-white">
                  क्रॉप डॉक्टर
                </Link>
              </li>
              <li>
                <Link href="/dashboard/soil" className="hover:text-white">
                  मिट्टी स्वास्थ्य
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              दस्तावेज़ एवं स्रोत
            </h4>
            <ul className="space-y-2 text-xs text-forest-300">
              <li>
                <Link href="/dashboard" className="hover:text-white">
                  डेमो डैशबोर्ड
                </Link>
              </li>
              <li>
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  Open-Meteo API <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://agmarknet.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  Agmarknet Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              पारदर्शिता एवं नीति
            </h4>
            <ul className="space-y-2 text-xs text-forest-300">
              <li>
                <span className="text-[11px] text-forest-400 block">
                  अस्वीकरण: कृषि निर्णय सहायता हेतु बनाया गया है। प्रयोगशाला निदान व सरकारी
                  दिशा-निर्देशों की अवहेलना न करें।
                </span>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
