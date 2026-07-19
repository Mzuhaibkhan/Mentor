import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaCode,
  FaRobot,
  FaTachometerAlt,
  FaLightbulb,
  FaShieldAlt,
  FaBolt,
} from "react-icons/fa";
import { Waves } from "../components/Waves";



const features = [
  {
    icon: <FaShieldAlt />,
    title: "Strict Mentorship",
    desc: "Locked purely to algorithms and C++ coding. No off-topic distractions — ever.",
  },
  {
    icon: <FaTachometerAlt />,
    title: "Big-O Analysis",
    desc: "Deep focus on time and space complexity. Every solution gets a rigorous breakdown.",
  },
  {
    icon: <FaLightbulb />,
    title: "Strategic Hints",
    desc: "Guidance instead of full answers. You build the understanding, the mentor guides the way.",
  },
  {
    icon: <FaCode />,
    title: "Code Review",
    desc: "Paste your C++ code for instant, detailed feedback on correctness and efficiency.",
  },
  {
    icon: <FaBolt />,
    title: "Real-Time Streaming",
    desc: "SSE-powered streaming responses appear character-by-character, instantly.",
  },
  {
    icon: <FaRobot />,
    title: "Multi-Model Engine",
    desc: "Switch between Google Gemini 3.5 Flash and DeepSeek V4 Pro via NVIDIA NIM.",
  },
];

const contributors = [
  {
    name: "Mzuhaibkhan",
    github: "https://github.com/Mzuhaibkhan",
  },
  {
    name: "AyushGautam786",
    github: "https://github.com/AyushGautam786",
  },
];

const LandingPage = () => {
  useEffect(() => {
    const container = document.querySelector(".lp-background-container");
    if (!container) return;

    const handleScroll = () => {
      // Toggle display directly on DOM node.
      // This suspends animation ticks when scrolled out of view, ensuring 60fps scrolling.
      if (window.scrollY > window.innerHeight) {
        container.style.display = "none";
      } else {
        container.style.display = "block";
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="lp-page">
      {/* ════════ HERO: Waves Background + Overlay ════════ */}
      <div className="lp-hero-wrap">
        {/* Waves SVG Background */}
        <div
          className="lp-background-container"
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
            zIndex: 0,
          }}
        >
          <Waves strokeColor="rgba(255, 255, 255, 0.08)" backgroundColor="hsl(0 0% 7.5%)" />
        </div>

        {/* Hero text overlay — sits ON TOP of the spline canvas, no card background */}
        <div className="lp-hero-overlay">
          <h1 className="lp-title">AlgoMentor AI</h1>
          <p className="lp-subtitle">
            Your Elite C++ &amp; Algorithms Interview Coach
          </p>
          <Link to="/app" className="lp-cta">
            Launch Mentor →
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="lp-scroll-indicator">
          <div className="lp-mouse">
            <div className="lp-wheel" />
          </div>
          <span className="lp-scroll-label">Scroll Down</span>
        </div>
      </div>

      {/* ════════ FEATURES ════════ */}
      <section className="lp-section">
        <p className="lp-section-eyebrow">What's Inside</p>
        <h2 className="lp-section-heading">Core Capabilities</h2>
        <div className="lp-grid">
          {features.map((f) => (
            <div key={f.title} className="lp-card">
              <span className="lp-card-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="lp-section">
        <p className="lp-section-eyebrow">How It Works</p>
        <h2 className="lp-section-heading">Three Steps to Mastery</h2>
        <div className="lp-steps">
          <div className="lp-step-item">
            <span className="lp-step-num">01</span>
            <h3>Paste Your Code</h3>
            <p>Drop your C++ solution into the editor panel on the left.</p>
          </div>
          <div className="lp-step-item">
            <span className="lp-step-num">02</span>
            <h3>Ask a Question</h3>
            <p>Type your question or request a review in the chat panel.</p>
          </div>
          <div className="lp-step-item">
            <span className="lp-step-num">03</span>
            <h3>Get Mentored</h3>
            <p>
              Receive streaming hints, Big-O analysis, and expert feedback in
              real-time.
            </p>
          </div>
        </div>
      </section>

      {/* ════════ MODELS ════════ */}
      <section className="lp-section">
        <p className="lp-section-eyebrow">Powered By</p>
        <h2 className="lp-section-heading">AI Models Available</h2>
        <div className="lp-grid lp-grid-2">
          <div className="lp-card">
            <span className="lp-model-provider">Google</span>
            <h3>Gemini 3.5 Flash</h3>
            <p>
              Fast, accurate, and deeply integrated with Google's Gemini API for
              reliable streaming.
            </p>
          </div>
          <div className="lp-card">
            <span className="lp-model-provider">NVIDIA NIM</span>
            <h3>DeepSeek V4 Pro</h3>
            <p>
              A frontier reasoning model running through NVIDIA's
              OpenAI-compatible inference layer.
            </p>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="lp-footer">
        <p className="lp-footer-label">Engineered by</p>
        <div className="lp-contributors">
          {contributors.map((c) => (
            <div key={c.name} className="lp-contrib-card">
              <p className="lp-contrib-name">{c.name}</p>
              <div className="lp-social">
                <a href={c.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                  <FaGithub />
                </a>
                <a href="#" title="Email">
                  <FaEnvelope />
                </a>
                <a href="#" title="LinkedIn">
                  <FaLinkedin />
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="lp-copyright">© 2024 AlgoMentor AI · IBM Virtual Internship</p>
      </footer>
    </div>
  );
};

export default LandingPage;
