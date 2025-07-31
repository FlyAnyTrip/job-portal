"use client";
import "./Navbar.css";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { LogOut, User2, Briefcase, Building, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <Briefcase className="icon" />
          </div>
          <h1 className="logo-text">JobPortal</h1>
        </Link>

        {/* Hamburger Icon */}
        <div className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        {/* Navigation Links */}
        <div className={`navbar-links ${mobileMenuOpen ? "open" : ""}`}>
          <ul className="nav-menu">
            {user && user.role === "recruiter" ? (
              <>
                <li>
                  <Link to="/admin/companies" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Building className="nav-icon" />
                    <span>Companies</span>
                  </Link>
                </li>
                <li>
                  <Link to="/admin/jobs" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Briefcase className="nav-icon" />
                    <span>Jobs</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
                <li><Link to="/jobs" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Jobs</Link></li>
                <li><Link to="/browse" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Browse</Link></li>
              </>
            )}
          </ul>

          {!user ? (
            <div className="auth-buttons">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="btn-outline">Login</Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="btn-gradient">Signup</Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="avatar-ring">
                  <AvatarImage src={user?.profile?.profilePhoto || "/placeholder.svg"} alt="@user" />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="popover-content">
                <div className="popover-inner">
                  <div className="popover-header">
                    <Avatar className="avatar-md">
                      <AvatarImage src={user?.profile?.profilePhoto || "/placeholder.svg"} alt="@user" />
                    </Avatar>
                    <div>
                      <h4 className="user-name">{user?.fullname}</h4>
                      <p className="user-bio">{user?.profile?.bio || "No bio added"}</p>
                    </div>
                  </div>
                  <div className="popover-actions">
                    {user?.role === "student" && (
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="popover-btn">
                          <User2 className="popover-icon" /> View Profile
                        </Button>
                      </Link>
                    )}
                    <Button
                      onClick={() => {
                        logoutHandler();
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="popover-btn logout"
                    >
                      <LogOut className="popover-icon" /> Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
