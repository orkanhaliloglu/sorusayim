import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';
import { Countdown } from '../components/Countdown';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        console.log('Login attempt started for:', email);

        try {
            // Create a promise that rejects after 15 seconds
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Bağlantı zaman aşımına uğradı. İnternet bağlantınızı kontrol edin.')), 15000);
            });

            // Race the login against the timeout
            await Promise.race([
                signInWithEmailAndPassword(auth, email, password),
                timeoutPromise
            ]);

            console.log('Login successful');
        } catch (err: any) {
            console.error('Login error:', err);
            let errorMessage = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';

            if (err.message.includes('zaman aşımı')) {
                errorMessage = err.message;
            } else if (err.code === 'auth/invalid-credential') {
                errorMessage = 'Hatalı e-posta veya parola.';
            } else if (err.code === 'auth/network-request-failed') {
                errorMessage = 'Ağ hatası. Lütfen internet bağlantınızı kontrol edin.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-3xl p-8 border-2 border-gray-700 shadow-2xl relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-avengers-red via-avengers-gold to-avengers-blue" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-avengers-red/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-avengers-blue/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 mb-6 rounded-full bg-gray-700/50 flex items-center justify-center border border-gray-600 shadow-lg">
                        <Shield className="w-10 h-10 text-avengers-gold" />
                    </div>

                    <h1 className="text-3xl font-display font-bold text-white mb-2">Kahraman Girişi</h1>
                    <p className="text-gray-400 mb-8 text-center">
                        Soru takip portalına erişmek için kimliğinizi doğrulayın.
                    </p>

                    <form onSubmit={handleLogin} className="w-full space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">E-posta</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-avengers-blue transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-avengers-blue focus:ring-1 focus:ring-avengers-blue transition-all"
                                    placeholder="kahraman@ornek.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Parola</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-avengers-blue transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-avengers-blue focus:ring-1 focus:ring-avengers-blue transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        {/* Test Button Removed */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-avengers-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Giriş Yapılıyor...
                                </>
                            ) : (
                                'Sisteme Giriş Yap'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <p className="mt-8 text-gray-500 text-sm">
                &copy; 2024 Soru Takip Portalı - Avengers Edition
            </p>

            <div className="mt-8 flex gap-6">
                <Countdown targetDate={new Date('2027-06-06')} title="LGS 2027" variant="small" />
                <Countdown targetDate={new Date('2027-06-19')} title="YKS 2027" variant="small" />
            </div>
        </div>
    );
}
