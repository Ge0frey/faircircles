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
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {connected ? <Dashboard /> : <LandingPage />}
      </main>
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
