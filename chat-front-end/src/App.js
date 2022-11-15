import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Lobby from './components/Lobby';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useState, memo } from 'react';
import Chat from './components/Chat';

function App() {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const [filmes, setFilmes] = useState([]);

  console.log('renderizou');

  const joinRoom = async (user, room) => {
    try {
      const connection = new HubConnectionBuilder()
        .withUrl("https://localhost:7114/chat")
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("ReceiveMessage", (user, message) => {
        console.log('message received: ', message);
        setMessages(messages => [...messages, { user, message }]);
      });

      await connection.start();
      await connection.invoke("JoinRoom", { user, room });

      setConnection(connection);
    } catch (e) {
      console.log(e);
    }
  };

  const sendMessage = async (message) => {
    try {
      await connection.invoke("SendMessage", message);
      console.log(message)
    } catch (e) {
      console.log(e);
    }
  };

  const acionarFilmao = async () => {
    const outraConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:5001/RealTime')
      .configureLogging(LogLevel.Information)
      .build();

    outraConnection.on("ReceberMudancas", (filmesBanco) => {
      if (JSON.stringify(filmesBanco) !== JSON.stringify(filmes)) {
        setFilmes(filmesBanco);
      }
      console.log(JSON.stringify(filmesBanco) !== JSON.stringify(filmes))
      console.log(filmesBanco, filmes);
    });

    await outraConnection.start();
    await outraConnection.invoke("Teste");
  };

  return (
    <div className="app">
      <h2>My Chat</h2>
      <hr className="line" />
      {
        !connection
          ? <Lobby joinRoom={joinRoom} />
          : <Chat messages={messages} sendMessage={sendMessage} />
      }
      <h1>filmão</h1>
      <button onClick={acionarFilmao}>Acionar filmão</button>
      <ul>
        {
          filmes.map((filme) => <li key={filme.id}>{filme.titulo}</li>)
        }
      </ul>
    </div>
  );
}

export default memo(App);
