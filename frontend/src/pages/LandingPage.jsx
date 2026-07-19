import React from "react";
import Spline from "@splinetool/react-spline";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaEnvelope, FaCode, FaRobot, FaTachometerAlt, FaLightbulb, FaShieldAlt, FaComments } from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Spline Background */}
      <div className="spline-background">
        <Spline scene="https://prod.spline.design/BNaurVSeS57NeyWI/scene.splinecode" />
      </div>

      {/* Main Content Overlay */}
      <div className="landing-content">
        {/* Header / Hero */}
        <header className="landing-hero">
          <h1 className="landing-title">AlgoMentor AI</h1>
          <p className="landing-subtitle">Your Elite C++ & Algorithms Interview Coach</p>
          <Link to="/app" className="cta-button">
            Launch Mentor &rarr;
          </Link>
        </header>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Core Capabilities</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaShieldAlt className="feature-icon" />
              <h3>Strict Mentorship</h3>
              <p>Locked purely to technical algorithms and C++ coding. No off-topic distractions.</p>
            </div>
            <div className="feature-card">
              <FaTachometerAlt className="feature-icon" />
              <h3>Big-O Analysis</h3>
              <p>Deep focus on time and space complexity for every solution provided.</p>
            </div>
            <div className="feature-card">
              <FaLightbulb className="feature-icon" />
              <h3>Strategic Hints</h3>
              <p>Guidance and hints instead of full code refactors to help you truly learn.</p>
            </div>
            <div className="feature-card">
              <FaCode className="feature-icon" />
              <h3>Code Review</h3>
              <p>Paste your C++ code and get instant, detailed feedback on algorithmic correctness.</p>
            </div>
            <div className="feature-card">
              <FaComments className="feature-icon" />
              <h3>Real-Time Streaming</h3>
              <p>Lightning-fast streaming responses powered by SSE technology.</p>
            </div>
            <div className="feature-card">
              <FaRobot className="feature-icon" />
              <h3>Multi-Model Engine</h3>
              <p>Powered by Google Gemini 3.5 Flash and DeepSeek V4 Pro via NVIDIA NIM.</p>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="landing-footer">
          <p className="footer-title">Engineered by</p>
          <div className="contributors-container">
            {/* Contributor 1 */}
            <div className="contributor-card">
              <p className="contributor-name">Mzuhaibkhan</p>
              <div className="social-links">
                <a href="https://github.com/Mzuhaibkhan" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
                <a href="#" aria-label="Email"><FaEnvelope /></a>
                <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
              </div>
            </div>
            {/* Contributor 2 */}
            <div className="contributor-card">
              <p className="contributor-name">AyushGautam786</p>
              <div className="social-links">
                <a href="https://github.com/AyushGautam786" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
                <a href="#" aria-label="Email"><FaEnvelope /></a>
                <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
