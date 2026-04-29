/*
 * Diamond Index™ — Header Component
 * Layout: Logo (left, large) | Nav center-right | Icons (far right)
 * Style: White/very light gradient bg, thin orange underline for active nav
 *
 * Navigation rules:
 *  - Logo always navigates to / (home)
 *  - Page links (Grade, Grader Program, Investors) use wouter Link → route
 *  - Anchor links (How It Works, Pricing) scroll on home page,
 *    navigate to /#section on other pages so the user always gets there
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const DI_BADGE_URL = "/manus-storage/di-badge-clean_83e2bc22.png";

const navItems = [
  { label: "Home",            href: "/",               type: "home" },
  { label: "Grade",           href: "/grade",           type: "page" },
  { label: "How It Works",    href: "#how-it-works",    type: "anchor" },
  { label: "Pricing",         href: "#pricing",         type: "anchor" },
  { label: "Become a Grader", href: "/grader-program",  type: "page" },
  { label: "Investors",       href: "/investors",       type: "page" },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id.replace("#", ""));
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Header() {
  const [location, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("hero");
  const { user, isAuthenticated, logout } = useAuth();
  const isHome = location === "/";

  // Track which section is in view — only meaningful on home page
  useEffect(() => {
    if (!isHome) return;
    const sectionIds = ["hero", "how-it-works", "pricing", "graders", "value"];
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.35 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [isHome]);

  const handleAnchorClick = (href: string) => {
    const sectionId = href.replace("#", "");
    if (isHome) {
      scrollToSection(sectionId);
    } else {
      // Navigate home then scroll after a short delay for the page to mount
      navigate("/");
      setTimeout(() => scrollToSection(sectionId), 300);
    }
  };

  const handleLogoClick = () => {
    if (isHome) {
      scrollToSection("hero");
    } else {
      navigate("/");
    }
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      navigate("/vault");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const getIsActive = (item: typeof navItems[0]) => {
    if (item.type === "home") return isHome && activeSection === "hero";
    if (item.type === "page") return location === item.href;
    if (item.type === "anchor") return isHome && activeSection === item.href.replace("#", "");
    return false;
  };

  return (
    <header
      style={{
        background: "linear-gradient(to right, #ffffff 0%, #f8f9ff 50%, #f4f6ff 100%)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
      className="fixed top-0 left-0 right-0 z-50 h-16"
    >
      <div className="container h-full flex items-center justify-between">

        {/* Logo — always navigates to home */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 shrink-0 select-none bg-transparent border-0 cursor-pointer p-0"
          aria-label="Diamond Index™ — Home"
        >
          <img
            src={DI_BADGE_URL}
            alt="Diamond Index™ DI Badge"
            style={{ width: "42px", height: "42px", objectFit: "contain", display: "block", flexShrink: 0 }}
          />
          <div className="flex flex-col leading-none">
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.35rem", letterSpacing: "0.04em", color: "#0d1b3e", lineHeight: 1 }}>
              DIAMOND INDEX<sup style={{ fontSize: "0.55em", verticalAlign: "super", marginLeft: "2px", fontWeight: 400 }}>™</sup>
            </span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "0.6rem", letterSpacing: "0.2em", color: "#6b7a9e", lineHeight: 1, marginTop: "3px", textTransform: "uppercase" }}>
              Certification Authority
            </span>
          </div>
        </button>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = getIsActive(item);

            if (item.type === "page" || item.type === "home") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: "0.02em",
                    fontSize: "0.875rem",
                    color: isActive ? "#0d1b3e" : "#4a5568",
                    textDecoration: "none",
                    position: "relative" as const,
                    padding: item.type === "page" ? "0.25rem 0.6rem" : "0",
                    background: item.type === "page" ? (isActive ? "transparent" : "rgba(201,168,76,0.08)") : "transparent",
                    border: item.type === "page" ? "1px solid rgba(201,168,76,0.25)" : "none",
                    borderRadius: item.type === "page" ? "3px" : "0",
                    transition: "all 0.2s",
                  }}
                >
                  {item.label}
                  {isActive && item.type === "home" && (
                    <span
                      className="absolute left-0 right-0"
                      style={{ bottom: "-4px", height: "1.5px", background: "oklch(0.72 0.18 45)", display: "block" }}
                    />
                  )}
                </Link>
              );
            }

            // Anchor item — works on home (scroll) and other pages (navigate + scroll)
            return (
              <button
                key={item.href}
                onClick={() => handleAnchorClick(item.href)}
                className={`relative text-sm transition-colors duration-200 bg-transparent border-0 cursor-pointer p-0 ${
                  isActive ? "text-[#0d1b3e] font-medium" : "text-[#4a5568] hover:text-[#0d1b3e]"
                }`}
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: isActive ? 500 : 400, letterSpacing: "0.02em" }}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute left-0 right-0"
                    style={{ bottom: "-4px", height: "1.5px", background: "oklch(0.72 0.18 45)", display: "block" }}
                  />
                )}
              </button>
            );
          })}

          {/* My Vault — logged-in users only */}
          {isAuthenticated && (
            <Link
              href="/vault"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: location === "/vault" ? 600 : 400,
                letterSpacing: "0.02em",
                fontSize: "0.875rem",
                color: location === "/vault" ? "#0d1b3e" : "#4a5568",
                textDecoration: "none",
                position: "relative" as const,
                padding: "0.25rem 0.6rem",
                background: "rgba(26,58,107,0.08)",
                border: "1px solid rgba(26,58,107,0.2)",
                borderRadius: "3px",
                transition: "all 0.2s",
              }}
            >
              My Vault
              {location === "/vault" && (
                <span style={{ position: "absolute", left: 0, right: 0, bottom: "-4px", height: "1.5px", background: "oklch(0.72 0.18 45)", display: "block" }} />
              )}
            </Link>
          )}

          {/* Login — non-authenticated users only */}
          {!isAuthenticated && (
            <button
              onClick={handleLoginClick}
              className="relative text-sm transition-colors duration-200 bg-transparent border-0 cursor-pointer p-0 text-[#4a5568] hover:text-[#0d1b3e]"
              style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, letterSpacing: "0.02em" }}
            >
              Login
            </button>
          )}
        </nav>

        {/* Icons — Far right */}
        <div className="flex items-center gap-4">
          <button
            className="text-[#4a5568] hover:text-[#0d1b3e] transition-colors duration-200 p-1"
            aria-label="Search"
            onClick={() => toast.info("Registry search coming soon.")}
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => navigate("/vault")}
                className="text-[#4a5568] hover:text-[#0d1b3e] transition-colors duration-200 p-1"
                aria-label="My Vault"
                title={user?.name ?? "My Vault"}
              >
                <User size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleLogout}
                className="text-[#4a5568] hover:text-[#0d1b3e] transition-colors duration-200 p-1"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={18} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <button
              className="text-[#4a5568] hover:text-[#0d1b3e] transition-colors duration-200 p-1"
              aria-label="Login"
              onClick={handleLoginClick}
            >
              <User size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
