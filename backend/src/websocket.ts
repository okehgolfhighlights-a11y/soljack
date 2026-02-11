import { WebSocketServer, WebSocket } from "ws";
import { config } from "./config";
import { TournamentManager } from "./tournament/TournamentManager";

interface Client {
  ws: WebSocket;
  subscriptions: Set<string>;
}

const clients = new Map<WebSocket, Client>();

let onlineCount = 0;
let tournamentManager: TournamentManager | null = null;

/* -----------------------------
   ONLINE COUNT BROADCAST
------------------------------ */
function broadcastOnlineCount() {
  broadcastToAll({
    type: "online_count",
    count: onlineCount,
  });
}

/* -----------------------------
   INIT WEBSOCKET
------------------------------ */
export function initWebSocket(manager?: TournamentManager) {
  if (manager) {
    tournamentManager = manager;
  }

  const wss = new WebSocketServer({ port: config.wsPort });

  wss.on("connection", (ws: WebSocket) => {
    const client: Client = {
      ws,
      subscriptions: new Set(),
    };

    clients.set(ws, client);

    // increment online count
    onlineCount++;
    broadcastOnlineCount();

    console.log("Client connected. Total:", clients.size);

    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(client, message);
      } catch (error) {
        console.error("Invalid message:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
          })
        );
      }
    });

    ws.on("close", () => {
      clients.delete(ws);

      onlineCount = Math.max(0, onlineCount - 1);
      broadcastOnlineCount();

      console.log("Client disconnected. Total:", clients.size);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  console.log(`WebSocket server running on port ${config.wsPort}`);
  return wss;
}

/* -----------------------------
   HANDLE MESSAGE
------------------------------ */
function handleMessage(client: Client, message: any) {
  const { event, tableId } = message;

  switch (event) {
    /* -------------------------
       TABLE SUBSCRIPTIONS
    -------------------------- */
    case "subscribe":
      if (tableId) {
        client.subscriptions.add(tableId);
        client.ws.send(
          JSON.stringify({ event: "subscribed", tableId })
        );
      }
      break;

    case "unsubscribe":
      if (tableId) {
        client.subscriptions.delete(tableId);
        client.ws.send(
          JSON.stringify({ event: "unsubscribed", tableId })
        );
      }
      break;

    /* -------------------------
       TOURNAMENT EVENTS
    -------------------------- */

    case "join_tournament":
      if (!tournamentManager) {
        client.ws.send(
          JSON.stringify({
            type: "error",
            message: "Tournament system not initialized",
          })
        );
        break;
      }

      try {
        const count = tournamentManager.joinTournament(message.wallet);

        broadcastToAll({
          type: "tournament_update",
          tournament: tournamentManager.getTournament(),
        });

        client.ws.send(
          JSON.stringify({
            type: "joined_tournament",
            count,
          })
        );
      } catch (err: any) {
        client.ws.send(
          JSON.stringify({
            type: "error",
            message: err.message,
          })
        );
      }
      break;

    case "report_match_winner":
      if (!tournamentManager) break;

      try {
        tournamentManager.reportMatchWinner(
          message.matchId,
          message.winner
        );

        broadcastToAll({
          type: "tournament_update",
          tournament: tournamentManager.getTournament(),
        });
      } catch (err: any) {
        client.ws.send(
          JSON.stringify({
            type: "error",
            message: err.message,
          })
        );
      }
      break;

    default:
      client.ws.send(
        JSON.stringify({
          type: "error",
          message: "Unknown event type",
        })
      );
  }
}

/* -----------------------------
   BROADCAST HELPERS
------------------------------ */

export function broadcastToTable(tableId: string, data: any) {
  clients.forEach((client) => {
    if (
      client.subscriptions.has(tableId) &&
      client.ws.readyState === WebSocket.OPEN
    ) {
      client.ws.send(JSON.stringify(data));
    }
  });
}

export function broadcastToAll(data: any) {
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  });
}