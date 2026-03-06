"use client";

import React, { useState, useEffect, useRef } from "react";
import { AboutUs as AboutUsType } from "@/types/about";
import apiClient from "@/lib/api";
import HeaderText from "./HeaderText";
import gsap from "gsap";

// Import images from assets
import citiesImage from "@/assets/images/about-us/cities.jpg";
import completedProjectsImage from "@/assets/images/about-us/completed-projects.jpg";
import experienceImage from "@/assets/images/about-us/experience.jpg";
import happyFamilyImage from "@/assets/images/about-us/happy-family.jpg";
import router from "next/router";

// Map statistics to images by index
const statisticImages = [
  completedProjectsImage,
  happyFamilyImage,
  //   experienceImage,
  citiesImage,
];

const AboutUs = () => {
  const [aboutUs, setAboutUs] = useState<AboutUsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storySectionRef = useRef<HTMLDivElement>(null);
  const storyHeaderRef = useRef<HTMLDivElement>(null);
  const storyContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const fetchAboutUs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/api/about-us/public");
      if (response.data.success && response.data.data) {
        setAboutUs(response.data.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status !== 404) {
        setError("Failed to load About Us content");
        console.error("Error fetching About Us:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
      return imagePath;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${apiUrl}${imagePath}`;
  };

  // Animation effect for Our Story section
  useEffect(() => {
    if (isLoading || !aboutUs?.story || !storySectionRef.current || !storyContentRef.current) return;

    const ctx = gsap.context(() => {
      // Set initial states
      if (storyHeaderRef.current) {
        gsap.set(storyHeaderRef.current, {
          opacity: 0,
          y: 50,
        });
      }

      const storyContent = storyContentRef.current;
      if (storyContent) {
        gsap.set(storyContent, {
          opacity: 0,
          y: 60,
          scale: 0.95,
        });
      }

      // Create intersection observer for scroll-triggered animation
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Animate header
              if (storyHeaderRef.current) {
                gsap.to(storyHeaderRef.current, {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power3.out",
                });
              }

              // Animate story content
              if (storyContent) {
                gsap.to(storyContent, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.6,
                  ease: "power3.out",
                });
              }

              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px",
        }
      );

      if (storySectionRef.current) {
        observer.observe(storySectionRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, storySectionRef);

    return () => ctx.revert();
  }, [isLoading, aboutUs?.story]);

  if (isLoading) {
    return (
      <div className="about-us">
        <div className="about-us__container">
          <div className="about-us__content">
            <div className="about-us__loading">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !aboutUs) {
    return null; // Don't show anything if there's an error or no data
  }

  return (
    <div className="about-us">
      <div className="about-us__container">
        <div className="about-us__content">
          {/* Mission & Vision */}
          {/* {(aboutUs.mission || aboutUs.vision) && (
            <div className="about-us__mission-vision">
              {aboutUs.mission && (
                <div className="about-us__mission">
                  <h2 className="about-us__section-title">Our Mission</h2>
                  <p className="about-us__text">{aboutUs.mission}</p>
                </div>
              )}
              {aboutUs.vision && (
                <div className="about-us__vision">
                  <h2 className="about-us__section-title">Our Vision</h2>
                  <p className="about-us__text">{aboutUs.vision}</p>
                </div>
              )}
            </div>
          )} */}

          {/* Story */}
          {aboutUs.story && (
            <div ref={storySectionRef} className="about-us__story">
              {/* <h2 className="about-us__section-title">Our Story</h2> */}
              <div ref={storyHeaderRef}>
                <HeaderText title="Our Story" subtitle="Our Story" alignment="left" actionButtonText="Know More" onActionClick={() => router.push("/about")} />
              </div>

              <div ref={storyContentRef} className="about-us__story-text-container">
                <div className="about-us__story-text-logo">
                  <div className="about-us__logo-particles">
                    <span className="about-us__particle about-us__particle--1"></span>
                    <span className="about-us__particle about-us__particle--2"></span>
                    <span className="about-us__particle about-us__particle--3"></span>
                    <span className="about-us__particle about-us__particle--4"></span>
                    <span className="about-us__particle about-us__particle--5"></span>
                    <span className="about-us__particle about-us__particle--6"></span>
                    <span className="about-us__particle about-us__particle--7"></span>
                    <span className="about-us__particle about-us__particle--8"></span>
                    <span className="about-us__particle about-us__particle--9"></span>
                    <span className="about-us__particle about-us__particle--10"></span>
                  </div>
                  <img src="/assets/images/logo.png" alt="Logo" />
                </div>
                <p className="about-us__text about-us__story-text">
                  {aboutUs.story}
                </p>
              </div>
            </div>
          )}

          {/* Values */}
          {/* {aboutUs.values && aboutUs.values.length > 0 && (
            <div className="about-us__values">
              <h2 className="about-us__section-title">Our Values</h2>
              <div className="about-us__values-grid">
                {aboutUs.values.map((value, index) => (
                  <div key={index} className="about-us__value-item">
                    <p className="about-us__value-text">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Statistics */}
          {aboutUs.statistics && aboutUs.statistics.length > 0 && (
            <div className="about-us__statistics">
              {/* <h2 className="about-us__section-title">By The Numbers</h2> */}
              <div className="about-us__statistics-grid">
                {aboutUs.statistics.map((stat, index) => {
                  const image = statisticImages[index % statisticImages.length];
                  return (
                    <div key={stat.id} className="about-us__statistic-item">
                      <div className="about-us__statistic-content">
                        <div className="about-us__statistic-label">
                          {stat.label}
                        </div>
                        <div className="about-us__statistic-value">
                          {stat.prefix}
                          {stat.value}
                          {stat.suffix}
                        </div>
                      </div>
                      {image && (
                        <div className="about-us__statistic-image">
                          <img
                            src={
                              typeof image === "string"
                                ? image
                                : (image as { src?: string }).src ||
                                String(image)
                            }
                            alt={stat.label}
                            className="about-us__statistic-image-img"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Achievements */}
          {/* {aboutUs.achievements && aboutUs.achievements.length > 0 && (
            <div className="about-us__achievements">
              <h2 className="about-us__section-title">Achievements</h2>
              <div className="about-us__achievements-grid">
                {aboutUs.achievements.map((achievement) => (
                  <div key={achievement.id} className="about-us__achievement-item">
                    <div className="about-us__achievement-value">{achievement.value}</div>
                    <div className="about-us__achievement-title">{achievement.title}</div>
                    {achievement.description && (
                      <div className="about-us__achievement-description">
                        {achievement.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Team Members */}
          {/* {aboutUs.teamMembers && aboutUs.teamMembers.length > 0 && (
            <div className="about-us__team">
              <h2 className="about-us__section-title">Our Team</h2>
              <div className="about-us__team-grid">
                {aboutUs.teamMembers.map((member) => {
                  const imageUrl = getImageUrl(member.image);
                  return (
                    <div key={member.id} className="about-us__team-member">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={member.name}
                          className="about-us__team-image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="about-us__team-avatar">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                      <h3 className="about-us__team-name">{member.name}</h3>
                      <p className="about-us__team-position">{member.position}</p>
                      {member.bio && (
                        <p className="about-us__team-bio">{member.bio}</p>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="about-us__team-email"
                        >
                          {member.email}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )} */}

          {/* Contact Info */}
          {/* {aboutUs.contactInfo && (
            <div className="about-us__contact">
              <h2 className="about-us__section-title">Contact Us</h2>
              <div className="about-us__contact-grid">
                {aboutUs.contactInfo.address && (
                  <div className="about-us__contact-item">
                    <h3 className="about-us__contact-label">Address</h3>
                    <p className="about-us__contact-value">{aboutUs.contactInfo.address}</p>
                  </div>
                )}
                {aboutUs.contactInfo.phone && (
                  <div className="about-us__contact-item">
                    <h3 className="about-us__contact-label">Phone</h3>
                    <a
                      href={`tel:${aboutUs.contactInfo.phone}`}
                      className="about-us__contact-value about-us__contact-link"
                    >
                      {aboutUs.contactInfo.phone}
                    </a>
                  </div>
                )}
                {aboutUs.contactInfo.email && (
                  <div className="about-us__contact-item">
                    <h3 className="about-us__contact-label">Email</h3>
                    <a
                      href={`mailto:${aboutUs.contactInfo.email}`}
                      className="about-us__contact-value about-us__contact-link"
                    >
                      {aboutUs.contactInfo.email}
                    </a>
                  </div>
                )}
                {aboutUs.contactInfo.website && (
                  <div className="about-us__contact-item">
                    <h3 className="about-us__contact-label">Website</h3>
                    <a
                      href={aboutUs.contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-us__contact-value about-us__contact-link"
                    >
                      {aboutUs.contactInfo.website}
                    </a>
                  </div>
                )}
                {aboutUs.contactInfo.socialMedia && (
                  <div className="about-us__contact-item about-us__contact-social">
                    <h3 className="about-us__contact-label">Follow Us</h3>
                    <div className="about-us__social-links">
                      {aboutUs.contactInfo.socialMedia.facebook && (
                        <a
                          href={aboutUs.contactInfo.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-us__social-link"
                        >
                          Facebook
                        </a>
                      )}
                      {aboutUs.contactInfo.socialMedia.twitter && (
                        <a
                          href={aboutUs.contactInfo.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-us__social-link"
                        >
                          Twitter
                        </a>
                      )}
                      {aboutUs.contactInfo.socialMedia.instagram && (
                        <a
                          href={aboutUs.contactInfo.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-us__social-link"
                        >
                          Instagram
                        </a>
                      )}
                      {aboutUs.contactInfo.socialMedia.linkedin && (
                        <a
                          href={aboutUs.contactInfo.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-us__social-link"
                        >
                          LinkedIn
                        </a>
                      )}
                      {aboutUs.contactInfo.socialMedia.youtube && (
                        <a
                          href={aboutUs.contactInfo.socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-us__social-link"
                        >
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
