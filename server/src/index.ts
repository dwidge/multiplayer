import ws from "ws";
import { WebSocketServer } from "ws";
import { randId, randInt, randItem } from "./rand.js";
import fs from "fs";

const readJson = <T>(filePath) =>
  fs.promises.readFile(filePath, "utf-8").then((data) => JSON.parse(data) as T);

const startServer = async ({ port }: { port: number }) => {
  const wss = new WebSocketServer({ port, path: "/multiplayer-server/" });

  interface Player {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
  }
  const players: { [id: string]: Player } = {};
  type ServerMessage = {
    player?: Player;
    players?: { [id: string]: Player | null };
  };

  const colors = ["red", "blue", "green", "pink"];

  wss.on("connection", (ws) => {
    const id = randId();
    players[id] = {
      id,
      x: 100 + randInt(200),
      y: 100 + randInt(200),
      radius: 10,
      color: randItem(colors),
    };
    console.log("connect1", id);

    send({ player: players[id], players }, ws);
    broadcast({ players: { [id]: players[id] } }, ws);

    ws.on("message", (message: string, isBinary) => {
      // console.log("message1", id, message);
      const player = JSON.parse(message);
      // console.log("message2", id, player);
      players[id] = player;
      broadcast({ players: { [id]: player } });
    });

    ws.on("close", () => {
      console.log("close1", id);
      players[id] = null;
      broadcast({ players: { [id]: null } });
    });
  });

  function send(data: ServerMessage, client: ws) {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
  function broadcast(data: ServerMessage, exclude?: ws) {
    wss.clients.forEach((client) => {
      if (client !== exclude && client.readyState === ws.OPEN) {
        send(data, client);
      }
    });
  }

  console.log("WebSocket server started on ws://localhost:" + port);
};

readJson<{ port: number }>("assets/config.json").then(startServer);
