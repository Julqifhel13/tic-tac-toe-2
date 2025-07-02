'use client';

import React, { useState } from "react";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type Player = "X" | "O" | null;

const emptyBoard: Player[] = Array(9).fill(null);

function calculateWinner(squares: Player[]): Player {
  const lines =     [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export const TicTacToeBoard: React.FC = () => {
  const [board, setBoard] = useState<Player[]>([...emptyBoard]);
  const [xIsNext, setXIsNext] = useState(true);
  const [playerX, setPlayerX] = useState("");
  const [playerO, setPlayerO] = useState("");
  const [namesSet, setNamesSet] = useState(false);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [showFinalConfetti, setShowFinalConfetti] = useState(false);
  const [gameMode, setGameMode] = useState<"menu" | "player" | "cpu">("menu");
  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);
  const clickAudioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (winner && !gameOver) {
      setTimeout(() => {
        setScore((prev) => {
          const newScore = { ...prev, [winner]: prev[winner as "X" | "O"] + 1 };
          if (newScore[winner as "X" | "O"] >= 3) {
            setGameOver(true);
          }
          return newScore;
        });
        setBoard([...emptyBoard]);
        setXIsNext(true);
      }, 1200);
    } else if (isDraw && !gameOver) {
      setTimeout(() => {
        setBoard([...emptyBoard]);
        setXIsNext(true);
      }, 1200);
    }
  }, [winner, isDraw, gameOver]);

  React.useEffect(() => {
    if ((score.X === 3 || score.O === 3) && !showFinalConfetti && gameOver) {
      setShowFinalConfetti(true);
      setTimeout(() => setShowFinalConfetti(false), 4000);
    }
  }, [score, gameOver, showFinalConfetti]);

  function playClickSound() {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play();
    }
  }

  function handleClick(idx: number) {
    if (board[idx] || winner || gameOver) return;
    if (gameMode === "cpu" && !xIsNext) return; // Prevent user from playing as O in CPU mode
    playClickSound();
    const newBoard = board.slice();
    newBoard[idx] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  function handleReset() {
    setBoard([...emptyBoard]);
    setXIsNext(true);
    setScore({ X: 0, O: 0 });
    setGameOver(false);
  }

  function handleMenuChoice(mode: "player" | "cpu") {
    setGameMode(mode);
    setPlayerX("");
    setPlayerO(mode === "cpu" ? "CPU" : "");
    setNamesSet(false);
    setScore({ X: 0, O: 0 });
    setGameOver(false);
    setBoard([...emptyBoard]);
  }

  function handleBackToMenu() {
    setGameMode("menu");
    setNamesSet(false);
    setPlayerX("");
    setPlayerO("");
    setScore({ X: 0, O: 0 });
    setGameOver(false);
    setBoard([...emptyBoard]);
  }

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (playerX.trim() && playerO.trim()) {
      setNamesSet(true);
    }
  }

  // Helper for smart CPU move
  function getSmartCpuMove(board: Player[]): number | null {
    // 1. Try to win
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const testBoard = board.slice();
        testBoard[i] = "O";
        if (calculateWinner(testBoard) === "O") return i;
      }
    }
    // 2. Block X from winning
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        const testBoard = board.slice();
        testBoard[i] = "X";
        if (calculateWinner(testBoard) === "X") return i;
      }
    }
    // 3. Otherwise, pick random
    const emptyIndices = board
      .map((cell, idx) => (cell === null ? idx : null))
      .filter(idx => idx !== null) as number[];
    if (emptyIndices.length > 0) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
    return null;
  }

  // CPU move effect
  React.useEffect(() => {
    if (
      gameMode === "cpu" &&
      namesSet &&
      !gameOver &&
      !winner &&
      !isDraw &&
      !xIsNext // CPU is always O
    ) {
      const cpuMoveTimeout = setTimeout(() => {
        const cpuIdx = getSmartCpuMove(board);
        if (cpuIdx !== null) {
          const newBoard = board.slice();
          newBoard[cpuIdx] = "O";
          setBoard(newBoard);
          setXIsNext(true);
          playClickSound();
        }
      }, 600); // Delay for realism
      return () => clearTimeout(cpuMoveTimeout);
    }
  }, [gameMode, namesSet, xIsNext, board, gameOver, winner, isDraw]);

  // SVGs for Heart (X) and Flower (O)
  const HeartSVG = (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-28">
      <path d="M24 42s-13.5-8.35-13.5-18.5C10.5 15.5 16.5 12 24 19.5C31.5 12 37.5 15.5 37.5 23.5C37.5 33.65 24 42 24 42Z" fill="#ec4899" stroke="#db2777" strokeWidth="2"/>
    </svg>
  );
  const FlowerSVG = (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-28">
      <circle cx="24" cy="24" r="6" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
      <ellipse cx="24" cy="10" rx="4" ry="8" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
      <ellipse cx="24" cy="38" rx="4" ry="8" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
      <ellipse cx="10" cy="24" rx="8" ry="4" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
      <ellipse cx="38" cy="24" rx="8" ry="4" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
      <ellipse cx="14.5" cy="14.5" rx="3" ry="6" transform="rotate(-45 14.5 14.5)" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
      <ellipse cx="33.5" cy="14.5" rx="3" ry="6" transform="rotate(45 33.5 14.5)" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
      <ellipse cx="14.5" cy="33.5" rx="3" ry="6" transform="rotate(45 14.5 33.5)" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
      <ellipse cx="33.5" cy="33.5" rx="3" ry="6" transform="rotate(-45 33.5 33.5)" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5"/>
    </svg>
  );

  return (
    <div className="min-h-screen w-full bg-green-100 flex flex-col">
      <Card className="max-w-2xl w-full mx-auto mt-10 shadow-2xl border-4 border-green-300 relative overflow-visible">
        <audio ref={clickAudioRef} src="/click.mp3" preload="auto" />
        {showFinalConfetti && (
          <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
            <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={400} recycle={false} />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-white/90 rounded-xl px-8 py-6 shadow-2xl border-4 border-green-400 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-green-700 text-center block w-full drop-shadow-lg">🎉 Congrats to the winner! 🎉</span>
              <div className="mt-2 text-2xl font-bold text-pink-600 text-center drop-shadow-md">
                {score.X === 3 ? playerX : playerO}
              </div>
            </div>
          </div>
        )}
        <CardContent className="flex flex-col items-center p-10 relative z-10">
          <h2 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-blue-500 to-green-500 drop-shadow-lg tracking-tight">Tic Tac Toe</h2>
          {gameMode === "menu" ? (
            <div className="flex flex-col gap-6 w-full max-w-xs mb-6">
              <Button className="w-full py-4 text-lg font-bold bg-gradient-to-r from-pink-400 to-blue-400 text-white shadow-lg hover:from-pink-500 hover:to-blue-500 transition-all duration-200" onClick={() => handleMenuChoice("player")}>NEW GAME (VS PLAYER)</Button>
              <Button className="w-full py-4 text-lg font-bold bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-200" onClick={() => handleMenuChoice("cpu")}>NEW GAME (VS CPU)</Button>
            </div>
          ) : !namesSet ? (
            <form onSubmit={handleStart} className="flex flex-col gap-4 w-full max-w-xs mb-6">
              <input
                type="text"
                placeholder="Player X Name"
                value={playerX}
                onChange={e => setPlayerX(e.target.value)}
                className="border-2 border-pink-400 rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-pink-300 bg-white/80 shadow-md font-semibold text-pink-700 placeholder:text-pink-300"
                required
              />
              {gameMode === "player" && (
                <input
                  type="text"
                  placeholder="Player O Name"
                  value={playerO}
                  onChange={e => setPlayerO(e.target.value)}
                  className="border-2 border-green-400 rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-green-300 bg-white/80 shadow-md font-semibold text-green-700 placeholder:text-green-300"
                  required
                />
              )}
              {gameMode === "cpu" && (
                <input
                  type="text"
                  placeholder="Your Opponent is CPU"
                  value={playerO}
                  disabled
                  className="border-2 border-blue-300 rounded-lg px-3 py-3 text-lg bg-blue-50 text-blue-400 shadow-md font-semibold"
                />
              )}
              <Button type="submit" className="w-full mt-2 py-3 text-lg font-bold bg-gradient-to-r from-pink-400 to-green-400 text-white shadow-lg hover:from-pink-500 hover:to-green-500 transition-all duration-200">Start Game</Button>
              <Button type="button" variant="secondary" className="w-full py-3 text-lg font-bold border-2 border-blue-300 text-blue-500 bg-white/80 shadow hover:bg-blue-50 transition-all duration-200" onClick={handleBackToMenu}>Back</Button>
            </form>
          ) : (
            <>
              <div className="flex justify-between w-full max-w-md mb-6">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-pink-500 text-lg drop-shadow">{playerX} (X)</span>
                  <span className="text-3xl font-extrabold text-pink-400 drop-shadow">{score.X}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-green-500 text-lg drop-shadow">{playerO} (O)</span>
                  <span className="text-3xl font-extrabold text-green-400 drop-shadow">{score.O}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-5 mb-8 w-full max-w-md">
                {board.map((cell, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-24 h-24 text-5xl font-extrabold rounded-2xl bg-white/90 border-4 border-gradient-to-br from-pink-300 via-blue-300 to-green-300 shadow-xl flex items-center justify-center transition-all duration-150 text-zinc-700 hover:scale-105 focus:scale-105"
                    onClick={() => handleClick(idx)}
                    disabled={!!cell || !!winner || gameOver}
                  >
                    {cell === "X" ? (
                      <span className="block animate-glow-x">{HeartSVG}</span>
                    ) : cell === "O" ? (
                      <span className="block animate-glow-o">{FlowerSVG}</span>
                    ) : null}
                  </Button>
                ))}
              </div>
              <div className="mb-8 h-7 text-xl font-bold text-blue-600 text-center drop-shadow">
                {gameOver ? (
                  <span>
                    Game Over! Winner: <span className={`font-extrabold ${score.X === 3 ? 'text-pink-500' : 'text-green-500'}`}>{score.X === 3 ? playerX : playerO}</span>
                  </span>
                ) : winner ? (
                  <span>
                    Winner: <span className={`font-extrabold ${winner === 'X' ? 'text-pink-500' : 'text-green-500'}`}>{winner === "X" ? playerX : playerO}</span>
                  </span>
                ) : isDraw ? (
                  <span className="text-yellow-400">Draw!</span>
                ) : (
                  <span>
                    Next: <span className={`font-extrabold ${xIsNext ? 'text-pink-500' : 'text-green-500'}`}>{xIsNext ? playerX : playerO}</span>
                  </span>
                )}
              </div>
              <Button onClick={handleReset} variant="secondary" className="w-full max-w-xs mb-2 py-3 text-lg font-bold border-2 border-green-300 text-green-600 bg-white/80 shadow hover:bg-green-50 transition-all duration-200">
                Reset
              </Button>
              <Button onClick={() => setGameMode('menu')} variant="outline" className="w-full max-w-xs py-3 text-lg font-bold border-2 border-pink-300 text-pink-500 bg-white/80 shadow hover:bg-pink-50 transition-all duration-200">
                Main Menu
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
