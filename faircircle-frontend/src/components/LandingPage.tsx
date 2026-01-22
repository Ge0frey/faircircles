import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  CircleDot, 
  Shield, 
  Users, 
  Coins, 
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  Globe,
  Zap
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-600/10 to-cyan-500/10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by FairScale Reputation
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Trust Circles for the
            <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Onchain Economy
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join reputation-based lending circles (ROSCAs) where your FairScore determines 
            your payout order. Higher trust = earlier access to pooled funds.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <WalletMultiButton 
              style={{
                backgroundColor: 'rgb(16 185 129)',
                height: '56px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: '600',
                padding: '0 32px',
              }}
            />
            <a 
              href="#how-it-works" 
              className="flex items-center gap-2 px-8 py-4 text-zinc-400 hover:text-white transition-colors"
            >
              Learn how it works
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-zinc-800">
            <div>
              <div className="text-3xl font-bold text-white">1B+</div>
              <div className="text-sm text-zinc-500">People use ROSCAs globally</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">100%</div>
              <div className="text-sm text-zinc-500">Onchain & trustless</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">0%</div>
              <div className="text-sm text-zinc-500">Platform fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How FairCircles Work
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              A modern, crypto-native take on the centuries-old tradition of rotating 
              savings circles, powered by onchain reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 relative group hover:border-emerald-500/50 transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                1
              </div>
              <Users className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Form a Circle</h3>
              <p className="text-sm text-zinc-400">
                Create or join a trust circle with 3-10 members. Each circle has a minimum 
                FairScore requirement.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 relative group hover:border-emerald-500/50 transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                2
              </div>
              <Coins className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Contribute</h3>
              <p className="text-sm text-zinc-400">
                Every round, all members contribute a fixed SOL amount to the shared pool.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 relative group hover:border-emerald-500/50 transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                3
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Rotate Payouts</h3>
              <p className="text-sm text-zinc-400">
                Each round, one member receives the entire pool. Order is determined by 
                FairScore ranking.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 relative group hover:border-emerald-500/50 transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white">
                4
              </div>
              <Award className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Build Trust</h3>
              <p className="text-sm text-zinc-400">
                Complete circles without default to earn badges and improve your reputation 
                for future circles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FairScore Tiers */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              FairScore Tiers
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Your FairScore determines which circles you can join and when you receive payouts.
              Higher score = earlier access to funds.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Platinum */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-300 to-slate-100 text-slate-800">
              <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-white/30 blur-2xl" />
              <Shield className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-1">Platinum</h3>
              <p className="text-sm opacity-75">80+ FairScore</p>
              <p className="text-xs mt-3 opacity-60">First priority payouts</p>
            </div>

            {/* Gold */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-yellow-400 text-amber-900">
              <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-white/30 blur-2xl" />
              <Shield className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-1">Gold</h3>
              <p className="text-sm opacity-75">60+ FairScore</p>
              <p className="text-xs mt-3 opacity-60">Early access to funds</p>
            </div>

            {/* Silver */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-gray-400 to-gray-300 text-gray-800">
              <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-white/30 blur-2xl" />
              <Shield className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-1">Silver</h3>
              <p className="text-sm opacity-75">40+ FairScore</p>
              <p className="text-xs mt-3 opacity-60">Standard queue position</p>
            </div>

            {/* Bronze */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-orange-700 to-orange-500 text-orange-100">
              <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-white/30 blur-2xl" />
              <Shield className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-1">Bronze</h3>
              <p className="text-sm opacity-75">20+ FairScore</p>
              <p className="text-xs mt-3 opacity-60">Proves commitment first</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Tradition */}
      <section className="py-20 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-6">
                <Globe className="w-4 h-4" />
                A Global Tradition
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                ROSCAs Have Served Communities for Centuries
              </h2>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                Rotating savings and credit associations are known by different names around 
                the world: <strong className="text-white">chit funds</strong> in India, 
                <strong className="text-white"> tandas</strong> in Latin America, 
                <strong className="text-white"> susus</strong> in West Africa, 
                <strong className="text-white"> hui</strong> in China, and 
                <strong className="text-white"> gameya</strong> in the Middle East.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                FairCircles brings this time-tested financial practice onchain, adding 
                transparency, trustless execution, and reputation-based risk management.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800 rounded-2xl p-6">
                <div className="text-3xl font-bold text-emerald-400 mb-2">🇮🇳</div>
                <div className="text-white font-medium">Chit Funds</div>
                <div className="text-sm text-zinc-500">India</div>
              </div>
              <div className="bg-zinc-800 rounded-2xl p-6">
                <div className="text-3xl font-bold text-emerald-400 mb-2">🇲🇽</div>
                <div className="text-white font-medium">Tandas</div>
                <div className="text-sm text-zinc-500">Latin America</div>
              </div>
              <div className="bg-zinc-800 rounded-2xl p-6">
                <div className="text-3xl font-bold text-emerald-400 mb-2">🇳🇬</div>
                <div className="text-white font-medium">Susus</div>
                <div className="text-sm text-zinc-500">West Africa</div>
              </div>
              <div className="bg-zinc-800 rounded-2xl p-6">
                <div className="text-3xl font-bold text-emerald-400 mb-2">🇨🇳</div>
                <div className="text-white font-medium">Hui</div>
                <div className="text-sm text-zinc-500">China</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Zap className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join Your First Circle?
          </h2>
          <p className="text-zinc-400 mb-10 max-w-2xl mx-auto">
            Connect your wallet to see your FairScore and start participating in 
            reputation-based lending circles.
          </p>
          <WalletMultiButton 
            style={{
              backgroundColor: 'rgb(16 185 129)',
              height: '56px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              padding: '0 32px',
            }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <CircleDot className="w-5 h-5 text-white" />
            </div>
            <span className="text-zinc-400 text-sm">
              Built with <span className="text-emerald-400">FairScale</span> on Solana
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="https://fairscale.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              FairScale
            </a>
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Solana
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
