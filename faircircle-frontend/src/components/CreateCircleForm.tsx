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
  Rocket
} from 'lucide-react';

export function CreateCircleForm() {
  const { connected, publicKey } = useWallet();
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
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-8 border border-zinc-800 text-center">
        <Shield className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-zinc-500">
          You need to connect your wallet to create a FairCircle
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl p-6 border border-emerald-500/30">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Create a FairCircle</h2>
            <p className="text-emerald-300/80">
              Start a new trust circle and invite members to join
            </p>
          </div>
        </div>
      </div>

      {/* Circle Name */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" />
            Circle Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Diamond Hands Club"
            maxLength={32}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>{!isValidName && name.length > 0 ? 'Name must be 3-32 characters' : ''}</span>
            <span>{name.length}/32</span>
          </div>
        </label>
      </div>

      {/* Contribution Amount */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4" />
            Contribution per Round
          </span>
          <div className="relative">
            <input
              type="number"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              min={MIN_CONTRIBUTION}
              max={MAX_CONTRIBUTION}
              step="0.01"
              className="w-full px-4 py-3 pr-16 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
              SOL
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Each member contributes this amount every round. With 5 members, each payout would be {(contributionNum * 5).toFixed(2)} SOL
          </p>
        </label>
      </div>

      {/* Period Length */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 space-y-4">
        <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4" />
          Round Duration
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                period === option.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500">
          How long each round lasts before the pool rotates to the next member
        </p>
      </div>

      {/* Minimum FairScore */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 space-y-4">
        <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4" />
          Minimum FairScore Requirement
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MIN_FAIR_SCORE_OPTIONS.map((option) => {
            const optionColors = TIER_COLORS[option.tier];
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMinFairScore(option.value)}
                className={`px-4 py-3 rounded-xl font-medium transition-all text-left ${
                  minFairScore === option.value
                    ? `${optionColors.bg} ${optionColors.text}`
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div className={`p-4 rounded-xl ${tierColors.bg} ${tierColors.text} mt-4`}>
          <p className="text-sm font-medium">
            {minFairScore === 0 
              ? 'Anyone can join this circle, regardless of reputation'
              : `Only wallets with FairScore ${minFairScore}+ can join. Higher reputation = earlier payout position.`
            }
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Circle Preview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Total Rounds</span>
            <span className="text-white font-medium">Up to 10</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Max Pool Size</span>
            <span className="text-white font-medium">{(contributionNum * 10).toFixed(2)} SOL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Total Duration</span>
            <span className="text-white font-medium">
              {Math.round((period * 10) / 86400)} days max
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Your FairScore</span>
            <span className="text-white font-medium">
              {fairScore ? Math.round(fairScore.fair_score) : 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canCreate || loading}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
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
