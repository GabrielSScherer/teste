const { Server } = require('socket.io');

let playersQueue = []; // Lista de jogadores aguardando
let ongoingGames = []; // Lista de jogos em andamento

const initializeWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000', // Altere para a porta do seu front-end
      methods: ['GET', 'POST'],
    },
  });
  io.on('playMove', ({ board, currentPlayer, room }) => {
    // Atualiza o estado do jogo na sala específica
    const game = ongoingGames.find((game) => game.room === room);
    if (game) {
      game.board = board;
      game.currentPlayer = currentPlayer;

      // Envia a atualização para os dois jogadores na sala
      io.to(room).emit('updateGame', { board: game.board, currentPlayer: game.currentPlayer });
    }
  });


  io.on('connection', (socket) => {
    console.log(`[CONEXÃO] Usuário conectado: ${socket.id}`);

    // Evento para buscar um jogo
    socket.on('findGame', (data) => {
      console.log(`[BUSCA DE JOGO] Jogador procurando partida: ${data.username}`);
      
      if (data.username) {
        // Adiciona jogador à fila
        playersQueue.push({ id: socket.id, username: data.username });
        console.log(`[FILA DE ESPERA] Jogadores na fila:`, playersQueue.map(player => player.username));
        
        // Tenta parear jogadores
        matchPlayers(io);
      }
    });

    // Evento para desconexão
    socket.on('disconnect', () => {
      console.log(`[DESCONECTADO] Usuário: ${socket.id}`);

      // Remove o jogador da fila
      playersQueue = playersQueue.filter(player => player.id !== socket.id);
      console.log(`[FILA DE ESPERA] Jogadores restantes na fila:`, playersQueue.map(player => player.username));

      // Remove o jogador de jogos em andamento
      ongoingGames = ongoingGames.filter(
        game => !game.players.some(player => player.id === socket.id)
      );
      console.log(`[JOGOS EM ANDAMENTO]`, ongoingGames.map(game => game.room));
    });
  });

  return io;
};

// Lógica para parear jogadores
const matchPlayers = (io) => {
  while (playersQueue.length >= 2) {
    const player1 = playersQueue.shift(); // Remove o primeiro jogador
    const player2 = playersQueue.shift(); // Remove o segundo jogador

    const gameRoom = `${player1.id}-${player2.id}`; // Cria uma sala única
    // Adiciona os jogadores à sala
    io.sockets.sockets.get(player1.id)?.join(gameRoom);
    io.sockets.sockets.get(player2.id)?.join(gameRoom);
    ongoingGames.push({ room: gameRoom, players: [player1, player2] });
    console.log(`[JOGO INICIADO] Sala: ${gameRoom}`);
    console.log(`[JOGADORES] ${player1.username} vs ${player2.username}`);

    // Envia evento para os dois jogadores informando que o jogo começou
    io.to(gameRoom).emit('joinedRoom', { room: gameRoom });
    io.to(player1.id).emit('startGame', { opponent: player2.username, room: gameRoom });
    io.to(player2.id).emit('startGame', { opponent: player1.username, room: gameRoom });
  }
};


module.exports = initializeWebSocket;
