import { useWallet } from '@solana/wallet-adapter-react';
import { useFairScore } from '../hooks/useFairScore';
import { useCircleProgram } from '../hooks/useCircleProgram';
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
  X,
  Zap,
  TrendingUp
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
    if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.round(seconds / 86400)}d`;
    return `${Math.round(seconds / 604800)}w`;
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

  const statusConfig = {
    Forming: { 
      bg: 'bg-blue-500/10', 
      text: 'text-blue-400', 
      border: 'border-blue-500/20',
      icon: Users
    },
    Active: { 
      bg: 'bg-emerald-500/10', 
      text: 'text-emerald-400', 
      border: 'border-emerald-500/20',
      icon: TrendingUp
    },
    Completed: { 
      bg: 'bg-purple-500/10', 
      text: 'text-purple-400', 
      border: 'border-purple-500/20',
      icon: CheckCircle
    },
    Cancelled: { 
      bg: 'bg-red-500/10', 
      text: 'text-red-400', 
      border: 'border-red-500/20',
      icon: X
    },
  };

  const status = statusConfig[circle.status];
  const StatusIcon = status.icon;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.();
  };

  return (
    <div
      onClick={onSelect}
      className="group relative glass-card rounded-2xl p-6 hover-lift hover-glow transition-all duration-300 cursor-pointer"
    >
      {/* Top Section */}
      <div className="flex items-start justify-between mb-5">
        {/* Circle Name & Tier */}
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-emerald-400 transition-colors">
            {circle.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${colors.bg} ${colors.text}`}>
              <Shield className="w-3 h-3" />
              {getTierRequirementText(circle.minFairScore)}
            </div>
            {isMember && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                Member
              </div>
            )}
          </div>
        </div>

        {/* Status Badge and Dismiss */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showDismiss && circle.status === 'Completed' && (
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
              title="Remove from list"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${status.bg} ${status.text} border ${status.border}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {circle.status}
          </span>
        </div>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-zinc-800/40 group-hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Members</span>
          </div>
          <div className="text-white font-bold text-sm">{circle.memberCount}/10</div>
        </div>
        
        <div className="p-3 rounded-xl bg-zinc-800/40 group-hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <Coins className="w-3.5 h-3.5" />
            <span>Amount</span>
          </div>
          <div className="text-white font-bold text-sm">{lamportsToSOL(circle.contributionAmount)} SOL</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-800/40 group-hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Period</span>
          </div>
          <div className="text-white font-bold text-sm">{formatPeriod(circle.periodLength)}</div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-800/40 group-hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Pool</span>
          </div>
          <div className="text-white font-bold text-sm">{lamportsToSOL(circle.totalPool)} SOL</div>
        </div>
      </div>

      {/* Progress Bar (for active circles) */}
      {circle.status === 'Active' && (
        <div className="mb-5">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-zinc-500 font-medium">Round Progress</span>
            <span className="text-emerald-400 font-semibold">
              {circle.currentRound} / {circle.memberCount}
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 relative"
              style={{ width: `${(circle.currentRound / circle.memberCount) * 100}%` }}
            >
              <div className="absolute inset-0 animate-shimmer" />
            </div>
          </div>
        </div>
      )}

      {/* Action Section */}
      <div className="flex items-center gap-3">
        {canJoin && (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:transform-none"
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
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
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

        {!canJoin && !isMember && circle.status === 'Forming' && (
          <div className="flex items-center gap-2 text-zinc-500 bg-zinc-800/50 px-4 py-2.5 rounded-xl">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Requires {getTierRequirementText(circle.minFairScore)}</span>
          </div>
        )}

        <button
          onClick={onSelect}
          className="p-3 rounded-xl bg-zinc-800/50 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-all ml-auto group-hover:translate-x-1"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
