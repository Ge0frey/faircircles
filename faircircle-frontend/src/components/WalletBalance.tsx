import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AlertTriangle, RefreshCw, DollarSign } from 'lucide-react';

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
      alert('✅ Airdrop successful! You received 2 SOL.');
    } catch (error) {
      console.error('Airdrop failed:', error);
      alert('❌ Airdrop failed. The devnet faucet may be rate limited. Please visit https://faucet.solana.com');
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
    <div className={`rounded-xl p-4 border ${
      needsAirdrop 
        ? 'bg-amber-500/10 border-amber-500/30' 
        : 'bg-zinc-800/50 border-zinc-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            needsAirdrop ? 'bg-amber-500/20' : 'bg-emerald-500/20'
          }`}>
            {needsAirdrop ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <DollarSign className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="text-sm text-zinc-400">Devnet Balance</div>
            <div className="text-xl font-bold text-white">
              {loading ? (
                <span className="text-zinc-500">Loading...</span>
              ) : (
                `${balance?.toFixed(4) || '0.0000'} SOL`
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchBalance}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white disabled:opacity-50"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {needsAirdrop && (
            <button
              onClick={requestAirdrop}
              disabled={airdropping}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50 text-sm"
            >
              {airdropping ? 'Requesting...' : 'Request 2 SOL'}
            </button>
          )}
        </div>
      </div>
      
      {needsAirdrop && (
        <div className="mt-3 text-sm text-amber-300">
          ⚠️ You need at least 0.5 SOL to create circles (for account rent and fees).
          {' '}
          <a 
            href="https://faucet.solana.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-amber-200"
          >
            Visit the Solana Faucet
          </a>
          {' '}if the airdrop button doesn't work.
        </div>
      )}
    </div>
  );
}
