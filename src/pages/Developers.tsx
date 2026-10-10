import React from "react";
import { IonContent, IonHeader, IonPage, IonIcon } from "@ionic/react";
import {
  logoGithub,
  logoLinkedin,
  mail,
  logoFacebook,
  logoInstagram,
  logoTwitter,
} from "ionicons/icons";
import Navbar from "../components/Navbar";
import "./Developers.css";

const Developers: React.FC = () => {
  const developers = [
    {
      id: 1,
      name: "JUSTINE BRYAN NABUYA",
      role: "Documentation Specialist",
      bio: "Expert in creating clear, comprehensive documentation that helps teams work efficiently.",
      skills: ["Technical Writing", "Documentation", "Content Organization"],
      avatar: "/images/developers/Justine_Nabuya_img.png",
      github: "#",
      linkedin: "#",
      email: "justine@chiphappens.com",
    },
    {
      id: 2,
      name: "PAUL GABRIEL BRAGANZA",
      role: "Lead Developer",
      bio: "Expert in crafting beautiful, intuitive interfaces. Leads the design and user experience strategy.",
      skills: ["Full Stack Development", "Backend Development", "UI/UX Design"],
      avatar: "/images/developers/Paul_Braganza_img.png",
      github: "#",
      linkedin: "#",
      email: "paul@chiphappens.com",
    },
    {
      id: 3,
      name: "CIPRIANO SALVADOR DE LOS REYES",
      role: "Figma Designer",
      bio: "Creative designer specializing in crafting high-fidelity prototypes and design systems.",
      skills: ["Figma Prototyping", "UI Design", "Wireframing"],
      avatar: "/images/developers/Cipriano_DeLosReyes_img.png",
      github: "#",
      linkedin: "#",
      email: "cipriano@chiphappens.com",
    },
    {
      id: 4,
      name: "ARFRED SALONGA",
      role: "Documentation Specialist",
      bio: "Meticulous documentation expert ensuring all project information is clear and accessible.",
      skills: [
        "Technical Documentation",
        "User Guides",
        "Process Documentation",
      ],
      avatar: "/images/developers/Arfred_Salonga_img.png",
      github: "#",
      linkedin: "#",
      email: "arfred@chiphappens.com",
    },
    {
      id: 5,
      name: "DENZEL JAMES LORENZO",
      role: "Figma Designer",
      bio: "Innovative designer creating engaging user interfaces and interactive prototypes.",
      skills: ["Figma Design", "Prototype Design", "Visual Design"],
      avatar: "/images/developers/Denzel_Lorenzo.png",
      github: "#",
      linkedin: "#",
      email: "denzel@chiphappens.com",
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <Navbar />
      </IonHeader>
      <IonContent fullscreen>
        {/* Hero Section */}
        <section className="dev-hero">
          <div className="sketch-bg-lines"></div>
          <div className="dev-hero-content">
            <div className="hero-badge">Meet The Team</div>
            <h1 className="dev-hero-title">
              <span className="word-1">The Cookie</span>
              <span className="word-2">Dream Team</span>
            </h1>
            <p className="dev-hero-subtitle">
              The talented folks behind every delicious bite
            </p>
          </div>
        </section>

        {/* Team Grid */}
        <section className="team-section">
          <div className="team-container">
            <div className="team-intro">
              <h2 className="team-intro-title">Who We Are</h2>
              <p className="team-intro-text">
                We're a passionate team of cookie enthusiasts, bakers, and
                creatives who work together to bring you the best cookies in
                town. Each member brings unique skills and a shared love for
                making people smile through delicious treats!
              </p>
            </div>

            <div className="team-grid">
              {developers.map((dev, index) => (
                <div
                  key={dev.id}
                  className={`team-card ${
                    index % 2 === 0 ? "rotate-left" : "rotate-right"
                  }`}
                >
                  <div className="card-corner tl"></div>
                  <div className="card-corner tr"></div>
                  <div className="card-corner bl"></div>
                  <div className="card-corner br"></div>
                  <div className="card-sketch-border"></div>

                  <div className="dev-avatar">
                    <img src={dev.avatar} alt={dev.name} />
                  </div>
                  <h3 className="dev-name">{dev.name}</h3>
                  <p className="dev-role">{dev.role}</p>
                  <p className="dev-bio">{dev.bio}</p>

                  <div className="dev-skills">
                    {dev.skills.map((skill, i) => (
                      <span key={i} className="skill-badge">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="dev-social">
                    <a href={dev.github} className="social-link">
                      <IonIcon icon={logoGithub} />
                    </a>
                    <a href={dev.linkedin} className="social-link">
                      <IonIcon icon={logoLinkedin} />
                    </a>
                    <a href={`mailto:${dev.email}`} className="social-link">
                      <IonIcon icon={mail} />
                    </a>
                  </div>

                  <div className="card-doodles">
                    <span className="doodle d1"></span>
                    <span className="doodle d2"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="join-section">
          <div className="join-content">
            <h2 className="join-title">Want to Join Our Team?</h2>
            <p className="join-subtitle">
              We're always looking for passionate people who love cookies as
              much as we do!
            </p>
            <button className="join-btn">View Open Positions</button>

            <div className="follow-us-section">
              <h3 className="follow-title">Follow Us</h3>
              <div className="social-links">
                <a href="#facebook" className="social-icon">
                  <IonIcon icon={logoFacebook} />
                </a>
                <a href="#instagram" className="social-icon">
                  <IonIcon icon={logoInstagram} />
                </a>
                <a href="#twitter" className="social-icon">
                  <IonIcon icon={logoTwitter} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Developers;
