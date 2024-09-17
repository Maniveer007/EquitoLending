import { NavLink } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "./navbar.css";

export default function Navbar() {
  return (
    <div className="gpt3__navbar">
      <div className="gpt3__navbar-links">
        <div className="gpt3__navbar-links_logo">
          <NavLink to="/">
            <h2>Logo</h2>
          </NavLink>
        </div>
      </div>

      <div className="gpt3__navbar-sign">
        <NavLink
          to="/user-loans"
          className={({ isActive }) =>
            isActive
              ? "active-link hover:underline"
              : "inactive-link hover:underline"
          }
        >
          My Loans
        </NavLink>
        <NavLink
          to="/add-collateral"
          className={({ isActive }) =>
            isActive
              ? "active-link hover:underline"
              : "inactive-link  hover:underline"
          }
        >
          Add Collateral
        </NavLink>
        <ConnectButton className="right" />
      </div>
    </div>
  );
}
