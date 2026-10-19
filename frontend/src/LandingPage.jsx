import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const teamMembers = [
  { name: 'Name', position: 'Position', image: '' },
  { name: 'Name', position: 'Position', image: '' },
  { name: 'Name', position: 'Position', image: '' },
  { name: 'Name', position: 'Position', image: '' },
  { name: 'Name', position: 'Position', image: '' },
  { name: 'Name', position: 'Position', image: '' },

];

export default function LandingPage({ initialAuthMode = 'login' }) {
  const [authMode, setAuthMode] = useState(initialAuthMode);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="landing-navbar">
        <div className="navbar-brand">
          <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span className="brand-title">CampusFix</span>
        </div>
        <nav className="navbar-links">
          <a href="/">Home</a>
          <button onClick={() => scrollToSection('how-it-works')}>How it Works?</button>
          <button onClick={() => scrollToSection('about-us')}>About Us</button>
          <button onClick={() => scrollToSection('reviews')}>Reviews</button>
          <a href="/contact">Contact Us</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-left">
          <span className="hero-badge">Campus Maintenance Portal</span>
          <h1 className="hero-headline">Fast, simple campus issue reporting.</h1>
          <p className="hero-subtext">
            Report maintenance hazards, track resolution status in real-time, and keep our campus community safe.
          </p>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-check">✓</span> Instant Ticket Submission
            </div>
            <div className="feature-item">
              <span className="feature-check">✓</span> Live Repair Tracking
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="auth-card-wrapper">
            {authMode === 'login' ? (
              <Login embedded onSwitchToRegister={() => setAuthMode('register')} />
            ) : (
              <Register embedded onSwitchToLogin={() => setAuthMode('login')} />
            )}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="landing-section">
        <h2 className="section-title">How it works?</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3>Report the Damage</h3>
            <div className="step-number">1</div>
          </div>

          <div className="step-card">
            <div className="step-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3>Let the Staff fix</h3>
            <div className="step-number">2</div>
          </div>

          <div className="step-card">
            <div className="step-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M9 14l2 2 4-4" />
              </svg>
            </div>
            <h3>Inform the fix</h3>
            <div className="step-number">3</div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="landing-section">
        <h2 className="section-title">About Us</h2>

        <div className="mission-vision-grid">
          <div className="info-box">
            
            <h2>Mission</h2>
            <p>"At CampusFix, our mission is to create a smart, efficient, and reliable college maintenance portal that ensures a safe, functional, and well-maintained campus environment. We empower students through transparent issue reporting and rapid task management, fostering a vibrant community focused on excellence and support."</p>
          </div>
          <div className="info-box">
            <h2>Vision</h2>
            <p>"Providing students and campus administrators with modern digital tools that make facility upkeep more collaborative, efficient, and transparent—helping them identify maintenance needs, coordinate responses, and work together to create cleaner, safer, and better-maintained campuses."</p>
          </div>
        </div>

        <div className="team-section">
          <h2 className="section-title">Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <article className="team-member" key={index}>
                <div className="team-member-photo">
                  {member.image ? (
                    <img src={member.image} alt={member.name} loading="lazy" />
                  ) : (
                    <svg viewBox="0 0 64 64" aria-hidden="true">
                      <circle cx="32" cy="23" r="12" />
                      <path d="M10 58c1-13 10-20 22-20s21 7 22 20" />
                    </svg>
                  )}
                </div>
                <h3>{member.name}</h3>
                <p>{member.position}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="landing-section">
        <h2 className="section-title">Reviews</h2>
        <div className="reviews-grid">
          {[1, 2, 3].map((num) => (
            <div key={num} className="review-card">
              <div className="review-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </div>
              <h3>User {num}</h3>
              <div className="star-rating">★★★★★</div>
              <p className="review-text">"Reporting broken facilities in our building is so much quicker now."</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} CampusFix. All rights reserved.</p>
      </footer>
    </div>
  );
}