import React, { useEffect, useRef, useState } from "react";
import { useJson } from "./useJson";

interface Player {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
}

export const App: React.FC = () => {
  const config = useJson<{ host: string; port: number }>(
    `config.json?t=${new Date().getTime()}`
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [player, setPlayer] = useState<Player>();
  const [players, setPlayers] = useState<{ [id: string]: Player | null }>({});
  const socketRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (!config) return;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = undefined;

      const { host, port } = config;
      console.log("config1", { host, port });

      socketRef.current = new WebSocket(host);
      socketRef.current.onopen = () => {};
      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // console.log("onmessage1", data);
        if (data.player) setPlayer((prev) => ({ ...prev, ...data.player }));
        if (data.players) setPlayers((prev) => ({ ...prev, ...data.players }));
      };
    }, 1000);

    return () => {
      socketRef.current?.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [config]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const speed = 5;
      setPlayer((prev) => {
        if (!prev) return prev;
        const newPlayer = { ...prev };
        switch (event.key) {
          case "w":
            newPlayer.y -= speed;
            break;
          case "a":
            newPlayer.x -= speed;
            break;
          case "s":
            newPlayer.y += speed;
            break;
          case "d":
            newPlayer.x += speed;
            break;
        }
        return newPlayer;
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    const checkAndSendPlayerUpdate = () => {
      if (player) socketRef.current?.send(JSON.stringify(player));

      timeoutRef.current = undefined;
    };

    if (!timeoutRef.current)
      timeoutRef.current = window.setTimeout(checkAndSendPlayerUpdate, 200);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [player]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (player) drawPlayer(ctx, player);
      for (const id in players) {
        if (players[id] && id !== player?.id) {
          // Exclude the local player
          drawPlayer(ctx, players[id]);
        }
      }
    }
  }, [player, players]);

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();
  };

  return <canvas ref={canvasRef}></canvas>;
};
