// import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <ul className="flex space-x-4">
          <li>
            <a href="/" className="hover:underline">
              Home
            </a>
          </li>

          <li>
            <a href="/add-collateral" className="hover:underline">
              Add Collateral
            </a>
          </li>

          <li>
            <a href="/user-loans" className="hover:underline">
              My Loans
            </a>
          </li>

          <ConnectButton className="right" />
        </ul>
      </nav>
    </header>
  );
}
