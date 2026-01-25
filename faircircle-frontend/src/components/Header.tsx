import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useFairScore } from '../hooks/useFairScore';
import { TIER_COLORS, getTierFromScore } from '../types';
import { Shield } from 'lucide-react';

export function Header() {
  const { connected, disconnect } = useWallet();
  const { fairScore } = useFairScore();

  const tier = fairScore ? (fairScore.tier || getTierFromScore(fairScore.fair_score)) : 'unrated';
  const colors = TIER_COLORS[tier];

  const handleLogoClick = () => {
    if (connected) {
      disconnect();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo - Clean text-based design */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-1 group cursor-pointer"
          >
            <span className="text-2xl font-bold tracking-tight text-white">
              Fair
            </span>
            <span className="text-2xl font-bold tracking-tight text-emerald-500">
              Circles
            </span>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* FairScore Badge */}
            {connected && fairScore && (
              <div className={`hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 ${colors.text}`}>
                <Shield className="w-4 h-4 opacity-80" />
                <span className="text-sm font-semibold">
                  {Math.round(fairScore.fair_score)}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                  {tier}
                </span>
              </div>
            )}

            {/* Wallet Button */}
            <WalletMultiButton 
              style={{
                background: 'rgb(39, 39, 42)',
                height: '44px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid rgb(63, 63, 70)',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
