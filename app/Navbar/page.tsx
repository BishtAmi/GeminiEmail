"use client"
import { useSession, signOut } from "next-auth/react";
import SignIn from "../Sigin/page";
const Navbar = () => {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut();
  };
  return (
    <nav className="navbar">
      <div className="container">
        {session ? (
          <div className="navbar-items">
            {session.user && (
              <span className="username">{session.user.name}</span>
            )}
          </div>
        ) : (
          <SignIn />
        )}
      </div>
      <style jsx>
        {`
          .navbar {
            background-color: #333;
            color: #fff;
            padding: 10px 0;
          }

          .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .navbar-brand {
            font-size: 24px;
          }

          .navbar-items {
            display: flex;
            align-items: center;
          }

          .username {
            margin-right: 80px;
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
