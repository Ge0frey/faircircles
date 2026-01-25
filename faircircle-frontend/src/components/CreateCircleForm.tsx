import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useFairScore } from '../hooks/useFairScore';
import { useCircleProgram } from '../hooks/useCircleProgram';
import { useStore } from '../store/useStore';
import { PERIOD_OPTIONS, MIN_FAIR_SCORE_OPTIONS, MIN_CONTRIBUTION, MAX_CONTRIBUTION } from '../lib/constants';
import { TIER_COLORS, getTierFromScore } from '../types';
import { 
  Sparkles, 
  Users, 
  Coins, 
  Clock, 
  Shield,
  AlertCircle,
  Rocket,
  Zap,
  Check,
  Info
} from 'lucide-react';

export function CreateCircleForm() {
  const { connected } = useWallet();
  const { fairScore } = useFairScore();
  const { createCircle } = useCircleProgram();
  const { setActiveTab } = useStore();

  const [name, setName] = useState('');
  const [contribution, setContribution] = useState('1');
  const [period, setPeriod] = useState(PERIOD_OPTIONS[2].value); // 1 week default
  const [minFairScore, setMinFairScore] = useState(MIN_FAIR_SCORE_OPTIONS[2].value); // Silver default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedTier = getTierFromScore(minFairScore);
  const tierColors = TIER_COLORS[selectedTier];

  const contributionNum = parseFloat(contribution) || 0;
  const isValidContribution = contributionNum >= MIN_CONTRIBUTION && contributionNum <= MAX_CONTRIBUTION;
  const isValidName = name.trim().length >= 3 && name.trim().length <= 32;
  const canCreate = connected && isValidName && isValidContribution;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    setLoading(true);
    setError('');

    try {
      // Pass the creator's FairScore when creating the circle
      const creatorFairScore = fairScore?.fair_score || 0;
      
      // Verify creator meets minimum FairScore requirement
      if (creatorFairScore < minFairScore) {
        throw new Error(
          `Your FairScore (${creatorFairScore}) is below the minimum requirement (${minFairScore}). ` +
          'Please lower the minimum FairScore or improve your reputation.'
        );
      }
      
      await createCircle(name.trim(), contributionNum, period, minFairScore, creatorFairScore);
      setActiveTab('my-circles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create circle');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <div className="p-4 rounded-2xl bg-zinc-800/50 w-fit mx-auto mb-6">
          <Shield className="w-12 h-12 text-zinc-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">Connect Your Wallet</h3>
        <p className="text-zinc-500 max-w-sm mx-auto">
          You need to connect your wallet to create a FairCircle and start building your trust network.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
      {/* Header - Enhanced */}
      <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/5 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Create a FairCircle</h2>
            <p className="text-zinc-400">
              Start a new trust circle and invite members to join
            </p>
          </div>
        </div>
      </div>

      {/* Circle Name - Enhanced */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-zinc-800">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-white uppercase tracking-wide">Circle Name</span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Diamond Hands Club"
            maxLength={32}
            className="w-full px-5 py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-lg"
          />
          <div className="flex justify-between mt-3 text-xs">
            <span className={`${!isValidName && name.length > 0 ? 'text-red-400' : 'text-zinc-600'}`}>
              {!isValidName && name.length > 0 ? 'Name must be 3-32 characters' : 'Choose a memorable name for your circle'}
            </span>
            <span className="text-zinc-500 font-medium">{name.length}/32</span>
          </div>
        </label>
      </div>

      {/* Contribution Amount - Enhanced */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-zinc-800">
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-white uppercase tracking-wide">Contribution per Round</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              min={MIN_CONTRIBUTION}
              max={MAX_CONTRIBUTION}
              step="0.01"
              className="w-full px-5 py-4 pr-20 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-lg font-semibold"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-400 font-semibold">
              SOL
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-zinc-800/30">
            <Info className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <p className="text-xs text-zinc-400">
              With 5 members, each payout would be <span className="text-white font-semibold">{(contributionNum * 5).toFixed(2)} SOL</span>
            </p>
          </div>
        </label>
      </div>

      {/* Period Length - Enhanced */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-white uppercase tracking-wide">Round Duration</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`relative px-4 py-3.5 rounded-xl font-semibold transition-all ${
                period === option.value
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700/50'
              }`}
            >
              {period === option.value && (
                <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-white" />
              )}
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          How long each round lasts before the pool rotates to the next member
        </p>
      </div>

      {/* Minimum FairScore - Enhanced */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-white uppercase tracking-wide">Minimum FairScore</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MIN_FAIR_SCORE_OPTIONS.map((option) => {
            const optionColors = TIER_COLORS[option.tier];
            const isSelected = minFairScore === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMinFairScore(option.value)}
                className={`relative px-5 py-4 rounded-xl font-semibold transition-all text-left ${
                  isSelected
                    ? `${optionColors.bg} ${optionColors.text} ring-2 ring-offset-2 ring-offset-zinc-900`
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700/50'
                }`}
              >
                {isSelected && (
                  <Check className="absolute top-3 right-3 w-4 h-4" />
                )}
                <div className="font-bold text-sm">{option.label}</div>
              </button>
            );
          })}
        </div>
        <div className={`p-4 rounded-xl ${tierColors.bg} mt-4`}>
          <p className={`text-sm font-medium ${tierColors.text}`}>
            {minFairScore === 0 
              ? 'Anyone can join this circle, regardless of reputation score.'
              : `Only wallets with FairScore ${minFairScore}+ can join. Higher reputation = earlier payout position.`
            }
          </p>
        </div>
      </div>

      {/* Preview - Enhanced */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-white uppercase tracking-wide">Circle Summary</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-800/30">
            <div className="text-xs text-zinc-500 mb-1">Total Rounds</div>
            <div className="text-xl font-bold text-white">Up to 10</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-800/30">
            <div className="text-xs text-zinc-500 mb-1">Max Pool Size</div>
            <div className="text-xl font-bold text-gradient">{(contributionNum * 10).toFixed(2)} SOL</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-800/30">
            <div className="text-xs text-zinc-500 mb-1">Max Duration</div>
            <div className="text-xl font-bold text-white">{Math.round((period * 10) / 86400)} days</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-800/30">
            <div className="text-xs text-zinc-500 mb-1">Your FairScore</div>
            <div className="text-xl font-bold text-emerald-400">
              {fairScore ? Math.round(fairScore.fair_score) : '...'}
            </div>
          </div>
        </div>
      </div>

      {/* Error - Enhanced */}
      {error && (
        <div className="flex items-start gap-4 p-5 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="p-2 rounded-lg bg-red-500/20 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-red-400 mb-1">Error Creating Circle</p>
            <p className="text-sm text-red-300/80">{error}</p>
          </div>
        </div>
      )}

      {/* Submit - Enhanced */}
      <button
        type="submit"
        disabled={!canCreate || loading}
        className="w-full btn-primary flex items-center justify-center gap-3 px-8 py-5 rounded-xl text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Rocket className="w-5 h-5" />
            Create FairCircle
          </>
        )}
      </button>
    </form>
  );
}
