import { useWallet } from '@solana/wallet-adapter-react';
import { useFairScore } from '../hooks/useFairScore';
import { useCircleProgram } from '../hooks/useCircleProgram';
import { useStore } from '../store/useStore';
import type { Circle } from '../types';
import { TIER_COLORS, getTierFromScore100, lamportsToSOL } from '../types';
import { getTierRequirementText } from '../lib/fairscale';
import { 
  Users, 
  Coins, 
  Clock, 
  Shield, 
  ChevronRight,
  Play,
  UserPlus,
  CheckCircle,
  Lock,
  X
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  circle: Circle;
  onSelect?: () => void;
  showDismiss?: boolean;
  onDismiss?: () => void;
}

export function CircleCard({ circle, onSelect, showDismiss = false, onDismiss }: Props) {
  const { publicKey } = useWallet();
  const { fairScore, isEligible } = useFairScore();
  const { joinCircle, startCircle } = useCircleProgram();
  const [loading, setLoading] = useState(false);

  // Use getTierFromScore100 since minFairScore is on 0-100 scale
  const tier = getTierFromScore100(circle.minFairScore);
  const colors = TIER_COLORS[tier];
  
  const isCreator = publicKey?.equals(circle.creator);
  const isMember = circle.members.some(m => publicKey?.equals(m.address));
  const canJoin = !isMember && circle.status === 'Forming' && isEligible(circle.minFairScore);
  const canStart = isCreator && circle.status === 'Forming' && circle.memberCount >= 3;

  const formatPeriod = (seconds: number) => {
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 604800) return `${Math.round(seconds / 86400)} days`;
    return `${Math.round(seconds / 604800)} weeks`;
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fairScore) return;
    
    setLoading(true);
    try {
      await joinCircle(circle.creator, fairScore.fair_score);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await startCircle();
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    Forming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Completed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.();
  };

  return (
    <div
      onClick={onSelect}
      className="group relative bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-black/20"
    >
      {/* Status Badge and Dismiss Button */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {showDismiss && circle.status === 'Completed' && (
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
            title="Remove from list"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[circle.status]}`}>
          {circle.status}
        </span>
      </div>

      {/* Circle Name & Tier */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
          {circle.name}
        </h3>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
            {getTierRequirementText(circle.minFairScore)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Users className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-sm text-zinc-500">Members</div>
            <div className="text-white font-semibold">{circle.memberCount} / 10</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Coins className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-sm text-zinc-500">Contribution</div>
            <div className="text-white font-semibold">{lamportsToSOL(circle.contributionAmount)} SOL</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-sm text-zinc-500">Period</div>
            <div className="text-white font-semibold">{formatPeriod(circle.periodLength)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Shield className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-sm text-zinc-500">Pool</div>
            <div className="text-white font-semibold">{lamportsToSOL(circle.totalPool)} SOL</div>
          </div>
        </div>
      </div>

      {/* Progress Bar (for active circles) */}
      {circle.status === 'Active' && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-500">Round Progress</span>
            <span className="text-white font-medium">
              Round {circle.currentRound} of {circle.memberCount}
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(circle.currentRound / circle.memberCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {canJoin && (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Join Circle
              </>
            )}
          </button>
        )}

        {canStart && (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Circle
              </>
            )}
          </button>
        )}

        {isMember && (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Member</span>
          </div>
        )}

        {!canJoin && !isMember && circle.status === 'Forming' && (
          <div className="flex items-center gap-2 text-zinc-500">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Requires {getTierRequirementText(circle.minFairScore)}</span>
          </div>
        )}

        <button
          onClick={onSelect}
          className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors ml-auto"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
