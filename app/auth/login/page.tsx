'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sprout, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  const handleDemoLogin = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F3F8F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#1F4A3F] text-[#DBF2DE] flex items-center justify-center shadow-soft">
            <Sprout className="w-6 h-6 text-[#DBF2DE]" />
          </div>
          <span className="font-extrabold text-xl text-[#10312B]">KrishiConnect AI</span>
        </Link>
        <h2 className="text-2xl font-black text-[#10312B] tracking-tight">
          किसान खाते में प्रवेश करें
        </h2>
        <p className="mt-1 text-xs text-[#52685B]">
          अपने खेत का डेटा, मंडी भाव और मौसम परामर्श सुरक्षित रूप से देखें
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-card border-[#DCE9DD]">
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="ईमेल अथवा मोबाइल नंबर"
                type="text"
                placeholder="उदा. 9826012345 या kisan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="पासवर्ड (Password)"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[#52685B]">
                  <input type="checkbox" defaultChecked className="rounded text-[#1F4A3F]" />
                  <span>याद रखें</span>
                </label>
                <a href="#" className="font-semibold text-[#1F4A3F] hover:underline">
                  पासवर्ड भूल गए?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
              >
                लॉग इन करें
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#DCE9DD]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-[#718579]">अथवा</span>
              </div>
            </div>

            {/* Instant Demo Exploration Button */}
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full gap-2 border-[#DCE9DD]"
              onClick={handleDemoLogin}
            >
              <span>डेमो किसान खाते से तुरंत शुरू करें</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
          <CardFooter className="bg-[#EAF4E8]/50 text-xs text-[#52685B] flex justify-center border-t border-[#DCE9DD]">
            <span>नया खाता बनाना चाहते हैं? </span>
            <Link
              href="/auth/register"
              className="ml-1 font-bold text-[#1F4A3F] hover:underline"
            >
              पंजीकरण करें
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
