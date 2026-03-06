"use client";

import React, { useState, useEffect, useRef } from "react";
import { AboutUs as AboutUsType } from "@/types/about";
import apiClient from "@/lib/api";
import HeaderText from "@/components/website-ui-components/HeaderText";
import StickyNavbar from "@/components/website-ui-components/StickyNavbar";
import MobileNavButton from "@/components/website-ui-components/MobileNavButton";
import { PropertyTypeProvider } from "@/contexts/PropertyTypeContext";
import gsap from "gsap";
import Image from "next/image";
import { Linkedin, Twitter, Facebook, Mail, Phone, MapPin, Globe, Award, Users, Target, Lightbulb, Building2, Home, Star, MapPinned, TrendingUp, CheckCircle, Calendar, BarChart3, type LucideIcon } from "lucide-react";

const AboutPage = () => {
  const [aboutUs, setAboutUs] = useState<AboutUsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const heroChipRef = useRef<HTMLDivElement>(null);
  const heroQuoteRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const missionVisionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const achievementsRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

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

  // Map emoji icons or labels to Lucide icons
  const getStatisticIcon = (icon?: string, label?: string): LucideIcon | null => {
    // Icon mapping based on emoji or label
    const iconMap: Record<string, LucideIcon> = {
      '🏗️': Building2,
      '🏠': Home,
      '⭐': Star,
      '🌆': MapPinned,
      '📊': BarChart3,
      '📈': TrendingUp,
      '✅': CheckCircle,
      '📅': Calendar,
      '🏆': Award,
    };

    // Label-based mapping
    const labelMap: Record<string, LucideIcon> = {
      'project': Building2,
      'projects': Building2,
      'completed': Building2,
      'family': Home,
      'families': Home,
      'happy': Home,
      'experience': Star,
      'years': Star,
      'city': MapPinned,
      'cities': MapPinned,
      'award': Award,
      'awards': Award,
    };

    // Check if icon is an emoji and map it
    if (icon && iconMap[icon]) {
      return iconMap[icon];
    }

    // Check label for keyword matching
    if (label) {
      const lowerLabel = label.toLowerCase();
      for (const [key, IconComponent] of Object.entries(labelMap)) {
        if (lowerLabel.includes(key)) {
          return IconComponent;
        }
      }
    }

    // Default icon
    return BarChart3;
  };

  // Animation effects
  useEffect(() => {
    if (isLoading || !aboutUs) return;

    const ctx = gsap.context(() => {
      // Hero section animations with staggered reveal
      if (heroRef.current) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // Animate chip
                if (heroChipRef.current) {
                  gsap.fromTo(
                    heroChipRef.current,
                    { opacity: 0, y: 20, scale: 0.9 },
                    {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      duration: 0.6,
                      ease: "back.out(1.7)",
                    }
                  );
                }

                // Animate quote with smooth text reveal
                if (heroQuoteRef.current) {
                  const quoteText = heroQuoteRef.current.querySelector(".about-page__quote-text");
                  
                  // Animate container
                  gsap.fromTo(
                    heroQuoteRef.current,
                    { opacity: 0, y: 40 },
                    {
                      opacity: 1,
                      y: 0,
                      duration: 1,
                      delay: 0.2,
                      ease: "power3.out",
                    }
                  );

                  // Animate text reveal effect with mask
                  if (quoteText) {
                    gsap.fromTo(
                      quoteText,
                      {
                        opacity: 0,
                        y: 20,
                        clipPath: "inset(0 100% 0 0)",
                      },
                      {
                        opacity: 1,
                        y: 0,
                        clipPath: "inset(0 0% 0 0)",
                        duration: 1.4,
                        delay: 0.4,
                        ease: "power2.out",
                      }
                    );
                  }
                }

                // Animate image
                if (heroImageRef.current) {
                  gsap.fromTo(
                    heroImageRef.current,
                    { opacity: 0, scale: 0.95, y: 30 },
                    {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      duration: 1,
                      delay: 0.6,
                      ease: "power3.out",
                    }
                  );
                }

                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
          }
        );

        observer.observe(heroRef.current);
      }

      // Other sections animations
      const sections = [
        { ref: missionVisionRef, delay: 0.2 },
        { ref: valuesRef, delay: 0.3 },
        { ref: statsRef, delay: 0.4 },
        { ref: achievementsRef, delay: 0.5 },
        { ref: teamRef, delay: 0.6 },
        { ref: contactRef, delay: 0.7 },
      ];

      sections.forEach(({ ref, delay }) => {
        if (ref.current) {
          gsap.set(ref.current, {
            opacity: 0,
            y: 40,
          });

          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  gsap.to(ref.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay,
                    ease: "power3.out",
                  });
                  observer.unobserve(entry.target);
                }
              });
            },
            {
              threshold: 0.1,
              rootMargin: "0px 0px -50px 0px",
            }
          );

          observer.observe(ref.current);
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, [isLoading, aboutUs]);

  if (isLoading) {
    return (
      <PropertyTypeProvider>
        <StickyNavbar />
        <div className="about-page">
          <div className="about-page__container">
            <div className="about-page__loading">Loading...</div>
          </div>
        </div>
        <MobileNavButton />
      </PropertyTypeProvider>
    );
  }

  if (error || !aboutUs) {
    return (
      <PropertyTypeProvider>
        <StickyNavbar />
        <div className="about-page">
          <div className="about-page__container">
            <div className="about-page__error">
              <p>Unable to load content at this time.</p>
            </div>
          </div>
        </div>
        <MobileNavButton />
      </PropertyTypeProvider>
    );
  }

  return (
    <PropertyTypeProvider>
      <StickyNavbar />
      <div className="about-page">
        <div className="about-page__container">
          {/* Hero Section */}
          <section ref={heroRef} className="about-page__hero">
            <div ref={heroChipRef} className="about-page__hero-chip">
              Who We Are
            </div>
            <div ref={heroQuoteRef} className="about-page__hero-quote">
              <p className="about-page__quote-text">
                &quot;Building communities that inspire, homes that transform, and futures that flourish. We don&apos;t just construct buildings—we craft experiences and create lasting value for generations to come.&quot;              </p>
            </div>
            <div ref={heroImageRef} className="about-page__hero-image">
              <Image
                src="/assets/images/about-1.png"
                alt="Our Team"
                width={1200}
                height={600}
                className="about-page__hero-image-img"
                priority
              />
            </div>
          </section>

          {/* Mission & Vision */}
          {(aboutUs.mission || aboutUs.vision) && (
            <div ref={missionVisionRef} className="about-page__mission-vision">
              {aboutUs.mission && (
                <div className="about-page__mission">
                  <div className="about-page__icon-wrapper">
                    <Target className="about-page__icon" />
                  </div>
                  <h2 className="about-page__section-title">Our Mission</h2>
                  <p className="about-page__text">{aboutUs.mission}</p>
                </div>
              )}
              {aboutUs.vision && (
                <div className="about-page__vision">
                  <div className="about-page__icon-wrapper">
                    <Lightbulb className="about-page__icon" />
                  </div>
                  <h2 className="about-page__section-title">Our Vision</h2>
                  <p className="about-page__text">{aboutUs.vision}</p>
                </div>
              )}
            </div>
          )}

          {/* Values */}
          {aboutUs.values && aboutUs.values.length > 0 && (
            <div ref={valuesRef} className="about-page__values">
              <HeaderText 
                title="Our Values" 
                subtitle="Our Values" 
                alignment="center" 
              />
              <div className="about-page__values-grid">
                {aboutUs.values.map((value, index) => (
                  <div key={index} className="about-page__value-item">
                    <p className="about-page__value-text">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          {aboutUs.statistics && aboutUs.statistics.length > 0 && (
            <div ref={statsRef} className="about-page__statistics">
              <HeaderText 
                title="By The Numbers" 
                subtitle="By The Numbers" 
                alignment="center" 
              />
              <div className="about-page__statistics-grid">
                {aboutUs.statistics.map((stat, index) => {
                  const IconComponent = getStatisticIcon(stat.icon, stat.label);
                  return (
                    <div key={stat.id} className="about-page__statistic-item" data-index={index}>
                      <div className="about-page__statistic-content">
                        <div className="about-page__statistic-background"></div>
                        <div className="about-page__statistic-pattern"></div>
                        {IconComponent && (
                          <div className="about-page__statistic-icon-wrapper">
                            <div className="about-page__statistic-icon">
                              <IconComponent size={28} strokeWidth={1.5} />
                            </div>
                            <div className="about-page__statistic-icon-glow"></div>
                          </div>
                        )}
                        <div className="about-page__statistic-value-wrapper">
                          <div className="about-page__statistic-value">
                            <span className="about-page__statistic-prefix">{stat.prefix}</span>
                            <span className="about-page__statistic-number">{stat.value}</span>
                            <span className="about-page__statistic-suffix">{stat.suffix}</span>
                          </div>
                        </div>
                        <div className="about-page__statistic-label">
                          {stat.label}
                        </div>
                        <div className="about-page__statistic-divider"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Achievements */}
          {aboutUs.achievements && aboutUs.achievements.length > 0 && (
            <div ref={achievementsRef} className="about-page__achievements">
              <HeaderText 
                title="Achievements" 
                subtitle="Achievements" 
                alignment="center" 
              />
              <div className="about-page__achievements-grid">
                {aboutUs.achievements.map((achievement) => (
                  <div key={achievement.id} className="about-page__achievement-item">
                    <div className="about-page__achievement-icon">
                      {achievement.icon ? (
                        <span style={{ fontSize: '2.5rem' }}>{achievement.icon}</span>
                      ) : (
                        <Award className="about-page__achievement-icon-svg" />
                      )}
                    </div>
                    <div className="about-page__achievement-value">{achievement.value}</div>
                    <div className="about-page__achievement-title">{achievement.title}</div>
                    {achievement.description && (
                      <div className="about-page__achievement-description">
                        {achievement.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Members */}
          {aboutUs.teamMembers && aboutUs.teamMembers.length > 0 && (
            <div ref={teamRef} className="about-page__team">
              <HeaderText 
                title="Our Team" 
                subtitle="Our Team" 
                alignment="center" 
              />
              <div className="about-page__team-grid">
                {aboutUs.teamMembers.map((member) => {
                  const imageUrl = getImageUrl(member.image);
                  return (
                    <div key={member.id} className="about-page__team-member">
                      <div className="about-page__team-card-background"></div>
                      <div className="about-page__team-card-pattern"></div>
                      <div className="about-page__team-image-wrapper">
                        <div className="about-page__team-image-glow"></div>
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={member.name}
                            width={200}
                            height={200}
                            className="about-page__team-image"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="about-page__team-avatar">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="about-page__team-info">
                        <h3 className="about-page__team-name">{member.name}</h3>
                        <p className="about-page__team-position">{member.position}</p>
                        {member.bio && (
                          <p className="about-page__team-bio">{member.bio}</p>
                        )}
                      </div>
                      <div className="about-page__team-actions">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="about-page__team-email"
                          >
                            <Mail size={16} />
                            <span>Contact</span>
                          </a>
                        )}
                        {member.socialLinks && (
                          <div className="about-page__team-social">
                            {member.socialLinks.linkedin && (
                              <a
                                href={member.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="about-page__team-social-link"
                                aria-label="LinkedIn"
                              >
                                <Linkedin size={18} />
                              </a>
                            )}
                            {member.socialLinks.twitter && (
                              <a
                                href={member.socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="about-page__team-social-link"
                                aria-label="Twitter"
                              >
                                <Twitter size={18} />
                              </a>
                            )}
                            {member.socialLinks.facebook && (
                              <a
                                href={member.socialLinks.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="about-page__team-social-link"
                                aria-label="Facebook"
                              >
                                <Facebook size={18} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {aboutUs.contactInfo && (
            <div ref={contactRef} className="about-page__contact">
              <HeaderText 
                title="Get In Touch" 
                subtitle="Contact Us" 
                alignment="center" 
              />
              <div className="about-page__contact-grid">
                {aboutUs.contactInfo.address && (
                  <div className="about-page__contact-item">
                    <MapPin className="about-page__contact-icon" />
                    <h3 className="about-page__contact-label">Address</h3>
                    <p className="about-page__contact-value">
                      {aboutUs.contactInfo.address}
                    </p>
                  </div>
                )}
                {aboutUs.contactInfo.phone && (
                  <div className="about-page__contact-item">
                    <Phone className="about-page__contact-icon" />
                    <h3 className="about-page__contact-label">Phone</h3>
                    <a
                      href={`tel:${aboutUs.contactInfo.phone}`}
                      className="about-page__contact-value about-page__contact-link"
                    >
                      {aboutUs.contactInfo.phone}
                    </a>
                  </div>
                )}
                {aboutUs.contactInfo.email && (
                  <div className="about-page__contact-item">
                    <Mail className="about-page__contact-icon" />
                    <h3 className="about-page__contact-label">Email</h3>
                    <a
                      href={`mailto:${aboutUs.contactInfo.email}`}
                      className="about-page__contact-value about-page__contact-link"
                    >
                      {aboutUs.contactInfo.email}
                    </a>
                  </div>
                )}
                {aboutUs.contactInfo.website && (
                  <div className="about-page__contact-item">
                    <Globe className="about-page__contact-icon" />
                    <h3 className="about-page__contact-label">Website</h3>
                    <a
                      href={aboutUs.contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-page__contact-value about-page__contact-link"
                    >
                      {aboutUs.contactInfo.website}
                    </a>
                  </div>
                )}
                {aboutUs.contactInfo.socialMedia && (
                  <div className="about-page__contact-item about-page__contact-social">
                    <Users className="about-page__contact-icon" />
                    <h3 className="about-page__contact-label">Follow Us</h3>
                    <div className="about-page__social-links">
                      {aboutUs.contactInfo.socialMedia.facebook && (
                        <a
                          href={aboutUs.contactInfo.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-page__social-link"
                          aria-label="Facebook"
                        >
                          <Facebook size={20} />
                        </a>
                      )}
                      {aboutUs.contactInfo.socialMedia.twitter && (
                        <a
                          href={aboutUs.contactInfo.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-page__social-link"
                          aria-label="Twitter"
                        >
                          <Twitter size={20} />
                        </a>
                      )}
                      {aboutUs.contactInfo.socialMedia.instagram && (
                        <a
                          href={aboutUs.contactInfo.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-page__social-link"
                          aria-label="Instagram"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {aboutUs.contactInfo.socialMedia.linkedin && (
                        <a
                          href={aboutUs.contactInfo.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-page__social-link"
                          aria-label="LinkedIn"
                        >
                          <Linkedin size={20} />
                        </a>
                      )}
                      {aboutUs.contactInfo.socialMedia.youtube && (
                        <a
                          href={aboutUs.contactInfo.socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-page__social-link"
                          aria-label="YouTube"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <MobileNavButton />
    </PropertyTypeProvider>
  );
};

export default AboutPage;
