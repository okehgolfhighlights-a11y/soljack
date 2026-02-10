<<<<<<< Updated upstream
import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";

interface CreatorStats {
  wins: number;
  losses: number;
  totalHands: number;
}
=======
import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../context/GameContext';
import { useGameProgram, findTablePda, FEE_DESTINATION, SystemProgram, BN } from '../lib/anchor';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

interface OpenTable {
  tableId: string;
  betAmount: number;
  creator: string;
  creatorUsername: string | null;
  creatorRole: "DEALER" | "PLAYER";
  openRole: "DEALER" | "PLAYER";
  creatorStats: CreatorStats;
  timeRemaining: number;
  createdAt: number;
}

interface Props {
  betTier: number;
}

export default function Lobby({ betTier }: Props) {
  const { publicKey } = useWallet();
  const program = useGameProgram();
  const [openTables, setOpenTables] = useState<OpenTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTable, setShowCreateTable] = useState(false);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

  const { setCurrentTableId } = useGame();

  useEffect(() => {
    let alive = true;

    const fetchTables = async () => {
      try {
        const res = await fetch(
          '${import.meta.env.VITE_BACKEND_URL}/tables/open?betAmount=${betTier * 1e9}'
        );
        const data = await res.json();
        if (alive) setOpenTables(data.tables || []);
      } catch (err) {
        console.error("Failed to fetch tables", err);
        if (alive) setOpenTables([]);
      } finally {
        if (alive) setLoading(false);
=======
  const [joiningTable, setJoiningTable] = useState<string | null>(null);
  const { setCurrentTableId } = useGame();

  useEffect(() => {
=======
  const [joiningTable, setJoiningTable] = useState<string | null>(null);
  const { setCurrentTableId } = useGame();

  useEffect(() => {
>>>>>>> Stashed changes
=======
  const [joiningTable, setJoiningTable] = useState<string | null>(null);
  const { setCurrentTableId } = useGame();

  useEffect(() => {
>>>>>>> Stashed changes
    const fetchTables = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/tables/open?betAmount=${Math.floor(betTier * 1e9)}`);
        if (!response.ok) {
          console.warn('Failed to fetch tables from backend');
          return;
        }
        const data = await response.json();
        setOpenTables(data.tables || []);
      } catch (error) {
        console.error('Error fetching tables:', error);
        setOpenTables([]);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      }
    };

    fetchTables();
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const interval = setInterval(fetchTables, 5000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [betTier]);

  const handleJoinTable = (tableId: string) => {
    setCurrentTableId(tableId);
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

    // Refresh every 5 seconds
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
  }, [betTier]);

  const handleCreateTable = () => {
    setShowCreateTable(true);
  };

  const handleJoinTable = async (tableId: string) => {
    if (!publicKey || !program) {
      alert('Please connect your wallet');
      return;
    }

    setJoiningTable(tableId);

    try {
      // The tableId IS the table PDA address
      const tablePda = new PublicKey(tableId);

      // Fetch table account to get creator address
      const tableAccount = await program.account.tableAccount.fetch(tablePda);
      const creatorPubkey = tableAccount.creator;

      console.log('Joining table:', tableId);
      console.log('Creator:', creatorPubkey.toString());

      // Call join_table instruction
      const tx = await program.methods
        .joinTable()
        .accounts({
          opponent: publicKey,
          creator: creatorPubkey,
          tableAccount: tablePda,
          feeDestination: FEE_DESTINATION,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Joined table! Transaction:', tx);

      // Navigate to table view
      setCurrentTableId(tableId);
    } catch (err: any) {
      console.error('Failed to join table:', err);

      let errorMsg = 'Failed to join table';
      if (err.message?.includes('insufficient')) {
        errorMsg = 'Insufficient SOL balance';
      } else if (err.message?.includes('full')) {
        errorMsg = 'Table is full';
      } else if (err.message) {
        errorMsg = err.message;
      }

      alert(errorMsg);
    } finally {
      setJoiningTable(null);
    }
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>{betTier} SOL Tables</h2>
        <button style={styles.createButton} onClick={() => setShowCreateTable(true)}>
          Create Table
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading tables…</div>
      ) : (
        <div style={styles.tableGrid}>
          {openTables.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No open tables at this tier.</p>
              <p>Be the first to create one.</p>
            </div>
          ) : (
            openTables.map((table) => (
              <TableCard
                key={table.tableId}
                table={table}
                onJoin={handleJoinTable}
              />
            ))
          )}
        </div>
      )}

      {showCreateTable && (
        <CreateTableModal
          betTier={betTier}
          onClose={() => setShowCreateTable(false)}
          onCreated={(id) => setCurrentTableId(id)}
        />
      )}
<<<<<<< Updated upstream
=======

      <div style={styles.tableGrid}>
        {openTables.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No open tables at this bet tier.</p>
            <p>Be the first to create one!</p>
          </div>
        ) : (
          openTables.map((table) => (
            <TableCard
              key={table.tableId}
              table={table}
              onJoin={handleJoinTable}
              isJoining={joiningTable === table.tableId}
            />
          ))
        )}
      </div>
>>>>>>> Stashed changes
    </div>
  );
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
/* =======================
   TABLE CARD
======================= */

function TableCard({
  table,
  onJoin,
}: {
  table: OpenTable;
  onJoin: (id: string) => void;
}) {
=======
function TableCard({ table, onJoin, isJoining }: { table: OpenTable; onJoin: (id: string) => void; isJoining?: boolean }) {
>>>>>>> Stashed changes
=======
function TableCard({ table, onJoin, isJoining }: { table: OpenTable; onJoin: (id: string) => void; isJoining?: boolean }) {
>>>>>>> Stashed changes
=======
function TableCard({ table, onJoin, isJoining }: { table: OpenTable; onJoin: (id: string) => void; isJoining?: boolean }) {
>>>>>>> Stashed changes
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return '${m}:${s.toString().padStart(2, "0")}';
  };

  return (
    <div
      style={{...styles.tableCard, opacity: isJoining ? 0.6 : 1}}
      onClick={() => !isJoining && onJoin(table.tableId)}
    >
      <div style={styles.cardHeader}>
        <span style={table.creatorUsername ? styles.usernameGold : styles.usernameDefault}>
          {table.creatorUsername ??
            `${table.creator.slice(0, 4)}…${table.creator.slice(-4)}`}
        </span>
        <span style={styles.timer}>{formatTime(table.timeRemaining)}</span>
      </div>

      <div style={styles.seatsContainer}>
        <Seat
          label="DEALER"
          taken={table.creatorRole === "DEALER"}
          name={
            table.creatorRole === "DEALER"
              ? table.creatorUsername ?? table.creator.slice(0, 4)
              : null
          }
        />
        <Seat
          label="PLAYER"
          taken={table.creatorRole === "PLAYER"}
          name={
            table.creatorRole === "PLAYER"
              ? table.creatorUsername ?? table.creator.slice(0, 4)
              : null
          }
        />
      </div>

      <div style={styles.stats}>
        {table.creatorStats.wins}W / {table.creatorStats.losses}L
        <span style={styles.handsPlayed}>
          ({table.creatorStats.totalHands} hands)
        </span>
      </div>
    </div>
  );
}

function Seat({
  label,
  taken,
  name,
}: {
  label: string;
  taken: boolean;
  name: string | null;
}) {
  return (
    <div style={taken ? styles.seatTaken : styles.seatOpen}>
      <div style={styles.seatLabel}>{label}</div>
      {name && <div style={styles.playerInfo}>{name}</div>}
    </div>
  );
}

/* =======================
   CREATE TABLE MODAL
======================= */

function CreateTableModal({
  betTier,
  onClose,
  onCreated,
}: {
  betTier: number;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const [role, setRole] = useState<"DEALER" | "PLAYER" | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!role) return;
    setCreating(true);

    try {
      // TEMP mock until backend instruction wired
      const mockId = 'table_${Date.now()}';
      onCreated(mockId);
      onClose();
    } catch (err) {
      console.error("Create table failed", err);
    } finally {
      setCreating(false);
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  const { publicKey } = useWallet();
  const program = useGameProgram();
  const [selectedRole, setSelectedRole] = useState<'DEALER' | 'PLAYER' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!selectedRole || !publicKey || !program) return;

    setIsCreating(true);
    setError('');

    try {
      // Generate a unique table seed based on timestamp
      const tableSeed = new BN(Date.now());

      // Convert bet tier (in SOL) to lamports
      const betAmountLamports = new BN(betTier * 1e9);

      // Find table PDA
      const [tablePda] = findTablePda(program.programId, tableSeed);

      console.log('Creating table...');
      console.log('Table PDA:', tablePda.toString());
      console.log('Bet amount:', betAmountLamports.toString(), 'lamports');
      console.log('Role:', selectedRole);

      // Create role enum object
      const role = selectedRole === 'DEALER' ? { dealer: {} } : { player: {} };

      // Call create_table instruction
      const tx = await program.methods
        .createTable(betAmountLamports, role, tableSeed)
        .accounts({
          creator: publicKey,
          tableAccount: tablePda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Table created! Transaction:', tx);

      // Use the table PDA as the table ID
      onCreated(tablePda.toString());
      onClose();
    } catch (err: any) {
      console.error('Failed to create table:', err);

      let errorMsg = 'Failed to create table';
      if (err.message?.includes('insufficient')) {
        errorMsg = 'Insufficient SOL balance';
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setIsCreating(false);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Create {betTier} SOL Table</h3>

        <div style={styles.roleSelector}>
          <button
            style={{
              ...styles.roleButton,
              background: role === "DEALER" ? "#90caf9" : "rgba(255,255,255,0.5)",
            }}
            onClick={() => setRole("DEALER")}
          >
            Dealer
          </button>
          <button
            style={{
              ...styles.roleButton,
              background: role === "PLAYER" ? "#90caf9" : "rgba(255,255,255,0.5)",
            }}
            onClick={() => setRole("PLAYER")}
          >
            Player
          </button>
        </div>

        {error && <div style={{ color: '#f44336', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}

        <div style={styles.modalActions}>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
          <button style={styles.cancelButton} onClick={onClose} disabled={isCreating}>
            Back
>>>>>>> Stashed changes
          </button>
          <button
            style={styles.confirmButton}
            disabled={!role || creating}
            onClick={handleCreate}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
          >
            {creating ? "Creating…" : "Create"}
=======
            disabled={!selectedRole || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Table'}
>>>>>>> Stashed changes
=======
            disabled={!selectedRole || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Table'}
>>>>>>> Stashed changes
=======
            disabled={!selectedRole || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Table'}
>>>>>>> Stashed changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* =======================
   STYLES
======================= */

const styles: { [k: string]: React.CSSProperties } = {
  container: { maxWidth: 1200, margin: "0 auto", padding: 20 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: { fontSize: 28, fontWeight: "bold" },
  createButton: {
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "12px 24px",
    cursor: "pointer",
  },
  loading: { textAlign: "center", padding: 60, fontSize: 18 },
  tableGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
    gap: 20,
  },
  emptyState: { textAlign: "center", color: "#666" },
  tableCard: {
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(10px)",
    borderRadius: 12,
    padding: 20,
    cursor: "pointer",
    transition: "all .3s ease",
  },
  cardHeader: { display: "flex", justifyContent: "space-between" },
  usernameGold: {
    fontWeight: 600,
    background: "linear-gradient(135deg,#ffd700,#ffed9e)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  usernameDefault: { fontWeight: 600 },
  timer: {
    background: "rgba(0,0,0,0.1)",
    padding: "4px 8px",
    borderRadius: 4,
  },
  seatsContainer: { display: "flex", gap: 10, marginTop: 15 },
  seatTaken: {
    flex: 1,
    background: "rgba(144,202,249,.3)",
    border: "2px solid #90caf9",
    borderRadius: 8,
    padding: 15,
  },
  seatOpen: {
    flex: 1,
    background: "rgba(129,212,250,.2)",
    border: "2px dashed #81d4fa",
    borderRadius: 8,
    padding: 15,
  },
  seatLabel: { fontSize: 12, fontWeight: 600, color: "#666" },
  playerInfo: { marginTop: 5, fontWeight: 500 },
  stats: { textAlign: "center", marginTop: 10, fontSize: 14 },
  handsPlayed: { marginLeft: 6, fontSize: 12 },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: 16,
    padding: 30,
    width: "90%",
    maxWidth: 500,
  },
  modalTitle: { fontSize: 24, marginBottom: 20 },
  roleSelector: { display: "flex", gap: 15, marginBottom: 30 },
  roleButton: {
    flex: 1,
    padding: 20,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 18,
  },
  modalActions: { display: "flex", gap: 10 },
  cancelButton: {
    flex: 1,
    background: "rgba(0,0,0,.1)",
    border: "none",
    padding: 12,
    borderRadius: 8,
  },
  confirmButton: {
    flex: 1,
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "white",
    border: "none",
    padding: 12,
    borderRadius: 8,
  },
};