import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useFairScore } from '../hooks/useFairScore';
import { TIER_COLORS, getTierFromScore } from '../types';
import { CircleDot, Shield } from 'lucide-react';

export function Header() {
  const { connected, publicKey } = useWallet();
  const { fairScore } = useFairScore();

  const tier = fairScore ? (fairScore.tier || getTierFromScore(fairScore.fair_score)) : 'unrated';
  const colors = TIER_COLORS[tier];

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <CircleDot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Fair<span className="text-emerald-400">Circles</span>
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider -mt-0.5">
                Reputation-Based ROSCAs
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* FairScore Badge */}
            {connected && fairScore && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} ${colors.text}`}>
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {Math.round(fairScore.fair_score)}
                </span>
                <span className="text-xs opacity-75 uppercase">
                  {tier}
                </span>
              </div>
            )}

            {/* Wallet Button */}
            <WalletMultiButton 
              style={{
                backgroundColor: 'rgb(39 39 42)',
                height: '40px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
