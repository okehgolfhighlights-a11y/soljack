import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useMemo } from 'react';

import gameIdl from './idl/soljack_game.json';
import usernameIdl from './idl/username_registry.json';

const FEE_DESTINATION = new PublicKey('7KwQDkHVKGJ5BQ89JN83XeG1kvWdFHhf7QH5o67jiym4');

export function useGameProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    const programId = import.meta.env.VITE_GAME_PROGRAM_ID ||
      'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnT';

    return new Program(gameIdl as any, new PublicKey(programId), provider);
  }, [connection, wallet]);
}

export function useUsernameProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    const programId = import.meta.env.VITE_USERNAME_PROGRAM_ID ||
      'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';

    return new Program(usernameIdl as any, new PublicKey(programId), provider);
  }, [connection, wallet]);
}

// Helper to find table PDA
export function findTablePda(programId: PublicKey, tableSeed: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('table'),
      tableSeed.toArrayLike(Buffer, 'le', 8)
    ],
    programId
  );
}

// Helper to find username PDA
export function findUsernamePda(programId: PublicKey, username: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('username'),
      Buffer.from(username.toLowerCase())
    ],
    programId
  );
}

// Helper to find wallet PDA
export function findWalletPda(programId: PublicKey, wallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('wallet'),
      wallet.toBuffer()
    ],
    programId
  );
}

// Export constants
export { FEE_DESTINATION, SystemProgram, BN };
