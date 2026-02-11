import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  useUsernameProgram,
  findUsernamePda,
  findWalletPda,
  FEE_DESTINATION,
  SystemProgram,
} from "../lib/anchor";

interface Props {
  onClose: () => void;
}

export default function UsernameModal({ onClose }: Props) {
  const { publicKey } = useWallet();
  const program = useUsernameProgram();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!publicKey || !program) return;

    setError("");

    if (username.length < 3 || username.length > 20) {
      setError("Username must be 3–20 characters");
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError("Only letters and numbers allowed");
      return;
    }

    setIsSubmitting(true);

    try {
      const [usernamePda] = findUsernamePda(program.programId, username);
      const [walletPda] = findWalletPda(program.programId, publicKey);

      await program.methods
        .claimUsername(username)
        .accounts({
          user: publicKey,
          usernameAccount: usernamePda,
          walletAccount: walletPda,
          feeDestination: FEE_DESTINATION,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      onClose();
    } catch (err: any) {
      const msg = String(err?.message || err);

      if (msg.includes("insufficient")) {
        setError("Insufficient SOL balance");
      } else if (msg.includes("already in use")) {
        setError("Username already taken");
      } else {
        setError("Transaction failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "500px",
        }}
      >
        <h2>Claim Username</h2>
        <p>Cost: $1 USD in SOL (one-time)</p>

        <input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          placeholder="Enter username"
          maxLength={20}
          style={{ width: "100%", padding: "15px", fontSize: "16px" }}
        />

        {error && <div style={{ color: "#f44336" }}>{error}</div>}

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !username}
          >
            {isSubmitting ? "Claiming…" : "Claim for $1"}
          </button>
        </div>
      </div>
    </div>
  );
}