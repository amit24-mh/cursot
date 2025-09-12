import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-fuchsia-500" />
            <span className="font-extrabold tracking-tight text-lg">ChainVote</span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) => cn("px-3 py-2 rounded-md text-sm hover:bg-accent", isActive && "bg-accent")}
            >
              Home
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) => cn("px-3 py-2 rounded-md text-sm hover:bg-accent", isActive && "bg-accent")}
            >
              Login
            </NavLink>
            <Button asChild variant="default" className="ml-2">
              <Link to="/login">Start Voting</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="container py-10">{children}</main>
      <footer className="mt-10 border-t border-border">
        <div className="container py-6 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} ChainVote. Secure, transparent, verifiable voting.</p>
          <p className="opacity-75">MongoDB • Ethereum Sign-In • Tamper-evident blocks</p>
        </div>
      </footer>
    </div>
  );
}
