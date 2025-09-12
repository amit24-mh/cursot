import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlocks } from "@/lib/api";
import type { BlockSummary } from "@shared/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Index() {
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  useEffect(() => {
    getBlocks().then((r) => setBlocks(r.blocks)).catch(() => setBlocks([]));
  }, []);

  return (
    <Layout>
      <section className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <Badge className="mb-4">MongoDB • Ethereum • Blockchain</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Secure, Transparent Voting with Ethereum Sign-In and MongoDB
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            ChainVote stores votes in MongoDB and commits each vote to a tamper-evident block chain. Voters log in by signing a message with their Ethereum wallet — no passwords, cryptographic proof only.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/login">Login to Vote</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#how-it-works">How it works</a>
            </Button>
          </div>
          <ul className="mt-8 grid sm:grid-cols-2 gap-4 text-sm">
            <li className="rounded-lg border p-4 bg-card">Ethereum signature-based login</li>
            <li className="rounded-lg border p-4 bg-card">Votes hashed (keccak256) and chained</li>
            <li className="rounded-lg border p-4 bg-card">MongoDB persistence with audit trail</li>
            <li className="rounded-lg border p-4 bg-card">Open APIs for verification</li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-br from-primary/30 to-fuchsia-500/30 blur-3xl rounded-full" />
          <Card className="relative border shadow-lg">
            <CardHeader>
              <CardTitle>Recent Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blocks.length === 0 && (
                  <p className="text-sm text-muted-foreground">No blocks yet. Be the first to vote.</p>
                )}
                {blocks.map((b) => (
                  <div key={b.hash} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xs">#{b.index}</p>
                      <p className="font-mono text-[10px] opacity-70">{new Date(b.timestamp).toLocaleString()}</p>
                    </div>
                    <p className="mt-1 font-mono text-xs break-all">{b.hash}</p>
                    <p className="mt-1 font-mono text-[10px] break-all opacity-70">prev: {b.prevHash}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="how-it-works" className="mt-16 grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Login with Ethereum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">We issue a one-time nonce. You sign it with your wallet. We verify the signature and create a secure session.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2. Store Votes in MongoDB</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Every vote is hashed (keccak256) and saved along with your voter ID, forming an auditable record.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3. Chain Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Each vote creates a new block referencing the previous hash, making tampering detectable.</p>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
