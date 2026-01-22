import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { SOLANA_RPC_URL } from './constants';

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

/**
 * Check if wallet has enough SOL for transaction
 */
export async function checkBalance(publicKey: PublicKey, requiredSOL: number = 0.5): Promise<{
  hasEnough: boolean;
  balance: number;
  required: number;
}> {
  const balance = await connection.getBalance(publicKey);
  const balanceSOL = balance / LAMPORTS_PER_SOL;
  
  return {
    hasEnough: balanceSOL >= requiredSOL,
    balance: balanceSOL,
    required: requiredSOL,
  };
}

/**
 * Request airdrop on devnet (only works on devnet)
 */
export async function requestAirdrop(publicKey: PublicKey, amount: number = 2): Promise<string> {
  try {
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  } catch (error) {
    console.error('Airdrop failed:', error);
    throw new Error('Failed to request airdrop. The devnet faucet may be rate limited.');
  }
}

/**
 * Get wallet balance in SOL
 */
export async function getBalance(publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}
