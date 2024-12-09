import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';


const socket = io('http://35.160.120.126:3000');

const Game = ({ username, opponent }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [room, setRoom] = useState(null);

  useEffect(() => {
    socket.on('startGame', ({ room, opponent }) => {
      setRoom(room); // Aqui você armazena a sala que foi criada
      history.push(`/game/${room}`);
      alert(`Game started! Your opponent is ${opponent}`);
      socket.join(room); // Join the created room
    });

    socket.on('updateGame', (data) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  const handleClick = (index) => {
    if (!board[index]) {
      const updatedBoard = [...board];
      updatedBoard[index] = currentPlayer;
      setBoard(updatedBoard);
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');

      socket.emit('playMove', { board: updatedBoard, currentPlayer, room });
    }
  };

  return (
      <div>
        <h1>Tic-Tac-Toe</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '10px' }}>
          {board.map((value, index) => (
              <div
                  key={index}
                  onClick={() => handleClick(index)}
                  style={{
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid black',
                    fontSize: '24px',
                    cursor: 'pointer',
                  }}
              >
                {value}
              </div>
          ))}
        </div>
      </div>
  );
};

export default Game;