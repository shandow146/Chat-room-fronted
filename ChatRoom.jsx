import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { io } from 'socket.io-client';
import Filter from 'bad-words';

const socket = io('https://your-backend-url.onrender.com'); // Replace with your backend URL
const filter = new Filter();

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('banned', () => {
      alert("You have been banned due to abusive behavior.");
      socket.disconnect();
    });

    return () => {
      socket.off('connect');
      socket.off('message');
      socket.off('banned');
    };
  }, []);

  const sendMessage = () => {
    if (!filter.isProfane(input)) {
      socket.emit('message', { user: username || 'Anonymous', text: input });
      setInput("");
    } else {
      alert("Abusive language detected. Message not sent.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Enter username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-2"
          />
          <div className="h-64 overflow-y-scroll border p-2 rounded mb-2">
            {messages.map((msg, index) => (
              <p key={index}><strong>{msg.user}:</strong> {msg.text}</p>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
