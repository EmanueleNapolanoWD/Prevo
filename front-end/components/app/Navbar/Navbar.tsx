"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./navbar.module.css";

const navItems = ["Home", "Funzionalità", "Prezzi", "Risorse"];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.navbar}>
        <Link
          className={styles.brand}
          href="#home"
          aria-label="Prevo home"
          onClick={closeMenu}
        >
          <span className={styles.brandMark} aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" role="img" focusable="false">
              <path d="M7 4.5h10v4H11v3h5v4h-5v4H7V4.5Z" />
              <path d="M17 4.5v4h3v-4h-3Zm0 11v4h3v-4h-3Z" />
            </svg>
          </span>
          <span>Prevo</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Navigazione principale">
          {navItems.map((item) => (
            <Link key={item} href={`#${item.toLowerCase().replace("à", "a")}`}>
              {item}
            </Link>
          ))}
        </nav>

        <Link className={styles.desktopCta} href="/login">
          Inizia ora <span aria-hidden="true">↗</span>
        </Link>

        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? (
            <span className={styles.closeIcon} aria-hidden="true">
              ×
            </span>
          ) : (
            <span className={styles.menuIcon} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          )}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ""}`}
      >
        <nav aria-label="Navigazione mobile">
          {navItems.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace("à", "a")}`}
              onClick={closeMenu}
            >
              <span>{item}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          <Link className={styles.mobileCta} href="/login" onClick={closeMenu}>
            Inizia ora <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
