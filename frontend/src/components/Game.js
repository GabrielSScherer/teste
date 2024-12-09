import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Board from "./Board";
import GameOver from "./GameOver";
import Reset from "./Reset";

const socket = io("http://localhost:5000");

const PLAYER_X = "X";
const PLAYER_O = "O";
const GameState = {
  inProgress: "inProgress",
  playerXWins: "playerXWins",
  playerOWins: "playerOWins",
  draw: "draw",
};

const winningCombinations = [
  // Rows
  { combo: [0, 1, 2], strikeClass: "strike-row-1" },
  { combo: [3, 4, 5], strikeClass: "strike-row-2" },
  { combo: [6, 7, 8], strikeClass: "strike-row-3" },

  // Columns
  { combo: [0, 3, 6], strikeClass: "strike-column-1" },
  { combo: [1, 4, 7], strikeClass: "strike-column-2" },
  { combo: [2, 5, 8], strikeClass: "strike-column-3" },

  // Diagonals
  { combo: [0, 4, 8], strikeClass: "strike-diagonal-1" },
  { combo: [2, 4, 6], strikeClass: "strike-diagonal-2" },
];

function checkWinner(tiles, setStrikeClass, setGameState) {
  for (const { combo, strikeClass } of winningCombinations) {
    const tileValue1 = tiles[combo[0]];
    const tileValue2 = tiles[combo[1]];
    const tileValue3 = tiles[combo[2]];

    if (tileValue1 !== null && tileValue1 === tileValue2 && tileValue1 === tileValue3) {
      setStrikeClass(strikeClass);
      if (tileValue1 === PLAYER_X) {
        setGameState(GameState.playerXWins);
      } else {
        setGameState(GameState.playerOWins);
      }
      return;
    }
  }

  const areAllTilesFilledIn = tiles.every((tile) => tile !== null);
  if (areAllTilesFilledIn) {
    setGameState(GameState.draw);
  }
}

function TicTacToe({ username, opponent }) {
  const [tiles, setTiles] = useState(Array(9).fill(null));
  const [playerTurn, setPlayerTurn] = useState(PLAYER_X);
  const [strikeClass, setStrikeClass] = useState();
  const [gameState, setGameState] = useState(GameState.inProgress);
  const [room, setRoom] = useState(null); // Sala de jogo

  useEffect(() => {
    socket.on('startGame', ({ room, opponent }) => {
      setRoom(room);
      alert(`Jogo iniciado! Seu oponente é ${opponent}`);
      setShowGame(true); // Adicione um estado para exibir o tabuleiro
    });

    return () => {
      socket.off('startGame');
    };
  }, []);


  // Atualizando o jogo com as novas jogadas
    socket.on("updateGame", (data) => {
      setTiles(data.board);
      setPlayerTurn(data.currentPlayer);
      setStrikeClass(data.strikeClass); // Atualiza a classe de strike
      checkWinner(data.board, setStrikeClass, setGameState);
    });

    // Reiniciar o jogo
    socket.on("resetGame", () => {
      setTiles(Array(9).fill(null));
      setPlayerTurn(PLAYER_X);
      setStrikeClass(null);
      setGameState(GameState.inProgress);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleTileClick = (index) => {
    if (gameState !== GameState.inProgress || tiles[index] !== null || (playerTurn !== PLAYER_X && playerTurn !== PLAYER_O)) {
      return;
    }

    const newTiles = [...tiles];
    newTiles[index] = playerTurn;
    setTiles(newTiles);

    const nextPlayer = playerTurn === PLAYER_X ? PLAYER_O : PLAYER_X;
    setPlayerTurn(nextPlayer);

    // Enviar o movimento para o servidor via WebSocket
    socket.emit("playMove", { room, board: newTiles, currentPlayer: nextPlayer });

    checkWinner(newTiles, setStrikeClass, setGameState);
  };

  const handleReset = () => {
    setGameState(GameState.inProgress);
    setTiles(Array(9).fill(null));
    setPlayerTurn(PLAYER_X);
    setStrikeClass(null);
    socket.emit("resetGame", { room }); // Envia um pedido de reinício ao servidor
  };

  useEffect(() => {
    if (gameState !== GameState.inProgress) {
      socket.emit("gameOver", { room, gameState }); // Envia o estado do jogo ao servidor quando terminar
    }
  }, [gameState]);

  return (
      <div>
        <h1>Tic Tac Toe</h1>
        <Board
            playerTurn={playerTurn}
            tiles={tiles}
            onTileClick={handleTileClick}
            strikeClass={strikeClass}
        />
        <GameOver gameState={gameState} />
        <Reset gameState={gameState} onReset={handleReset} />
      </div>
  );
}

export default TicTacToe;
