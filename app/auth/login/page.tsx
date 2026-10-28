'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sprout, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Authenticate or redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  const handleDemoLogin = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-forest-800 text-agri-400 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl text-forest-950">KrishiConnect AI</span>
        </Link>
        <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
          किसान खाते में प्रवेश करें
        </h2>
        <p className="mt-1 text-xs text-charcoal-600">
          अपने खेत का डेटा, मंडी भाव और मौसम परामर्श सुरक्षित रूप से देखें
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-lg border-charcoal-200">
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
                <label className="flex items-center gap-2 text-charcoal-600">
                  <input type="checkbox" defaultChecked className="rounded text-forest-800" />
                  <span>याद रखें</span>
                </label>
                <a href="#" className="font-semibold text-forest-800 hover:underline">
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
                <div className="w-full border-t border-charcoal-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-charcoal-500">अथवा</span>
              </div>
            </div>

            {/* Instant Demo Exploration Button */}
            <Button
              type="button"
              variant="agri"
              size="md"
              className="w-full gap-2"
              onClick={handleDemoLogin}
            >
              <span>डेमो किसान खाते से तुरंत शुरू करें</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
          <CardFooter className="bg-cream-50 text-xs text-charcoal-600 flex justify-center">
            <span>नया खाता बनाना चाहते हैं? </span>
            <Link
              href="/auth/register"
              className="ml-1 font-bold text-forest-800 hover:underline"
            >
              पंजीकरण करें
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
