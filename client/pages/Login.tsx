import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { getNonce, verifySignature, me } from "@/lib/api";
import { ethers } from "ethers";

declare global {
  interface Window { ethereum?: any }
}

export default function Login() {
  const [address, setAddress] = useState<string>("");
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("cv_token");
    if (token) me(token).then(setProfile).catch(() => localStorage.removeItem("cv_token"));
  }, []);

  async function connectWallet() {
    setError(null);
    try {
      if (!window.ethereum) {
        setError("MetaMask not found. Please install it.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAddress(String(accounts[0] || "").toLowerCase());
    } catch (e: any) {
      setError(e.message || "Failed to connect wallet");
    }
  }

  async function signIn() {
    setLoading(true);
    setError(null);
    try {
      if (!address) throw new Error("Connect wallet first");
      const { nonce } = await getNonce(address);
      const message = `ChainVote login\nAddress: ${address}\nNonce: ${nonce}`;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      const { token } = await verifySignature({ address, signature, name, nationalId, email });
      localStorage.setItem("cv_token", token);
      const p = await me(token);
      setProfile(p);
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight">Voter Login</h1>
        <p className="text-muted-foreground mt-2">Authenticate with your Ethereum wallet to securely access voting.</p>

        <div className="mt-8 grid gap-6 rounded-xl border p-6 bg-card">
          <div>
            <Label className="mb-2 block">Wallet</Label>
            <div className="flex items-center gap-2">
              <Input value={address} readOnly placeholder="0x..." />
              <Button onClick={connectWallet} variant="default">Connect</Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <Label htmlFor="nid">National ID</Label>
              <Input id="nid" value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="ID number" />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-3">
            <Button onClick={signIn} disabled={loading || !address}>{loading ? "Signing..." : "Sign-In with Ethereum"}</Button>
          </div>
        </div>

        {profile && (
          <div className="mt-8 rounded-xl border p-6 bg-card">
            <h2 className="font-semibold">Logged in</h2>
            <p className="text-sm text-muted-foreground">Address: {profile.walletAddress}</p>
            {profile.name && <p className="text-sm text-muted-foreground">Name: {profile.name}</p>}
            {profile.nationalId && <p className="text-sm text-muted-foreground">National ID: {profile.nationalId}</p>}
          </div>
        )}
      </div>
    </Layout>
  );
}
