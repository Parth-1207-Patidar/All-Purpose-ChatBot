"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LoanAdvisorChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(    //Keeps track of the messages, sent by "user" or "assistant"
    []
  );
  const [input, setInput] = useState("");
  const [typingMessage, setTypingMessage] = useState("");   //Actual message displayed to the user
 
  const sendMessage = async() => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);  //Adding the user message to the messages array

    const res = await fetch("/api/chat", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userMessage: userMessage }),
    })

    const data = await res.json();

    simulateTyping(data.message);
  }

  const simulateTyping = (text: string) => {
    setTypingMessage('');
    let i=0;

    const interval = setInterval(() => {
      if (i < text.length){
        setTypingMessage((prev) => prev + text[i]);
        i++;
      }
      else{
        setTypingMessage("");
        setMessages((prev) => [...prev, { role: "assistant", content: text }]);
        clearInterval(interval);
      }
    }, 30)
  }

  return (
    <div className="flex flex-col justify-between items-center h-screen bg-muted px-4">
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="w-full h-11/12 max-w-3xl shadow-2xl border border-border rounded-2xl">
          <CardContent className="flex flex-col h-full p-6 gap-4">
            <ScrollArea className="flex-1 space-y-4 h-11/12 pr-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-3 rounded-2xl max-w-[80%] mt-4 text-sm leading-relaxed shadow whitespace-pre-wrap break-words ${
                    msg.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted text-muted-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {typingMessage && (
                <div className="mr-auto bg-muted text-muted-foreground px-4 py-3 rounded-2xl max-w-[80%] mt-4 text-sm leading-relaxed shadow whitespace-pre-wrap break-words">
                  {typingMessage}
                </div>
              )}
              <div />
            </ScrollArea>

            <div className="flex gap-2 mt-6">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (e.shiftKey) {
                      return;
                    }
                    sendMessage();
                    e.preventDefault();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 text-sm"
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col items-center justify-center min-w-screen py-2 text-center bg-gray-700 text-white">
        This was created by Parth (12316831), Priyanshu (12324649), and Prashant
        (12326074) for the INT428 course as a group project at LPU.
      </div>
    </div>
  );
}
