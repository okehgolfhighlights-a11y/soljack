// src/components/HomePage.tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function HomePage() {
  const { publicKey } = useWallet();

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>SolJack Riviera</h1>
      <p>Mediterranean Luxury × Solana Blackjack</p>
      
      <div style={{ margin: '2rem 0' }}>
        <WalletMultiButton />
      </div>

      {publicKey && (
        <div>
          <p>Welcome! Ready to play?</p>
          <button 
            onClick={() => window.location.href = '/lobby'}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              backgroundColor: '#0077BE',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Enter Lobby
          </button>
        </div>
      )}
    </div>
  );
}