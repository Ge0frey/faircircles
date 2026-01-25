import { useWallet } from '@solana/wallet-adapter-react';
import { WalletProvider } from './components/WalletProvider';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { Notifications } from './components/Notifications';
import './App.css';

function AppContent() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-zinc-950 text-white bg-noise relative">
      {/* Subtle background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {connected ? <Dashboard /> : <LandingPage />}
        </main>
      </div>
      <Notifications />
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;
