import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Fingerprint,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { TraiEmblem } from './TraiEmblem';
import { AccentTheme } from '../types';
import { soundFx } from '../services/soundFx';

interface LoginScreenProps {
  onLogin: (userData: { email: string; name: string; title: string }) => void;
  accent: AccentTheme;
  initialEmail?: string;
  initialTitle?: string;
  soundEnabled?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  accent,
  initialEmail = 'aliaskervuran13@gmail.com',
  initialTitle = 'Ali',
  soundEnabled = true,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricSuccess, setIsBiometricSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStandardLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    soundFx.playClick(soundEnabled);

    setTimeout(() => {
      setIsLoading(false);
      soundFx.playConfirm(soundEnabled);
      const displayName = email.includes('ali') ? 'Ali Asker Vuran' : email.split('@')[0];
      onLogin({
        email: email.trim(),
        name: displayName,
        title: initialTitle,
      });
    }, 450);
  };

  const handleQuickDemoLogin = () => {
    if (isLoading) return;
    setIsLoading(true);
    soundFx.playClick(soundEnabled);

    setTimeout(() => {
      setIsLoading(false);
      soundFx.playConfirm(soundEnabled);
      onLogin({
        email: 'aliaskervuran13@gmail.com',
        name: 'Ali Asker Vuran',
        title: 'Ali',
      });
    }, 350);
  };

  const handleBiometricAuth = () => {
    if (isLoading) return;
    setIsLoading(true);
    soundFx.playClick(soundEnabled);

    setTimeout(() => {
      setIsBiometricSuccess(true);
      soundFx.playConfirm(soundEnabled);

      setTimeout(() => {
        setIsLoading(false);
        onLogin({
          email: email.trim() || 'aliaskervuran13@gmail.com',
          name: 'Ali Asker Vuran',
          title: initialTitle,
        });
      }, 500);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-cyan-500/25 selection:text-cyan-800">
      {/* Refined subtle ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-[440px] bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-9 shadow-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <TraiEmblem accent={accent} size="lg" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            TRAİ Çalışma Alanı
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Kişisel yapay zeka asistanınıza erişmek için oturum açın veya hızlı giriş yapın.
          </p>
        </div>

        {/* Quick One-Click Access for Owner */}
        <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-cyan-400 transition-colors">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-800 flex items-center justify-center font-bold text-xs shrink-0">
                AV
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">Ali Asker Vuran</div>
                <div className="text-[11px] text-slate-500 truncate">aliaskervuran13@gmail.com</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>Hızlı Giriş</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            veya şifre ile devam et
          </span>
        </div>

        {/* Biometric Verification Screen if Active */}
        {isBiometricSuccess ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-emerald-700">
              Biyometrik Kimlik Doğrulandı
            </p>
            <p className="text-xs text-slate-500">
              Çalışma alanı güvenle başlatılıyor...
            </p>
          </div>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleStandardLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                E-posta Adresi
              </label>
              <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-cyan-500 focus-within:bg-white rounded-xl overflow-hidden transition-all">
                <Mail className="w-4 h-4 ml-3 text-slate-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aliaskervuran13@gmail.com"
                  required
                  className="w-full py-2.5 px-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 block">
                  Şifre
                </label>
              </div>
              <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-cyan-500 focus-within:bg-white rounded-xl overflow-hidden transition-all">
                <Lock className="w-4 h-4 ml-3 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifreniz"
                  required
                  className="w-full py-2.5 px-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Şifreyi Göster/Gizle"
                  className="mr-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 accent-cyan-500 cursor-pointer"
                />
                <span>Oturumu Hatırla</span>
              </label>
              <span className="text-slate-500 text-[11px]">Güvenli Giriş</span>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Doğrulanıyor...</span>
                </div>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Biometric Passkey Alternative */}
            <button
              type="button"
              onClick={handleBiometricAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <span>Passkey / Face ID ile Giriş</span>
            </button>
          </form>
        )}

        {/* Security Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Güvenli Bulut ve Cihaz Senkronizasyonu Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
};
