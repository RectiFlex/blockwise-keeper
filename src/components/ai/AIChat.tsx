import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await supabase.functions.invoke("chat-with-ai", {
        body: { 
          message,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        },
      });
      if (error || !data?.response) {
        throw new Error(error?.message || "No response from server");
      }
      return data.response;
    },
    onSuccess: (response) => {
      setMessages((prev) => [...prev, { 
        role: "assistant" as const, 
        content: typeof response === 'string' ? response : JSON.stringify(response) 
      }]);
    },
    onError: (error: Error) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: `Error: ${error.message}` },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    chatMutation.mutate(input);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.role === "assistant"
                        ? "bg-secondary"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="Ask about property management, maintenance, or warranty requirements..."
          disabled={chatMutation.isPending}
        />
        <Button type="submit" disabled={chatMutation.isPending}>
          {chatMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
