"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram, Youtube } from "lucide-react";
import apiClient from "@/lib/api";
import { AboutUs as AboutUsType } from "@/types/about";

const Footer = () => {
  const [contactInfo, setContactInfo] = useState<AboutUsType["contactInfo"] | null>(null);
  const [companyName, setCompanyName] = useState<string>("Infinite Properties");

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await apiClient.get("/api/about-us/public");
        if (response.data.success && response.data.data) {
          setContactInfo(response.data.data.contactInfo);
          setCompanyName(response.data.data.companyName || "Infinite Properties");
        }
      } catch (err) {
        // Silently fail - footer will use default values
      }
    };

    fetchContactInfo();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="global-footer">
      <div className="global-footer__container">
        <div className="global-footer__content">
          {/* Brand Section */}
          <div className="global-footer__brand">
            <p className="global-footer__tagline">
              Building communities that inspire, homes that transform, and futures that flourish.
            </p>
          </div>

          {/* Quick Links */}
          <div className="global-footer__section">
            <h3 className="global-footer__title">Quick Links</h3>
            <nav className="global-footer__nav">
              <Link href="/" className="global-footer__link">Home</Link>
              <Link href="/properties" className="global-footer__link">Properties</Link>
              <Link href="/about" className="global-footer__link">About</Link>
              <Link href="/contact" className="global-footer__link">Contact</Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="global-footer__section">
            <h3 className="global-footer__title">Contact</h3>
            <div className="global-footer__contact">
              {contactInfo?.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(contactInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="global-footer__contact-item"
                >
                  <MapPin size={16} />
                  <span>{contactInfo.address}</span>
                </a>
              )}
              {contactInfo?.phone && (
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="global-footer__contact-item"
                >
                  <Phone size={16} />
                  <span>{contactInfo.phone}</span>
                </a>
              )}
              {contactInfo?.email && (
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="global-footer__contact-item"
                >
                  <Mail size={16} />
                  <span>{contactInfo.email}</span>
                </a>
              )}
            </div>
          </div>

          {/* Social Media */}
          {contactInfo?.socialMedia && (
            <div className="global-footer__section">
              <h3 className="global-footer__title">Follow Us</h3>
              <div className="global-footer__social">
                {contactInfo.socialMedia.facebook && (
                  <a
                    href={contactInfo.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="global-footer__social-link"
                    aria-label="Facebook"
                  >
                    <Facebook size={18} />
                  </a>
                )}
                {contactInfo.socialMedia.twitter && (
                  <a
                    href={contactInfo.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="global-footer__social-link"
                    aria-label="Twitter"
                  >
                    <Twitter size={18} />
                  </a>
                )}
                {contactInfo.socialMedia.instagram && (
                  <a
                    href={contactInfo.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="global-footer__social-link"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {contactInfo.socialMedia.linkedin && (
                  <a
                    href={contactInfo.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="global-footer__social-link"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
                )}
                {contactInfo.socialMedia.youtube && (
                  <a
                    href={contactInfo.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="global-footer__social-link"
                    aria-label="YouTube"
                  >
                    <Youtube size={18} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="global-footer__bottom">
          <p className="global-footer__copyright">
            © {currentYear} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
