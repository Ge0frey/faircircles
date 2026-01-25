import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AlertTriangle, RefreshCw, Wallet, ExternalLink, Coins } from 'lucide-react';

export function WalletBalance() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [airdropping, setAirdropping] = useState(false);

  const fetchBalance = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestAirdrop = async () => {
    if (!publicKey) return;
    
    setAirdropping(true);
    try {
      const signature = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature, 'confirmed');
      await fetchBalance();
      alert('Airdrop successful! You received 2 SOL.');
    } catch (error) {
      console.error('Airdrop failed:', error);
      alert('Airdrop failed. The devnet faucet may be rate limited. Please visit https://faucet.solana.com');
    } finally {
      setAirdropping(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey, connection]);

  if (!publicKey) return null;

  const needsAirdrop = balance !== null && balance < 0.5;

  return (
    <div className={`glass-card rounded-2xl p-5 ${
      needsAirdrop ? 'border border-amber-500/30' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            needsAirdrop ? 'bg-amber-500/10' : 'bg-emerald-500/10'
          }`}>
            {needsAirdrop ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <Wallet className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Devnet Balance</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {loading ? (
                <span className="text-zinc-500 text-lg">Loading...</span>
              ) : (
                <>
                  {balance?.toFixed(4) || '0.0000'} 
                  <span className="text-emerald-400 text-lg ml-1">SOL</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={fetchBalance}
          disabled={loading}
          className="p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 transition-colors text-zinc-500 hover:text-white disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {needsAirdrop && (
        <div className="space-y-3">
          <button
            onClick={requestAirdrop}
            disabled={airdropping}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
          >
            {airdropping ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <Coins className="w-4 h-4" />
                Request 2 SOL Airdrop
              </>
            )}
          </button>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/80 leading-relaxed">
              You need at least 0.5 SOL to create circles.{' '}
              <a 
                href="https://faucet.solana.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                Visit Solana Faucet
                <ExternalLink className="w-3 h-3" />
              </a>
              {' '}if airdrop fails.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
