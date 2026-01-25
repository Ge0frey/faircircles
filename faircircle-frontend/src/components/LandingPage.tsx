import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Shield, 
  Users, 
  Coins, 
  TrendingUp,
  Award,
  ArrowRight,
  Globe,
  Check,
  Lock,
  BarChart3,
  Repeat,
  Clock,
  Wallet,
  FileCheck,
  Scale
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-500 font-medium text-sm uppercase tracking-wider mb-4">
              Reputation-Based Lending on Solana
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Trust Circles for the<br />
              <span className="text-emerald-500">Onchain Economy</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              FairCircles modernizes Rotating Savings and Credit Associations (ROSCAs) for Web3. 
              Pool funds with trusted members, receive payouts based on your reputation score, 
              and build financial trust onchain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <WalletMultiButton 
                style={{
                  background: 'rgb(16, 185, 129)',
                  height: '52px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  padding: '0 28px',
                  border: 'none',
                }}
              />
              <a 
                href="#how-it-works" 
                className="flex items-center gap-2 px-6 py-3 text-zinc-400 hover:text-white border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="text-3xl font-bold text-white mb-1">1B+</div>
              <div className="text-sm text-zinc-500">Global ROSCA Users</div>
            </div>
            <div className="text-center p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="text-3xl font-bold text-emerald-500 mb-1">100%</div>
              <div className="text-sm text-zinc-500">Onchain & Trustless</div>
            </div>
            <div className="text-center p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="text-3xl font-bold text-white mb-1">0%</div>
              <div className="text-sm text-zinc-500">Platform Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* What is a ROSCA Section */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-emerald-500 font-medium text-sm uppercase tracking-wider mb-3">
                Understanding ROSCAs
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                A Financial Practice Trusted for Centuries
              </h2>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                A Rotating Savings and Credit Association (ROSCA) is a group-based savings mechanism 
                where members contribute a fixed amount regularly. Each period, one member receives 
                the entire pooled amount. This continues until everyone has received a payout.
              </p>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                ROSCAs provide access to lump-sum funds without traditional banking, interest charges, 
                or credit checks. They rely on social trust and mutual accountability within the group.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-emerald-500/10 mt-0.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">No Interest or Fees</p>
                    <p className="text-sm text-zinc-500">Members receive exactly what the group contributes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-emerald-500/10 mt-0.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">No Credit Checks Required</p>
                    <p className="text-sm text-zinc-500">Participation based on reputation, not credit history</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-emerald-500/10 mt-0.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Community-Driven Trust</p>
                    <p className="text-sm text-zinc-500">Accountability through group membership</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Example: 5-Member Circle</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                  <span className="text-zinc-400">Contribution per round</span>
                  <span className="text-white font-medium">1 SOL</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                  <span className="text-zinc-400">Members</span>
                  <span className="text-white font-medium">5</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                  <span className="text-zinc-400">Pool per round</span>
                  <span className="text-white font-medium">5 SOL</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                  <span className="text-zinc-400">Total rounds</span>
                  <span className="text-white font-medium">5</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-400">Total contributed</span>
                  <span className="text-emerald-500 font-semibold">5 SOL</span>
                </div>
                <div className="flex items-center justify-between py-3 bg-emerald-500/10 rounded-lg px-4 -mx-4">
                  <span className="text-emerald-400">Total received</span>
                  <span className="text-emerald-400 font-semibold">5 SOL</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-4">
                Each member contributes 1 SOL per round for 5 rounds (5 SOL total) and receives 
                one payout of 5 SOL during their turn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How FairCircles Work */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-500 font-medium text-sm uppercase tracking-wider mb-3">
              The Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
              How FairCircles Work
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              FairCircles combines traditional ROSCA mechanics with blockchain technology 
              and reputation-based ordering for a trustless, transparent experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-8">
              <div className="p-3 rounded-lg bg-zinc-800 w-fit mb-5">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Form a Circle</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Create a new circle by setting contribution amount, round duration, and minimum 
                FairScore requirement. Or browse existing circles and join one that matches your 
                reputation tier.
              </p>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  3-10 members per circle
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Customizable contribution amounts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  FairScore gating for quality control
                </li>
              </ul>
            </div>

            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-8">
              <div className="p-3 rounded-lg bg-zinc-800 w-fit mb-5">
                <Coins className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Contribute Each Round</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Every round, all members contribute the fixed SOL amount to a shared escrow 
                controlled by the smart contract. Contributions are tracked onchain with full 
                transparency.
              </p>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Funds held in program-controlled escrow
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Transparent contribution tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  No platform custody of funds
                </li>
              </ul>
            </div>

            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-8">
              <div className="p-3 rounded-lg bg-zinc-800 w-fit mb-5">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Receive Payouts by Rank</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                When the circle starts, members are ranked by FairScore. Higher-reputation members 
                receive payouts first, creating an incentive to build and maintain good standing.
              </p>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Payout order determined by FairScore
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Higher trust equals earlier access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Lower-ranked members prove commitment
                </li>
              </ul>
            </div>

            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-8">
              <div className="p-3 rounded-lg bg-zinc-800 w-fit mb-5">
                <Award className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Build Your Reputation</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Successfully completing circles without defaulting improves your onchain reputation. 
                This unlocks access to higher-tier circles and better payout positions in future rounds.
              </p>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  FairScore tracks your reliability
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Earn badges for completed circles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Access higher-value circles over time
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FairScore Integration */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-500 font-medium text-sm uppercase tracking-wider mb-3">
              Powered by FairScale
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
              Reputation-Based Risk Management
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              FairCircles integrates with FairScale to provide objective, onchain reputation scoring 
              that determines circle access and payout priority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="p-3 rounded-lg bg-emerald-500/10 w-fit mb-4">
                <Lock className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Access Gating</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Circle creators set minimum FairScore requirements. Only wallets meeting the 
                threshold can join, ensuring participants have demonstrated reliability.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="p-3 rounded-lg bg-emerald-500/10 w-fit mb-4">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Payout Ordering</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                When a circle starts, members are sorted by FairScore. Higher scores receive 
                payouts first, rewarding established reputation with priority access to funds.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <div className="p-3 rounded-lg bg-emerald-500/10 w-fit mb-4">
                <Scale className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Risk Mitigation</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Lower-reputation members must contribute to multiple rounds before receiving 
                their payout, reducing default risk for the entire group.
              </p>
            </div>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl p-6 bg-gradient-to-br from-slate-200 to-slate-100 text-slate-800">
              <Shield className="w-6 h-6 mb-3 opacity-70" />
              <h3 className="text-lg font-bold mb-1">Platinum</h3>
              <p className="text-sm opacity-70 mb-3">80+ FairScore</p>
              <p className="text-xs opacity-60">First priority payouts</p>
            </div>
            <div className="rounded-xl p-6 bg-gradient-to-br from-amber-400 to-yellow-400 text-amber-900">
              <Shield className="w-6 h-6 mb-3 opacity-70" />
              <h3 className="text-lg font-bold mb-1">Gold</h3>
              <p className="text-sm opacity-70 mb-3">60+ FairScore</p>
              <p className="text-xs opacity-60">Early fund access</p>
            </div>
            <div className="rounded-xl p-6 bg-gradient-to-br from-gray-300 to-gray-200 text-gray-800">
              <Shield className="w-6 h-6 mb-3 opacity-70" />
              <h3 className="text-lg font-bold mb-1">Silver</h3>
              <p className="text-sm opacity-70 mb-3">40+ FairScore</p>
              <p className="text-xs opacity-60">Standard queue position</p>
            </div>
            <div className="rounded-xl p-6 bg-gradient-to-br from-orange-500 to-amber-500 text-orange-100">
              <Shield className="w-6 h-6 mb-3 opacity-70" />
              <h3 className="text-lg font-bold mb-1">Bronze</h3>
              <p className="text-sm opacity-70 mb-3">20+ FairScore</p>
              <p className="text-xs opacity-60">Proves commitment first</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why FairCircles */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-500 font-medium text-sm uppercase tracking-wider mb-3">
              Benefits
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
              Why Choose FairCircles
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              FairCircles brings the benefits of traditional ROSCAs to the blockchain with 
              additional advantages unique to onchain systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-zinc-800 rounded-xl">
              <FileCheck className="w-6 h-6 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Trustless Execution</h3>
              <p className="text-sm text-zinc-400">
                Smart contracts enforce all rules automatically. No intermediary can manipulate 
                contributions, payouts, or payout order.
              </p>
            </div>
            <div className="p-6 border border-zinc-800 rounded-xl">
              <Globe className="w-6 h-6 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Global Access</h3>
              <p className="text-sm text-zinc-400">
                Anyone with a Solana wallet can participate regardless of location, banking 
                status, or credit history.
              </p>
            </div>
            <div className="p-6 border border-zinc-800 rounded-xl">
              <Repeat className="w-6 h-6 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Full Transparency</h3>
              <p className="text-sm text-zinc-400">
                All contributions, payouts, and member activity are recorded onchain and 
                publicly verifiable at any time.
              </p>
            </div>
            <div className="p-6 border border-zinc-800 rounded-xl">
              <Clock className="w-6 h-6 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Flexible Timing</h3>
              <p className="text-sm text-zinc-400">
                Circle creators set round duration from hours to weeks, accommodating 
                different savings goals and schedules.
              </p>
            </div>
            <div className="p-6 border border-zinc-800 rounded-xl">
              <Wallet className="w-6 h-6 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Zero Platform Fees</h3>
              <p className="text-sm text-zinc-400">
                No platform takes a cut. Members only pay standard Solana network fees 
                for transactions.
              </p>
            </div>
            <div className="p-6 border border-zinc-800 rounded-xl">
              <Shield className="w-6 h-6 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Reputation Rewards</h3>
              <p className="text-sm text-zinc-400">
                Build verifiable onchain reputation that unlocks better circles and 
                payout priority over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Tradition */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-emerald-500 font-medium text-sm uppercase tracking-wider mb-3">
                Global Heritage
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                A Tradition Serving Over 1 Billion People
              </h2>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                ROSCAs exist in nearly every culture under different names. They have provided 
                financial access to communities underserved by traditional banking for hundreds 
                of years.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                FairCircles preserves the core benefits of these systems while adding the 
                security, transparency, and global accessibility of blockchain technology.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <p className="text-2xl mb-2">🇮🇳</p>
                <p className="text-white font-semibold mb-1">Chit Funds</p>
                <p className="text-sm text-zinc-500">India</p>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <p className="text-2xl mb-2">🇲🇽</p>
                <p className="text-white font-semibold mb-1">Tandas</p>
                <p className="text-sm text-zinc-500">Latin America</p>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <p className="text-2xl mb-2">🇳🇬</p>
                <p className="text-white font-semibold mb-1">Susus</p>
                <p className="text-sm text-zinc-500">West Africa</p>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <p className="text-2xl mb-2">🇨🇳</p>
                <p className="text-white font-semibold mb-1">Hui</p>
                <p className="text-sm text-zinc-500">China</p>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <p className="text-2xl mb-2">🇸🇦</p>
                <p className="text-white font-semibold mb-1">Gameya</p>
                <p className="text-sm text-zinc-500">Middle East</p>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <p className="text-2xl mb-2">🇵🇭</p>
                <p className="text-white font-semibold mb-1">Paluwagan</p>
                <p className="text-sm text-zinc-500">Philippines</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Start Building Trust Onchain
            </h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Connect your wallet to view your FairScore and discover circles 
              that match your reputation tier.
            </p>
            <WalletMultiButton 
              style={{
                background: 'rgb(16, 185, 129)',
                height: '52px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                padding: '0 28px',
                border: 'none',
              }}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Fair</span>
            <span className="text-lg font-bold text-emerald-500">Circles</span>
            <span className="text-zinc-500 text-sm ml-2">
              Built with FairScale on Solana
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
