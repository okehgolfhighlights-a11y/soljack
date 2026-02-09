import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "../context/GameContext";
import { useGameProgram } from "../lib/anchor";
import * as crypto from "crypto-browserify";

// Helper to convert card value to display
function cardToString(card: number): string {
  const suits = ["♠️", "♥️", "♦️", "♣️"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const suit = suits[Math.floor(card / 13)];
  const rank = ranks[card % 13];
  return ${rank}${suit};
}

function isRedSuit(cardStr: string) {
  return cardStr.includes("♥️") || cardStr.includes("♦️");
}

function HandTotalPill({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.totalPill}>
      <span style={styles.totalPillLabel}>{label}</span>
      <span style={styles.totalPillValue}>{value}</span>
    </div>
  );
}

function ActiveGame({
  tableData,
  tablePda,
  onLeave,
}: {
  tableData: any;
  tablePda: PublicKey;
  onLeave: () => void;
}) {
  const { publicKey } = useWallet();
  const program = useGameProgram();
  const [actionInProgress, setActionInProgress] = useState(false);

  const isCreator = tableData.creator.equals(publicKey);
  const myRole = isCreator
    ? tableData.creatorRole
    : tableData.creatorRole.dealer
    ? { player: {} }
    : { dealer: {} };

  const myHand = isCreator ? tableData.creatorHand : tableData.opponentHand;
  const myTotal = isCreator ? tableData.creatorTotal : tableData.opponentTotal;
  const opponentHand = isCreator ? tableData.opponentHand : tableData.creatorHand;
  const opponentTotal = isCreator ? tableData.opponentTotal : tableData.creatorTotal;

  const isMyTurn =
    tableData.currentTurn &&
    ((tableData.currentTurn.dealer && myRole.dealer) ||
      (tableData.currentTurn.player && myRole.player));

  const betSol = Number(tableData.betAmount ?? 0) / 1e9;

  const handleHit = async () => {
    if (!publicKey  !program  actionInProgress) return;

    setActionInProgress(true);
    try {
      const tx = await program.methods
        .hit()
        .accounts({
          player: publicKey,
          tableAccount: tablePda,
        })
        .rpc();

      console.log("Hit transaction:", tx);
    } catch (err: any) {
      console.error("Failed to hit:", err);
      alert(err.message || "Failed to hit");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleStand = async () => {
    if (!publicKey  !program  actionInProgress) return;

    setActionInProgress(true);
    try {
      const tx = await program.methods
        .stand()
        .accounts({
          player: publicKey,
          tableAccount: tablePda,
        })
        .rpc();

      console.log("Stand transaction:", tx);
    } catch (err: any) {
      console.error("Failed to stand:", err);
      alert(err.message || "Failed to stand");
    } finally {
      setActionInProgress(false);
    }
  };

  const renderFanHand = (hand: number[], variant: "dealer" | "player") => {
    const len = hand.length;
    const mid = (len - 1) / 2;

    return (
      <div style={variant === "dealer" ? styles.dealerCardsRow : styles.playerCardsRow}>
        {hand.map((card: number, i: number) => {
          const str = cardToString(card);
          const offset = i - mid;

          // Fan + arc effect
          const rotate = offset * (variant === "dealer" ? 6 : 9);
          const translateY =
            variant === "dealer"
              ? Math.abs(offset) * 2
              : Math.abs(offset) * 6;

          const translateX = offset * (variant === "dealer" ? 34 : 40);

          const cardStyle = {
            ...styles.card,
            ...(variant === "dealer" ? styles.cardDealer : styles.cardPlayer),
            transform: translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg),
            color: isRedSuit(str) ? "#c81e1e" : "#121212",
          } as React.CSSProperties;

          return (
            <div key={i} style={cardStyle}>
              <div style={styles.cardInner}>
                <div style={styles.cardTop}>{str}</div>
                <div style={styles.cardSuit}>{str.slice(-1)}</div>
                <div style={styles.cardBottom}>{str}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.scene}>
      <div style={styles.sceneInner}>
        <div style={styles.topBar}>
          <div style={styles.titleBlock}>
            <div style={styles.gameTitle}>SolJack</div>
            <div style={styles.subTitle}>
              You are <b>{myRole.dealer ? "Dealer" : "Player"}</b> • Bet{" "}
              <b>{betSol.toFixed(2)} SOL</b>
            </div>
          </div>

          <button style={styles.leaveButton} onClick={onLeave}>
            Leave
          </button>
        </div>

        {/* Felt Table */}
        <div style={styles.tableWrap}>
          <div style={styles.tableRail} />
          <div style={styles.tableFelt}>
            {/* Dealer Zone */}
            <div style={styles.dealerZone}>
              <div style={styles.zoneHeader}>
                <div style={styles.zoneLabel}>
                  Dealer <span style={styles.zoneMuted}>(Opponent)</span>
                </div>
                <HandTotalPill label="Total" value={opponentTotal} />
              </div>

              <div style={styles.handAreaDealer}>
                {renderFanHand(opponentHand, "dealer")}
              </div>

              {!isMyTurn && (
                <div style={styles.turnPillTheir}>
                  Their turn
                </div>
              )}
            </div>

            {/* Center Chips / Bet area */}
            <div style={styles.centerArea}>
              <div style={styles.betChipRow}>
                <div style={styles.chip} />
                <div style={styles.chip} />
                <div style={styles.chip} />
              </div>
              <div style={styles.betText}>
                Pot: <b>{(betSol * 2).toFixed(2)} SOL</b>
              </div>
              <div style={styles.smallNote}>Provably fair shuffle • Commit/Reveal</div>
            </div>

            {/* Player Zone (Arc) */}
            <div style={styles.playerZone}>
              <div style={styles.zoneHeader}>
                <div style={styles.zoneLabel}>
                  You <span style={styles.zoneMuted}>({myRole.dealer ? "Dealer" : "Player"})</span>
                </div>
                <HandTotalPill label="Total" value={myTotal} />
              </div>

              <div style={styles.handAreaPlayer}>
                {renderFanHand(myHand, "player")}
              </div>

              {isMyTurn ? (
                <div style={styles.actions}>
                  <button
                    style={{
                      ...styles.actionBtn,
                      ...styles.hitButton,
                      opacity: actionInProgress ? 0.7 : 1,
                    }}
                    onClick={handleHit}
                    disabled={actionInProgress}
                  >
                    {actionInProgress ? "…" : "HIT"}
                  </button>

                  <button
                    style={{
                      ...styles.actionBtn,
                      ...styles.standButton,
                      opacity: actionInProgress ? 0.7 : 1,
                    }}
                    onClick={handleStand}
                    disabled={actionInProgress}
                  >
                    {actionInProgress ? "…" : "STAND"}
                  </button>
                </div>
              ) : (
                <div style={styles.waitingMessage}>Waiting for opponent…</div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.footerHint}>
          Tip: You can refresh without losing your seat — table state is on-chain.
        </div>
      </div>
    </div>
  );
}

export default function TableSimple() {
  const { currentTableId, setCurrentTableId } = useGame();
  const { publicKey } = useWallet();
  const program = useGameProgram();

  const [tableData, setTableData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Poll table state
  useEffect(() => {
    if (!currentTableId || !program) return;

    const fetchTable = async () => {
      try {
        const tablePda = new PublicKey(currentTableId);
        const data = await program.account.tableAccount.fetch(tablePda);
        setTableData(data);
        setLoading(false);

        // Auto-handle commit/reveal phases
        await autoHandlePhases(data, tablePda);
      } catch (err) {
        console.error("Error fetching table:", err);
        setError("Failed to load table");
        setLoading(false);
      }
    };

    fetchTable();
    const interval = setInterval(fetchTable, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTableId, program, publicKey]);

  const autoHandlePhases = async (data: any, tablePda: PublicKey) => {
    if (!publicKey || !program) return;

    const isCreator = data.creator.equals(publicKey);
    const isOpponent = data.opponent?.equals(publicKey);

    if (!isCreator && !isOpponent) return;

    // Phase: Committing - submit our commitment
    if (data.state.committing) {
      const needsCommitment =
        (isCreator && !data.creatorCommitment) ||
        (isOpponent && !data.opponentCommitment);

      if (needsCommitment) {
        try {
          const seed = crypto.randomBytes(32);
          const hash = crypto.createHash("sha256");
          hash.update(seed);
          const commitment = hash.digest();

          localStorage.setItem(`table_${currentTableId}_seed`, seed.toString("hex"));

          await program.methods
            .submitCommitment(Array.from(commitment))
            .accounts({
              player: publicKey,
              tableAccount: tablePda,
            })
            .rpc();

          console.log("Commitment submitted");
        } catch (err) {
          console.error("Failed to submit commitment:", err);
        }
      }
    }

    // Phase: Both committed, need to reveal
    if (data.creatorCommitment && data.opponentCommitment) {
      const needsReveal =
        (isCreator && !data.creatorSeedRevealed) ||
        (isOpponent && !data.opponentSeedRevealed);

      if (needsReveal) {
        try {
          const seedHex = localStorage.getItem(`table_${currentTableId}_seed`);
          if (!seedHex) {
            console.error("Seed not found in localStorage");
            return;
          }

          const seed = Buffer.from(seedHex, "hex");

          await program.methods
            .revealSeed(Array.from(seed))
            .accounts({
              player: publicKey,
              tableAccount: tablePda,
            })
            .rpc();

          console.log("Seed revealed");
        } catch (err) {
          console.error("Failed to reveal seed:", err);
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.loading}>Loading table…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.error}>{error}</div>
        <button style={styles.simpleBtn} onClick={() => setCurrentTableId(null)}>
          Back to Lobby
        </button>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.error}>Table not found</div>
        <button style={styles.simpleBtn} onClick={() => setCurrentTableId(null)}>
          Back to Lobby
        </button>
      </div>
    );
  }

  const isWaiting = !tableData.opponent;
  const isCommitting = tableData.state.committing;
  const isActive = tableData.state.active;
  const isSettled = tableData.state.settled;

  const betSol = Number(tableData.betAmount ?? 0) / 1e9;

  if (isWaiting) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.cardPanel}>
          <h2 style={styles.panelTitle}>Waiting for opponent…</h2>
          <div style={styles.panelRow}>Table: <b>{currentTableId?.slice(0, 10)}…</b></div>
          <div style={styles.panelRow}>Bet: <b>{betSol.toFixed(2)} SOL</b></div>
          <button style={styles.simpleBtn} onClick={() => setCurrentTableId(null)}>
            Leave Table
          </button>
        </div>
      </div>
    );
  }

  if (isCommitting) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.cardPanel}>
          <h2 style={styles.panelTitle}>Shuffling deck…</h2>
          <div style={styles.smallNote}>Provably fair commit-reveal protocol</div>
          <div style={styles.panelRow}>Creator committed: {tableData.creatorCommitment ? "✓" : "…"}</div>
          <div style={styles.panelRow}>Opponent committed: {tableData.opponentCommitment ? "✓" : "…"}</div>
          <div style={styles.panelRow}>Creator revealed: {tableData.creatorSeedRevealed ? "✓" : "…"}</div>
          <div style={styles.panelRow}>Opponent revealed: {tableData.opponentSeedRevealed ? "✓" : "…"}</div>
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <ActiveGame
        tableData={tableData}
        tablePda={new PublicKey(currentTableId!)}
        onLeave={() => setCurrentTableId(null)}
      />
    );
  }

  if (isSettled) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.cardPanel}>
          <h2 style={styles.panelTitle}>Game Complete!</h2>
          <div style={styles.smallNote}>Final results will be displayed here.</div>
          <button style={styles.simpleBtn} onClick={() => setCurrentTableId(null)}>
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.centerScreen}>
      <div style={styles.cardPanel}>
        <h2 style={styles.panelTitle}>Unknown State</h2>
        <pre style={styles.pre}>{JSON.stringify(tableData, null, 2)}</pre>
        <button style={styles.simpleBtn} onClick={() => setCurrentTableId(null)}>
          Back to Lobby
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  // Scene / background
  scene: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 20% 0%, rgba(120, 0, 255, 0.18), transparent 40%), radial-gradient(circle at 80% 10%, rgba(0, 200, 255, 0.15), transparent 45%), linear-gradient(180deg, #070b12 0%, #05060a 100%)",
    color: "#fff",
    padding: "24px 16px 40px",
  },
  sceneInner: {
    maxWidth: "980px",
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
    gap: "12px",
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  gameTitle: {
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },
  subTitle: {
    fontSize: "13px",
    opacity: 0.85,
  },

  // Table
  tableWrap: {
    position: "relative",
    borderRadius: "28px",
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
  },
  tableRail: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.55) 100%)",
    pointerEvents: "none",
  },
  tableFelt: {
    position: "relative",
    padding: "26px 18px 22px",
    background:
      "radial-gradient(circle at 50% 15%, rgba(60, 220, 120, 0.35) 0%, rgba(25, 140, 75, 0.32) 28%, rgba(11, 70, 36, 0.98) 72%), linear-gradient(180deg, #0f5b2b 0%, #083519 100%)",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "inset 0 0 120px rgba(0,0,0,0.45)",
    minHeight: "620px",
  },

  dealerZone: {
    padding: "10px 10px 0",
  },
  playerZone: {
    marginTop: "18px",
    padding: "18px 14px 16px",
    borderTopLeftRadius: "320px",
    borderTopRightRadius: "320px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "inset 0 0 35px rgba(0,0,0,0.25)",
  },
  zoneHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "12px",
  },
  zoneLabel: {
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.2px",
  },
  zoneMuted: {
    opacity: 0.75,
    fontWeight: 600,
  },

  // Center area
  centerArea: {
    marginTop: "10px",
    marginBottom: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    opacity: 0.95,
  },
  betChipRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  chip: {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    background:
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), rgba(255,255,255,0.1) 35%), linear-gradient(135deg, rgba(0, 220, 255, 0.55), rgba(160, 80, 255, 0.45))",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
  },
  betText: {
    fontSize: "14px",
  },
  smallNote: {
    fontSize: "12px",
    opacity: 0.75,
    textAlign: "center",
  },

  // Turn pills
  turnPillTheir: {
    marginTop: "10px",
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontSize: "12px",
    opacity: 0.9,
  },

  // Cards
  handAreaDealer: {
    position: "relative",
    height: "120px",
  },
  handAreaPlayer: {
    position: "relative",
    height: "170px",
  },
  dealerCardsRow: {
    position: "absolute",
    left: "50%",
    top: "18px",
    transform: "translateX(-50%)",
    height: "120px",
  },
  playerCardsRow: {
    position: "absolute",
    left: "50%",
    top: "10px",
    transform: "translateX(-50%)",
    height: "170px",
  },
  card: {
    position: "absolute",
    width: "78px",
    height: "112px",
    borderRadius: "14px",
    background: "linear-gradient(180deg, #ffffff 0%, #f2f2f2 100%)",
    border: "1px solid rgba(0,0,0,0.25)",
    boxShadow: "0 18px 35px rgba(0,0,0,0.35)",
    userSelect: "none",
  },
  cardDealer: {
    width: "70px",
    height: "102px",
    opacity: 0.95,
  },
  cardPlayer: {
    width: "84px",
    height: "122px",
    opacity: 1,
  },
  cardInner: {
    width: "100%",
    height: "100%",
    borderRadius: "14px",
    padding: "10px",
    position: "relative",
    boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.45)",
  },
  cardTop: {
    fontSize: "16px",
    fontWeight: 800,
  },
  cardSuit: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "34px",
    opacity: 0.25,
    fontWeight: 900,
  },
  cardBottom: {
    position: "absolute",
    right: "10px",
    bottom: "8px",
    fontSize: "16px",
    fontWeight: 800,
    transform: "rotate(180deg)",
  },

  // Total pill
  totalPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  totalPillLabel: {
    fontSize: "12px",
    opacity: 0.8,
  },
  totalPillValue: {
    fontSize: "13px",
    fontWeight: 800,
  },

  // Actions
  actions: {
    marginTop: "6px",
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },
  actionBtn: {
    border: "none",
    borderRadius: "16px",
    padding: "14px 26px",
    fontSize: "15px",
    fontWeight: 900,
    letterSpacing: "0.6px",
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
    color: "#0b0f14",
    minWidth: "120px",
  },
  hitButton: {
    background:
      "linear-gradient(135deg, rgba(60, 255, 170, 0.92) 0%, rgba(0, 210, 140, 0.92) 60%, rgba(0, 170, 120, 0.92) 100%)",
  },
  standButton: {
    background:
      "linear-gradient(135deg, rgba(255, 120, 120, 0.95) 0%, rgba(255, 80, 120, 0.95) 55%, rgba(210, 40, 100, 0.95) 100%)",
    color: "#14070b",
  },
  waitingMessage: {
    marginTop: "10px",
    textAlign: "center",
    fontSize: "13px",
    opacity: 0.8,
  },

  // Buttons / misc
  leaveButton: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "12px",
    padding: "10px 14px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  footerHint: {
    marginTop: "12px",
    fontSize: "12px",
    opacity: 0.6,
    textAlign: "center",
  },

  // Simple states (waiting/committing/etc)
  centerScreen: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 20% 0%, rgba(120, 0, 255, 0.18), transparent 40%), radial-gradient(circle at 80% 10%, rgba(0, 200, 255, 0.15), transparent 45%), linear-gradient(180deg, #070b12 0%, #05060a 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  cardPanel: {
    width: "100%",
    maxWidth: "520px",
    borderRadius: "18px",
    padding: "18px 16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },
  panelTitle: {
    margin: "0 0 10px 0",
    fontSize: "20px",
    fontWeight: 900,
  },
  panelRow: {
    fontSize: "14px",
    opacity: 0.9,
    marginTop: "6px",
  },
  loading: {
    fontSize: "18px",
    fontWeight: 800,
    opacity: 0.9,
  },
  error: {
    color: "#ff7a7a",
    fontSize: "14px",
    marginBottom: "12px",
    fontWeight: 700,
  },
  simpleBtn: {
    marginTop: "14px",
    width: "100%",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "12px",
    padding: "12px 14px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },
  pre: {
    marginTop: "10px",
    maxHeight: "240px",
    overflow: "auto",
    fontSize: "12px",
    background: "rgba(0,0,0,0.25)",
    padding: "10px",
    borderRadius: "12px",
  },
};