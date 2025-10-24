"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConnectStoreDialogProps {
  onConnect: (credentials: { storeName: string; accessToken: string; email: string }) => Promise<void>;
  onClose: () => void;
  open?: boolean; // Optional prop to control dialog visibility
}

export default function ConnectStoreDialog({ onConnect, onClose, open = true }: ConnectStoreDialogProps) {
  const [storeName, setStoreName] = useState("");
  const [accessToken, setAccessToken] = useState("");
    const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !accessToken) return;
    
    setIsLoading(true);
    try {
      await onConnect({ storeName, accessToken, email });
      setStoreName("");
      setAccessToken("");
      setEmail("");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white p-6 rounded-lg w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Connect Your Store
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your store details to connect
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              placeholder="Enter your store name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Enter your access token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              required
            />
          </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        We'll send important updates to this email
                      </p>
                    </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
