import Image from "next/image";
import { TicTacToeBoard } from "@/components/TicTacToeBoard";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800">
      <TicTacToeBoard />
    </div>
  );
}
