'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Sprout, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Sehore');
  const [farmArea, setFarmArea] = useState('8');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
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
          नया किसान खाता बनाएं
        </h2>
        <p className="mt-1 text-xs text-charcoal-600">
          मध्य प्रदेश के किसानों के लिए निःशुल्क निर्णय सहायता मंच
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-lg border-charcoal-200">
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="पूरा नाम (Full Name)"
                type="text"
                placeholder="उदा. रामेश पटेल"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="मोबाइल नंबर (Mobile Number)"
                type="tel"
                placeholder="उदा. 98260 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="जिला (District)"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="Sehore">सीहोर (Sehore)</option>
                  <option value="Bhopal">भोपाल (Bhopal)</option>
                  <option value="Indore">इंदौर (Indore)</option>
                  <option value="Vidisha">विदिशा (Vidisha)</option>
                  <option value="Ujjain">उज्जैन (Ujjain)</option>
                  <option value="Hoshangabad">होशंगाबाद</option>
                </Select>

                <Input
                  label="रकबा (एकड़)"
                  type="number"
                  value={farmArea}
                  onChange={(e) => setFarmArea(e.target.value)}
                  required
                />
              </div>

              <Input
                label="गुप्त पासवर्ड (Password)"
                type="password"
                placeholder="कम से कम 6 अक्षर"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="agri"
                size="md"
                className="w-full mt-2"
                isLoading={loading}
              >
                पंजीकरण पूर्ण करें
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-cream-50 text-xs text-charcoal-600 flex justify-center">
            <span>पहले से खाता है? </span>
            <Link
              href="/auth/login"
              className="ml-1 font-bold text-forest-800 hover:underline"
            >
              लॉग इन करें
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
