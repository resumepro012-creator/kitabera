import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  adminLogin,
  apiAsset,
  createNovel,
  createWriter,
  deleteNovel,
  deleteWriter,
  getAdminLibrary,
  getLibrary,
  getNovel,
  getWriter,
  rateNovel,
  getPopularNovels,
  updateWriter,
  updateNovel,
} from './api';
import logo from './assets/kitabera logo.jpeg';
import heroVideo from './assets/video.mp4';
import taibaFounder from './assets/Taiba Founder.jpeg';
import adanCoFounder from './assets/adan co-founder.jpeg';
import auraManager from './assets/aura manager.jpeg';
import nimalVoiceArtist1 from './assets/Nimal voiceartist 1.jpeg';
import munizaVoiceArtist2 from './assets/muniza voiceartist 2.jpeg';
import ammarVoiceArtist3 from './assets/ammar voiceartist 3.jpeg';
import sadiaEditor from './assets/sadia editor 1 reel editor.jpeg';
import abubakarEditor from './assets/abubakar reel editor 2.jpeg';
import qandeelEditor from './assets/qandeel editor.jpeg';
import asmaEditor from './assets/Asma audiobook editor.jpeg';
import maheenEditor from './assets/maheen audiobookeditor 2.jpeg';
import aleezaEditor from './assets/aleeza.jpeg';
import proofreadingImage from './assets/proofreading.jfif';
import facebookIcon from './assets/facebook.jfif';
import gmailIcon from './assets/gmail.jfif';
import instagramIcon from './assets/instagram.jfif';
import tiktokIcon from './assets/tiktok.jfif';
import watsappIcon from './assets/watsapp.jfif';
import youtubeIcon from './assets/youtube.jfif';

const CATEGORY_OPTIONS = [
  { key: 'islamic', label: 'Islamic' },
  { key: 'romcom', label: 'Romcom' },
  { key: 'horror', label: 'Horror' },
  { key: 'historical', label: 'Historical' },
  { key: 'fantasy', label: 'Fantasy' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'mystery', label: 'Mystery' },
  { key: 'thrill', label: 'Thrill' },
  { key: 'crime-fiction', label: 'Crime Fiction' },
  { key: 'physiological-thriller', label: 'Physiological Thriller' },
  { key: 'comedy', label: 'Comedy' },
  { key: 'friendship', label: 'Friendship' },
  { key: 'detective-fiction', label: 'Detective Fiction' },
  { key: 'spiritual-fiction', label: 'Spiritual Fiction' },
  { key: 'action-fiction', label: 'Action Fiction' },
  { key: 'science-fiction', label: 'Science Fiction' },
  { key: 'romantic', label: 'Romantic' },
  { key: 'social-issues', label: 'Social Issues' },
  { key: 'enemy-to-lovers', label: 'Enemy to Lovers' },
  { key: 'revenge-based', label: 'Revenge Based' },
  { key: 'poetry', label: 'Poetry' },
  { key: 'articles', label: 'Articles' }
];

const SUBCATEGORY_OPTIONS = [
  { key: 'complete-novel', label: 'Complete Novel' },
  { key: 'afsana', label: 'Afsana' },
  { key: 'episodic-novel', label: 'Episodic Novels' },
  { key: 'novella', label: 'Novella' }
];

const CATEGORY_WITHOUT_SUBCATEGORY = new Set(['poetry', 'articles', 'digest']);

// "Digest" is a special upload category: admins can pick it when uploading a file,
// but it is intentionally left out of CATEGORY_OPTIONS so it never shows up as a
// browsable genre on the public Explore page. It only surfaces on the dedicated
// /digest page.
const DIGEST_CATEGORY = { key: 'digest', label: 'Digest' };
const ADMIN_CATEGORY_OPTIONS = [...CATEGORY_OPTIONS, DIGEST_CATEGORY];

const CATEGORY_LABEL_MAP = ADMIN_CATEGORY_OPTIONS.reduce((acc, category) => {
  acc[category.key] = category.label;
  return acc;
}, {});

const SUBCATEGORY_LABEL_MAP = SUBCATEGORY_OPTIONS.reduce((acc, category) => {
  acc[category.key] = category.label;
  return acc;
}, {});

const SERVICES = [
  {
    title: 'Editing',
    summary: 'Polished line editing and content cleanup for novels, stories, and scripts.',
    badge: 'Refine the voice'
  },
  {
    title: 'Audiobooks',
    summary: 'Voice-led audiobook production with a calm, immersive reading experience.',
    badge: 'Bring stories to life'
  },
  {
    title: 'Cover Design',
    summary: 'Elegant cover concepts that fit the mood, genre, and reader expectation.',
    badge: 'Visual identity'
  },
  {
    title: 'Publishing',
    summary: 'Publishing support to help your work move from draft to public release.',
    badge: 'Launch support'
  }
];

const WHY_CHOOSE_POINTS = [
  'Genre-aware presentation that matches the tone of each story.',
  'A creative team that keeps text, visuals, and audio aligned.',
  'Simple contact flow through Instagram for quick response and follow-up.'
];

const teamSections = {
  founders: [
    {
      name: 'Taiba',
      title: 'Founder & Voice Artist',
      bio: 'Shapes the reading experience, editorial direction, and long-term vision for Kitab Era.',
      instagram: 'https://www.instagram.com/taibaijazwriter?igsh=NTFocDcydDU3ZnF5',
      image: taibaFounder
    },
    {
      name: 'Adan',
      title: 'Co-Founder & Editor',
      bio: 'Supports publishing workflows, community growth, and the day-to-day creative roadmap.',
      instagram: 'https://www.instagram.com/adan_theeditor?igsh=Mm5hbXUwMjVmeGpx',
      image: adanCoFounder
    }
  ],
  manager: {
    name: 'Muniza',
    title: 'Manager',
    bio: 'Keeps publishing schedules aligned and helps the team stay organized and responsive.',
    instagram: 'https://www.instagram.com/itx._.muniza?igsh=d29iNDJ3MGpncTIw',
    image: munizaVoiceArtist2
  },
  voiceArtists: [
    {
      name: 'Nimal',
      title: 'Voice Artist',
      bio: 'Female Voice artist in kitab era and developer of website',
      instagram: 'https://www.instagram.com/siraat_author',
      image: nimalVoiceArtist1
    },

    {
      name: 'Ammar',
      title: 'Voice Artist',
      bio: 'Specializes in expressive delivery for dialogue and dramatic scenes.',
      instagram: 'https://www.instagram.com/iamasimplemuslim?igsh=eTFyc2R2bzY0bWtz',
      image: ammarVoiceArtist3
    }
  ],
  editors: [
    {
      name: 'Aura Noor',
      title: 'Editor',
      bio: 'Editor in kitab Era Team , edit reels and pick best of novels lines',
      instagram: 'https://www.instagram.com/aura_the_noor?igsh=a2d4eXA0NmNqandk',
      image:auraManager
    },
    {
      name: 'Sadia',
      title: 'Editor',
      bio: 'Editor in kitab Era Team , edit reels and pick best of novels lines',
      instagram: 'https://www.instagram.com/sadiawrites71?igsh=MXQ1bzl2azc1ZWg2cw==',
      image: sadiaEditor
    },
    {
      name: 'Abubakar',
      title: 'Editor',
      bio: ' Male Editor in kitab Era Team , edit reels and pick best of novels lines',
      instagram: 'https://www.instagram.com/abubakerkhan_official?igsh=MXhjM3F6cTFuejlvZA==',
      image: abubakarEditor
    },
    {
      name: 'Aleeza',
      title: 'Editor',
      bio: 'Editor in kitab Era Team , edit reels and pick best of novels lines',
      instagram: 'https://www.instagram.com/khuwab.safar?igsh=dzY3aTQ2aDBibXZv',
      image: aleezaEditor
    },
    {
      name: 'Qandeel',
      title: 'Editor',
      bio: 'Helps improve flow and presentation across the published library.',
      instagram: 'https://www.instagram.com/qandeel_fatima45?igsh=MmE1Y2p0b2ltenV5',
      image: qandeelEditor
    },
    {
      name: 'Asma',
      title: 'Editor',
      bio: 'Makes sure the reading experience feels polished across devices.',
      instagram: 'https://www.instagram.com/lost_1.101?igsh=M3dpNmc1aXMxeHFk',
      image: asmaEditor
    },
    {
      name: 'Maheen',
      title: 'Editor',
      bio: 'Keeps tone, layout, and content presentation aligned with the brand.',
      instagram: 'https://www.instagram.com/lunahmeen?igsh=MTFlbjBxMnlodHJsaA==',
      image: maheenEditor
    }
  ],
  popularNovels: [
    {
      title: 'Moonlit Chapters',
      writer: 'Popular pick',
      summary: 'A quiet, emotional read with a steady pace and memorable character moments.'
    },
    {
      title: 'Echoes of the Page',
      writer: 'Reader favorite',
      summary: 'A modern novel space for readers who want strong storytelling and atmosphere.'
    },
    {
      title: 'The Silent Shelf',
      writer: 'Trending now',
      summary: 'A smooth, reflective story that fits the calm reading experience of Kitab Era.'
    }
  ]
};

function TeamCard({ member }) {
  return (
    <article className="team-card">
      <div className="team-card__media">
        <img src={member.image} alt={member.name} />
      </div>
      <div className="team-card__body">
        <span>{member.title}</span>
        <h3>{member.name}</h3>
        <p>{member.bio}</p>
        <a href={member.instagram} target="_blank" rel="noreferrer" className="team-card__link">
          Instagram profile
        </a>
      </div>
    </article>
  );
}

function StarRating({ rating, onRate, editable = false, size = 24 }) {
  const [hoverRating, setHoverRating] = useState(0);
  const safeRating = rating || 0;

  const handleStarClick = (starRating) => {
    if (editable && onRate) {
      onRate(starRating);
    }
  };

  const handleStarHover = (starRating) => {
    if (editable) {
      setHoverRating(starRating);
    }
  };

  const handleStarLeave = () => {
    if (editable) {
      setHoverRating(0);
    }
  };

  return (
    <div className="star-rating" style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating || safeRating) >= star;

        return (
          <span
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleStarLeave}
            style={{
              fontSize: size,
              cursor: editable ? 'pointer' : 'default',
              color: isFilled ? '#FFD700' : '#ddd',
              transition: 'color 0.2s ease'
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

function SocialIcon({ type, useImage = false }) {
  // If useImage is true, use the user's custom images; else use default SVGs
  if (useImage) {
    if (type === 'facebook') return <img src={facebookIcon} alt="Facebook" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
    if (type === 'instagram') return <img src={instagramIcon} alt="Instagram" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
    if (type === 'youtube') return <img src={youtubeIcon} alt="YouTube" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
    if (type === 'tiktok') return <img src={tiktokIcon} alt="TikTok" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
    if (type === 'whatsapp') return <img src={watsappIcon} alt="WhatsApp" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
    if (type === 'mail') return <img src={gmailIcon} alt="Email" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  }

  // Default to SVG
  if (type === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 22v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.8-.1-1.8-.2-2.8-.2-2.8 0-4.8 1.7-4.8 4.9V11H6v3h3.1v8h4.4z" />
      </svg>
    );
  }

  if (type === 'facebook-group') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
      </svg>
    );
  }

  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2Zm5.1-2.7a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" />
      </svg>
    );
  }

  if (type === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.8 7.2a3 3 0 0 0-2.1-2.1C18 4.7 12 4.7 12 4.7s-6 0-7.7.4a3 3 0 0 0-2.1 2.1A31.9 31.9 0 0 0 1.8 12a31.9 31.9 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.7.4 7.7.4 7.7.4s6 0 7.7-.4a3 3 0 0 0 2.1-2.1A31.9 31.9 0 0 0 22.2 12a31.9 31.9 0 0 0-.4-4.8ZM9.8 15.2V8.8L15.2 12Z" />
      </svg>
    );
  }

  if (type === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v14.05a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V10.6a6.32 6.32 0 0 0-.88-.06 6.36 6.36 0 0 0 0 12.72 6.36 6.36 0 0 0 6.36-6.36v-2.48a8.16 8.16 0 0 0 4.77 1.52V9.4a4.85 4.85 0 0 1-3.01-1.05z" />
      </svg>
    );
  }

  if (type === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.64 14.49c-.19.55-.79 1.01-1.26 1.06-1.19.13-3.14-.37-5.25-1.63-2.11-1.26-3.71-3.03-4.12-4.22-.42-1.19-.17-2.2.14-2.8.27-.5.76-.75 1.27-.75.1 0 .19.01.28.03.11.02.25.1.38.3.36.58.8 1.47 1 1.81.18.35.21.63.11.91-.11.29-.28.48-.54.74-.13.13-.29.31-.12.61.18.3.77 1.26 1.65 2.03 1.13.99 2.06 1.47 2.35 1.64.29.17.47.14.64-.08.18-.24.75-.87.95-1.17.19-.3.39-.25.66-.15.27.11 1.7.8 1.99.94.3.14.5.22.58.34.09.12.09.68-.1 1.23z" />
      </svg>
    );
  }

  if (type === 'mail') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 2v.4l8 5.2 8-5.2V8H4Zm16 8v-5.2l-8 5.2-8-5.2V16h16Z" />
      </svg>
    );
  }

  return null;
}

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5c-5.5 0-9.9 4.1-11.5 7 1.6 2.9 6 7 11.5 7s9.9-4.1 11.5-7C21.9 9.1 17.5 5 12 5Zm0 11.5A4.5 4.5 0 1 1 12 8a4.5 4.5 0 0 1 0 8.5Zm0-2.2A2.3 2.3 0 1 0 12 10a2.3 2.3 0 0 0 0 4.3Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 4.8 4.2 2.6 21.4 19.8l-2.2 2.2-3.2-3.2c-1.2.4-2.5.7-4 .7-5.5 0-9.9-4.1-11.5-7 .9-1.7 2.5-3.8 4.9-5.4L2 4.8Zm9.8 10.3c-2.4 0-4.3-1.9-4.3-4.3 0-.5.1-1 .3-1.5l-2-2C4.2 8.8 3.1 10.4 2.5 12c1.6 2.9 6 7 11.5 7 1 0 2-.1 3-.4l-1.8-1.8c-.6.2-1.2.3-1.9.3Zm-2-8.8 1.7 1.7c.3-.1.6-.1.9-.1 2.4 0 4.3 1.9 4.3 4.3 0 .3 0 .6-.1.9l1.7 1.7c.6-.8 1.1-1.5 1.5-2.1C18 8.9 13.6 4.8 8.1 4.8c-.8 0-1.6.1-2.4.3l1.7 1.7c.4-.1.8-.2 1.4-.2Z" />
    </svg>
  );
}

function SocialLink({ href, label, type }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="social-link" aria-label={label}>
      <SocialIcon type={type} />
      <span>{label}</span>
    </a>
  );
}

function Footer() {
  const socialLinks = [
    { href: 'https://www.instagram.com/kitaberaofficial?igsh=MXQwaTloaXlnbDg1aw==', type: 'instagram', label: 'Instagram' },
    { href: 'https://www.youtube.com/channel/UCEHsT1CiiWIKe6fdJeMrIAg', type: 'youtube', label: 'YouTube' },
    { href: 'https://www.tiktok.com/@kitaberaofficial?_r=1&_t=ZN-91hMPd6iK5n', type: 'tiktok', label: 'TikTok' },
    { href: 'https://www.facebook.com/share/18WHQvkwUG/', type: 'facebook', label: 'Facebook' },
    { href: 'https://www.facebook.com/share/g/1DgqUbmHDG/', type: 'facebook-group', label: 'Facebook Group' },
    { href: 'https://whatsapp.com/channel/0029VbBRHhZHVvTfCix9oA3J', type: 'whatsapp', label: 'WhatsApp' },
    { href: 'mailto:kitabera112025@gmail.com', type: 'mail', label: 'Email' }
  ];

  return (
    <footer className="site-footer" id="contact-us">
      <div className="site-footer__inner">
        <div className="site-footer__text">
          <span className="eyebrow site-footer__eyebrow">Contact us</span>
          <h2>Stay connected with Kitab Era.</h2>
          <p>Follow the latest updates, new releases, and voice content across our social channels.</p>
        </div>
        <div className="site-footer__icons">
          {socialLinks.map((link, index) => (
            <a key={index} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} className={`site-footer__icon site-footer__icon--${link.type}`}>
              {/* For Facebook, use SVG; others use custom images */}
              <SocialIcon type={link.type} useImage={link.type !== 'facebook'} />
            </a>
          ))}
        </div>
      </div>
      <div className="site-footer__credit">
        <p>
          Developed by Nimal{' '}
          <a href="https://www.instagram.com/siraat_author" target="_blank" rel="noreferrer" aria-label="Nimal Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2Zm5.1-2.7a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" />
            </svg>
          </a>
        </p>
      </div>
    </footer>
  );
}

function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminArea = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isHomePage = location.pathname === '/';
  const brandTitle = 'Kitab Era';
  const brandSubtitle = isAdminArea ? '' : 'Reading Room';
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleNavLogout() {
    localStorage.removeItem('kitab-era-admin-token');
    navigate('/');
    setDrawerOpen(false);
  }

  function toggleDrawer() {
    setDrawerOpen(!drawerOpen);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  const navLinks = isAdminArea ? (
    <>
      <Link to="/explore" onClick={closeDrawer}>Explore</Link>
      <Link to="/admin/manage" onClick={closeDrawer}>Manage Uploads</Link>
      <Link to="/admin/digest" onClick={closeDrawer}>Digest</Link>
      <span className="topbar__nav-divider" aria-hidden="true" />
      <button type="button" className="topbar__nav-logout" onClick={handleNavLogout}>
        Logout
      </button>
    </>
  ) : (
    <>
      <Link to="/" onClick={closeDrawer}>Homepage</Link>
      <Link to="/about-us" onClick={closeDrawer}>About Us</Link>
      <Link to="/services" onClick={closeDrawer}>Services</Link>
      <Link to="/contact-us" onClick={closeDrawer}>Contact Us</Link>
      <Link to="/popular-novels" onClick={closeDrawer}>Popular Novels</Link>
      <Link to="/digest" onClick={closeDrawer}>Digest</Link>
      <span className="topbar__nav-divider" aria-hidden="true" />
      {/* Desktop: Show "Ae", Mobile: Show "Admin Login" */}
      <Link to="/admin/login" className="topbar__nav-admin" aria-label="Admin login" title="Admin login" onClick={closeDrawer}>
        <span className="topbar__nav-admin--desktop">Ae</span>
        <span className="topbar__nav-admin--mobile">Admin Login</span>
      </Link>
    </>
  );

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-a" />
      <div className="background-orb background-orb-b" />
      
      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={closeDrawer}></div>
      )}

      <header className="topbar">
        <div className="topbar-left">
          {!isHomePage && (
            <button 
              type="button" 
              className="back-button" 
              onClick={() => navigate(-1)} 
              aria-label="Go back"
            >
              ←
            </button>
          )}
          <Link to="/" className="brand-mark">
            <img src={logo} alt="Kitab Era Logo" className="brand-mark__icon" />
            <span>
              <strong>{brandTitle}</strong>
              {brandSubtitle ? <small>{brandSubtitle}</small> : null}
            </span>
          </Link>
        </div>
        
        {/* Mobile Menu Toggle Button */}
        <button className="mobile-menu-toggle" onClick={toggleDrawer} aria-label="Toggle menu">
          {drawerOpen ? '✕' : '☰'}
        </button>
        
        {/* Desktop Nav */}
        <nav className="topbar__nav topbar__nav--desktop">
          {navLinks}
        </nav>
      </header>

      {/* Mobile Drawer Nav */}
      <nav className={`drawer ${drawerOpen ? 'open' : ''}`}>
        {navLinks}
      </nav>

      <main>{children}</main>
      <Footer />
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [videoReady, setVideoReady] = useState(false);

  return (
    <AppShell>
      <section className="hero hero--landing" id="home">
        <div className="hero__video-card hero__video-card--full">
          <div className={`hero__video-placeholder ${videoReady ? 'is-hidden' : ''}`} aria-hidden="true" />
          <video
            className={`hero__video ${videoReady ? 'is-visible' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
            onLoadedData={() => setVideoReady(true)}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="hero__glass-overlay" aria-hidden="true" />
          <div className="hero__overlay-content">
            <div className="hero__copy hero__copy--overlay">
              <span className="eyebrow">Digital novel shelf</span>
              <h1>
                <span className="hero__title-line hero__title-line--light">Books</span>
                <span className="hero__title-line hero__title-line--mid">Pages</span>
                <span className="hero__title-line hero__title-line--dark">Library stories</span>
              </h1>
              <p>
                A reading space for books, library stories, writers, and calm discoveries across the page.
              </p>
              <div className="hero__actions">
                <button className="primary-button" onClick={() => navigate('/explore')}>
                  Explore
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function AboutPage() {
  return (
    <AppShell>
      <section className="page-section page-hero-copy">
        <div className="section-heading">
          <span className="eyebrow">About us</span>
          <h2>The team behind the reading experience.</h2>
          <p>Founders, support staff, voice artists, and editors work together to keep the platform polished.</p>
        </div>

        <div className="team-grid team-grid--founders">
          {teamSections.founders.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>

        <div className="team-single">
          <TeamCard member={teamSections.manager} />
        </div>

        <div className="section-heading section-heading--compact">
          <h3>Voice artists</h3>
          <p>Four voice artists give the stories a warm and expressive reading presence.</p>
        </div>

        <div className="team-grid">
          {teamSections.voiceArtists.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>

        <div className="section-heading section-heading--compact">
          <h3>Editors</h3>
          <p>Seven editors help refine the final presentation and keep everything consistent.</p>
        </div>

        <div className="team-grid team-grid--editors">
          {teamSections.editors.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function PopularNovelsPage() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getPopularNovels()
      .then((data) => setNovels(data.novels))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <section className="page-section page-hero-copy">
        <div className="section-heading">
          <span className="eyebrow">Popular novels</span>
          <h2>Reader favorites in the spotlight.</h2>
          <p>These featured picks help visitors jump straight into the reading mood.</p>
        </div>

        {loading && <div className="state-card">Loading popular novels...</div>}
        {error && <div className="state-card state-card--error">{error}</div>}
        {!loading && !error && novels.length === 0 && (
          <div className="state-card">No popular novels yet! Rate some novels to see them here!</div>
        )}

        {!loading && !error && novels.length > 0 && (
          <div className="novel-highlight-grid">
            {novels.map((novel) => (
              <article key={novel.id} className="novel-highlight-card">
                <span>★ {(novel.averageRating || 0).toFixed(1)}</span>
                <h3>{novel.title}</h3>
                <p>{novel.summary}</p>
                <StarRating rating={novel.averageRating} />
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function DigestPage() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getLibrary()
      .then((data) => {
        if (!active) return;
        setNovels(Array.isArray(data.novels) ? data.novels.filter(Boolean) : []);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Digest only ever shows files the admin explicitly uploaded under the
  // "Digest" category — it is a separate bucket, not a mirror of the main library.
  const digestFiles = novels.filter((novel) => novel.category === 'digest' && novel.fileUrl);

  return (
    <AppShell>
      <section className="page-section page-hero-copy">
        <div className="section-heading">
          <span className="eyebrow">Digest</span>
          <h2>Digest uploads.</h2>
          <p>Files the team has uploaded specifically to the Digest section.</p>
        </div>

        {loading ? <div className="state-card">Loading digest...</div> : null}
        {error ? <div className="state-card state-card--error">{error}</div> : null}

        {!loading && !error && digestFiles.length === 0 ? (
          <div className="state-card" style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
            Coming soon.
          </div>
        ) : null}

        {!loading && !error && digestFiles.length > 0 ? (
          <div className="library-grid">
            {digestFiles.map((novel) => (
              <article key={novel.id} className="library-card">
                <span className="library-card__meta">Digest</span>
                <h3>{novel.title}</h3>
                <p>{novel.summary}</p>
                <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--plum-700)', fontWeight: '500' }}>
                  By {novel.writer?.name || 'Unknown Writer'}
                </div>
                <div className="library-card__actions">
                  <a href={apiAsset(novel.fileUrl)} target="_blank" rel="noreferrer" className="secondary-button">
                    Read Online
                  </a>
                  <a href={apiAsset(novel.fileUrl)} download className="primary-button">
                    Download
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}

function ContactPage() {
  const contactItems = [
    {
      type: 'instagram',
      label: 'Instagram',
      description: 'Follow us for daily updates and behind the scenes.',
      href: 'https://www.instagram.com/kitaberaofficial?igsh=MXQwaTloaXlnbDg1aw=='
    },
    {
      type: 'youtube',
      label: 'YouTube',
      description: 'Watch our latest videos and audio books.',
      href: 'https://www.youtube.com/channel/UCEHsT1CiiWIKe6fdJeMrIAg'
    },
    {
      type: 'tiktok',
      label: 'TikTok',
      description: 'Enjoy our short and engaging content.',
      href: 'https://www.tiktok.com/@kitaberaofficial?_r=1&_t=ZN-91hMPd6iK5n'
    },
    {
      type: 'facebook',
      label: 'Facebook',
      description: 'Connect with our community on Facebook.',
      href: 'https://www.facebook.com/share/18WHQvkwUG/'
    },
    {
      type: 'facebook-group',
      label: 'Facebook Group',
      description: 'Join our community group and share your thoughts.',
      href: 'https://www.facebook.com/share/g/1DgqUbmHDG/'
    },
    {
      type: 'whatsapp',
      label: 'WhatsApp Channel',
      description: 'Get instant updates on our WhatsApp channel.',
      href: 'https://whatsapp.com/channel/0029VbBRHhZHVvTfCix9oA3J'
    },
    {
      type: 'mail',
      label: 'Email Us',
      description: 'Send us an email for any queries or collaborations.',
      href: 'mailto:kitabera112025@gmail.com'
    }
  ];

  return (
    <AppShell>
      <section className="page-section page-hero-copy">
        <div className="section-heading">
          <span className="eyebrow">Contact us</span>
          <h2>Get in touch with Kitab Era.</h2>
          <p>We'd love to hear from you! Connect with us through any of our social channels or reach out via email.</p>
        </div>

        <div className="contact-cards-grid">
          {contactItems.map((item, index) => (
            <a key={index} href={item.href} target="_blank" rel="noreferrer" className="contact-card">
              <div className={`contact-card__icon contact-card__icon--${item.type}`}>
                <SocialIcon type={item.type} />
              </div>
              <div className="contact-card__content">
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </div>
              <button className="contact-card__button">
                Visit
              </button>
            </a>
          ))}
        </div>

        <div className="contact-note">
          <p>Developed by Nimal</p>
          <a href="https://www.instagram.com/siraat_author" target="_blank" rel="noreferrer" aria-label="Nimal Instagram">
            <SocialIcon type="instagram" />
            <span>@siraat_author</span>
          </a>
        </div>
      </section>
    </AppShell>
  );
}

function ServicesPage() {
  return (
    <AppShell>
      <section className="page-section services-page page-hero-copy">
        <div className="services-hero services-hero--featured">
          <div className="services-hero__card services-hero__card--text">
            <span className="eyebrow">Services</span>
            <h2>kitab era is now offering proofreading</h2>
            <p>
              A polished editorial experience built around clarity, tone, and beautiful presentation.
            </p>
            <a
              className="primary-button services-hero__button"
              href="https://www.instagram.com/kitaberaofficial?igsh=MXQwaTloaXlnbDg1aw=="
              target="_blank"
              rel="noreferrer"
            >
              Contact us
            </a>
          </div>

          <div className="services-hero__visual">
            <img src={proofreadingImage} alt="Proofreading workspace with notes and editorial tools" />
            <div className="services-hero__visualOverlay">
              <span>Proofreading</span>
              <p>Careful reading, correction, and polishing with a calm editorial finish.</p>
            </div>
          </div>
        </div>

        <div className="services-grid">
          {SERVICES.map((service) => (
            <article key={service.title} className="services-card">
              <span className="services-card__badge">{service.badge}</span>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
            </article>
          ))}
        </div>

        <div className="services-why">
          <span className="eyebrow">Why choose Kitab Era?</span>
          <h2>We keep the creative process calm, clear, and consistent.</h2>
          <div className="services-why__grid">
            {WHY_CHOOSE_POINTS.map((point) => (
              <div key={point} className="services-why__card">
                <p>{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function NovelPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  async function loadNovel() {
    try {
      const data = await getNovel(id);
      setNovel(data.novel);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadNovel(); }, [id]);

  const submitRating = async (rating, reviewerName, reviewText) => {
    try {
      await rateNovel(id, { rating, reviewerName, reviewText });
      await loadNovel();
    } catch (err) {
      alert(err.message);
    }
  };

  const downloadAll = async () => {
    if (!novel?.episodes?.length) return;
    setDownloading(true);
    try {
      for (const ep of novel.episodes) {
        const link = document.createElement('a');
        link.href = apiAsset(ep.fileUrl);
        link.setAttribute('download', `${novel.title} - ${ep.title}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise((res) => setTimeout(res, 500));
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppShell>
      <section className="page-section">
        <button
          type="button"
          className="secondary-button"
          style={{ marginBottom: '1.5rem' }}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {loading && <div className="state-card">Loading novel...</div>}
        {error && <div className="state-card state-card--error">{error}</div>}

        {novel && (
          <>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--plum-900), var(--plum-700))',
              borderRadius: '1.25rem',
              padding: '2rem',
              color: 'white',
              marginBottom: '2rem'
            }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.75, fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {CATEGORY_LABEL_MAP[novel.category] || 'Category'} · Episodic Novel
              </span>
              <h1 style={{ margin: '0.5rem 0 0.75rem', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)' }}>{novel.title}</h1>
              <p style={{ opacity: 0.85, margin: '0 0 1rem', lineHeight: 1.6 }}>{novel.summary}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {novel.writer && (
                  <Link to={`/writer/${novel.writer.slug}`} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', textDecoration: 'underline' }}>
                    By {novel.writer.name}
                  </Link>
                )}
                <span style={{ opacity: 0.6 }}>·</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>{novel.episodes?.length || 0} episodes</span>
                <span style={{ opacity: 0.6 }}>·</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>★ {(novel.averageRating || 0).toFixed(1)} ({novel.reviews?.length || 0} reviews)</span>
              </div>

              {novel.episodes?.length > 0 && (
                <button
                  type="button"
                  onClick={downloadAll}
                  disabled={downloading}
                  style={{
                    marginTop: '1.25rem',
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    backdropFilter: 'blur(8px)',
                    transition: 'background 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {downloading ? 'Downloading...' : '⬇ Download Complete Novel'}
                </button>
              )}
            </div>

            {/* Episode List */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Episodes</h2>
              {novel.episodes?.length === 0 && (
                <div className="state-card">No episodes uploaded yet.</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {novel.episodes?.map((ep, idx) => (
                  <div key={ep.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(88, 63, 88, 0.12)',
                    background: idx % 2 === 0 ? 'white' : 'var(--plum-50)',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--plum-950)' }}>{ep.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--plum-500)', marginTop: '0.15rem' }}>
                        Episode {ep.episodeNumber || idx + 1}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a
                        href={apiAsset(ep.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="secondary-button"
                        style={{ minHeight: '2.25rem', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                      >
                        Read Online
                      </a>
                      <a
                        href={apiAsset(ep.fileUrl)}
                        download
                        className="primary-button"
                        style={{ minHeight: '2.25rem', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating & Reviews */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Rate & Review</h2>
              <ReviewForm novel={novel} onSubmit={(r, name, text) => submitRating(r, name, text)} />
            </div>

            {novel.reviews?.length > 0 && (
              <div>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Reviews ({novel.reviews.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {novel.reviews.map(review => (
                    <div key={review.id} style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(88, 63, 88, 0.14)',
                      background: 'var(--paper-soft)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong>{review.reviewerName}</strong>
                        <StarRating rating={review.rating} size={18} />
                      </div>
                      {review.reviewText && <p style={{ margin: 0, color: 'var(--plum-700)' }}>{review.reviewText}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </AppShell>
  );
}

function FolderCard({ novel }) {
  return (
    <Link to={`/novel/${novel.id}`} style={{ textDecoration: 'none' }}>
      <article className="folder-card">
        <div className="folder-card__header">
          <div className="folder-card__icon-wrapper">
            <svg className="folder-card__icon" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
          </div>
          <div className="folder-card__info">
            <span className="folder-card__meta">
              {CATEGORY_LABEL_MAP[novel.category] || 'Category'} / Episodic Novel
            </span>
            <h3 className="folder-card__title">{novel.title}</h3>
          </div>
        </div>

        <p className="folder-card__summary">{novel.summary}</p>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--plum-700)' }}>
            By {novel.writer?.name || 'Unknown Writer'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--plum-500)' }}>•</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--plum-700)' }}>
            {novel.episodes?.length || 0} episodes
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--plum-500)' }}>•</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--plum-700)' }}>
            ★ {(novel.averageRating || 0).toFixed(1)} ({novel.reviews?.length || 0})
          </span>
        </div>

        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--plum-800)', fontWeight: 'bold' }}>
          Click to view episodes, read online, download & review →
        </div>
      </article>
    </Link>
  );
}


function ExplorePage() {
  const { category: categoryParam, subcategory: subcategoryParam } = useParams();
  const [novels, setNovels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedCategory = CATEGORY_OPTIONS.find((item) => item.key === String(categoryParam || '').toLowerCase()) || null;
  const selectedSubcategory = SUBCATEGORY_OPTIONS.find((item) => item.key === String(subcategoryParam || '').toLowerCase()) || null;
  const categoryNeedsSubcategory = selectedCategory && !CATEGORY_WITHOUT_SUBCATEGORY.has(selectedCategory.key);
  const safeNovels = Array.isArray(novels) ? novels.filter(Boolean) : [];

  const isSearching = searchQuery.trim().length > 0;

  const searchedNovels = isSearching ? safeNovels.filter((novel) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = novel.title?.toLowerCase().includes(query);
    const summaryMatch = novel.summary?.toLowerCase().includes(query);
    const writerMatch = novel.writer?.name?.toLowerCase().includes(query);
    const categoryMatch = CATEGORY_LABEL_MAP[novel.category]?.toLowerCase().includes(query);
    const subcategoryMatch = SUBCATEGORY_LABEL_MAP[novel.subcategory]?.toLowerCase().includes(query);
    return titleMatch || summaryMatch || writerMatch || categoryMatch || subcategoryMatch;
  }) : [];

  const filteredNovels = safeNovels.filter((novel) => {
    if (!selectedCategory) {
      return false;
    }

    if (novel?.category !== selectedCategory.key) {
      return false;
    }

    if (!categoryNeedsSubcategory) {
      return true;
    }

    if (!selectedSubcategory) {
      return false;
    }

    return novel?.subcategory === selectedSubcategory.key;
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getLibrary()
      .then((data) => {
        if (!active) {
          return;
        }
        setNovels(data.novels || []);
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }
        setError(requestError.message);
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      <section className="page-section">
        <div className="section-heading">
          <span className="eyebrow">Explore library</span>
          {isSearching ? (
            <h2>Search Results</h2>
          ) : (
            <>
              {!selectedCategory ? <h2>Browse by genre and section.</h2> : null}
              {selectedCategory && categoryNeedsSubcategory && !selectedSubcategory ? (
                <h2>{selectedCategory.label} categories</h2>
              ) : null}
              {selectedCategory && (!categoryNeedsSubcategory || selectedSubcategory) ? (
                <h2>
                  {selectedCategory.label}
                  {selectedSubcategory ? ` - ${selectedSubcategory.label}` : ''}
                </h2>
              ) : null}
            </>
          )}

          {isSearching ? (
            <p>Showing titles matching "{searchQuery}".</p>
          ) : (
            <>
              {!selectedCategory ? (
                <p>Choose a category to discover novels, poetry, and articles.</p>
              ) : null}
              {selectedCategory && categoryNeedsSubcategory && !selectedSubcategory ? (
                <p>Select a reading format to continue.</p>
              ) : null}
              {selectedCategory && (!categoryNeedsSubcategory || selectedSubcategory) ? (
                <p>Open any title to read online, download, or leave a review.</p>
              ) : null}
            </>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="search-bar-container">
          <div className="search-input-wrap">
            <svg className="search-icon-svg" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search novels, authors, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {loading ? <div className="state-card">Loading library...</div> : null}
        {error ? <div className="state-card state-card--error">{error}</div> : null}

        {!loading && !error && isSearching ? (
          <>
            {searchedNovels.length > 0 ? (
              <div className="folder-grid">
                {searchedNovels.map((novel) => {
                  if (novel.subcategory === 'episodic-novel') {
                    return <FolderCard key={novel.id} novel={novel} />;
                  }
                  return (
                    <article key={novel.id} className="library-card">
                      <span className="library-card__meta">
                        {CATEGORY_LABEL_MAP[novel.category] || 'Category'}
                        {novel.subcategory ? ` / ${SUBCATEGORY_LABEL_MAP[novel.subcategory] || novel.subcategory}` : ''}
                      </span>
                      <h3>{novel.title}</h3>
                      <p>{novel.summary}</p>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <StarRating rating={novel.averageRating} size={18} />
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--plum-700)' }}>
                          ({novel.reviews?.length || 0} reviews)
                        </span>
                      </div>
                      <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--plum-700)', fontWeight: '500' }}>
                        By {novel.writer?.name || 'Unknown Writer'}
                      </div>
                      <div className="library-card__actions">
                        <Link to={`/writer/${novel.writer?.slug}`} state={{ activeNovelId: novel.id }} className="secondary-button">
                          Writer page
                        </Link>
                        <a href={apiAsset(novel.fileUrl)} target="_blank" rel="noreferrer" className="secondary-button">
                          Read Online
                        </a>
                        <a href={apiAsset(novel.fileUrl)} download className="primary-button">
                          Download
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="state-card">No matching titles found for "{searchQuery}".</div>
            )}
          </>
        ) : null}

        {!loading && !error && !isSearching && !selectedCategory ? (
          <div className="category-grid">
            {CATEGORY_OPTIONS.map((category) => (
              <Link key={category.key} to={`/explore/${category.key}`} className="category-card">
                <span className="eyebrow category-card__tag">Category</span>
                <h3>{category.label}</h3>
                <p>
                  {CATEGORY_WITHOUT_SUBCATEGORY.has(category.key)
                    ? 'Read directly from this section.'
                    : 'Open genre formats like complete novels or episodic reads.'}
                </p>
              </Link>
            ))}
          </div>
        ) : null}

        {!loading && !error && !isSearching && selectedCategory && categoryNeedsSubcategory && !selectedSubcategory ? (
          <>
            <div className="breadcrumb-row">
              <Link className="secondary-button" to="/explore">
                All categories
              </Link>
            </div>
            <div className="category-grid category-grid--subcategories">
              {SUBCATEGORY_OPTIONS.map((subcategory) => (
                <Link
                  key={subcategory.key}
                  to={`/explore/${selectedCategory.key}/${subcategory.key}`}
                  className="category-card"
                >
                  <span className="eyebrow category-card__tag">Format</span>
                  <h3>{subcategory.label}</h3>
                  <p>See all {selectedCategory.label.toLowerCase()} titles in this format.</p>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        {!loading && !error && !isSearching && selectedCategory && (!categoryNeedsSubcategory || selectedSubcategory) ? (
          <>
            <div className="breadcrumb-row">
              <Link className="secondary-button" to="/explore">
                All categories
              </Link>
              {categoryNeedsSubcategory ? (
                <Link className="secondary-button" to={`/explore/${selectedCategory.key}`}>
                  {selectedCategory.label} formats
                </Link>
              ) : null}
            </div>

            {selectedSubcategory?.key === 'episodic-novel' ? (
              <div className="folder-grid">
                {filteredNovels.map((novel) => (
                  <FolderCard key={novel.id} novel={novel} />
                ))}
              </div>
            ) : (
              <div className="library-grid">
                {filteredNovels.map((novel) => (
                  <article key={novel.id} className="library-card">
                    <span className="library-card__meta">
                      {CATEGORY_LABEL_MAP[novel.category] || 'Category'}
                      {novel.subcategory ? ` / ${SUBCATEGORY_LABEL_MAP[novel.subcategory] || novel.subcategory}` : ''}
                    </span>
                    <h3>{novel.title}</h3>
                    <p>{novel.summary}</p>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <StarRating rating={novel.averageRating} size={18} />
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--plum-700)' }}>
                        ({novel.reviews?.length || 0} reviews)
                      </span>
                    </div>
                    <div className="library-card__actions">
                      <Link to={`/writer/${novel.writer?.slug}`} state={{ activeNovelId: novel.id }} className="secondary-button">
                        Writer page
                      </Link>
                      <a href={apiAsset(novel.fileUrl)} target="_blank" rel="noreferrer" className="secondary-button">
                        Read Online
                      </a>
                      <a href={apiAsset(novel.fileUrl)} download className="primary-button">
                        Download
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : null}

        {!loading && !error && !isSearching && selectedCategory && (!categoryNeedsSubcategory || selectedSubcategory) && filteredNovels.length === 0 ? (
          <div className="state-card">No titles found in this section yet.</div>
        ) : null}
      </section>
    </AppShell>
  );
}

function WriterPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [writer, setWriter] = useState(null);
  const [novels, setNovels] = useState([]);
  const [activeNovel, setActiveNovel] = useState(null);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const submitRating = async (novelId, rating, reviewerName, reviewText) => {
    try {
      await rateNovel(novelId, { rating, reviewerName, reviewText });
      const data = await getWriter(slug);
      setNovels(data.novels);
      const updatedActive = data.novels.find(n => n.id === novelId);
      if (updatedActive) setActiveNovel(updatedActive);
    } catch (err) {
      alert(err.message);
    }
  };

  const downloadAllEpisodes = async () => {
    if (!activeNovel || !activeNovel.episodes || activeNovel.episodes.length === 0) return;
    setDownloading(true);
    try {
      for (const ep of activeNovel.episodes) {
        const link = document.createElement('a');
        link.href = apiAsset(ep.fileUrl);
        link.setAttribute('download', `${activeNovel.title} - ${ep.title}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Sequential delays prevent the browser blocking download windows
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error("Error downloading episodes:", err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getWriter(slug)
      .then((data) => {
        if (!active) {
          return;
        }
        setWriter(data.writer);
        const fetchedNovels = data.novels || [];
        setNovels(fetchedNovels);

        // Preselect novel if passed in navigation state from ExplorePage
        const stateNovelId = location.state?.activeNovelId;
        const initialNovel = fetchedNovels.find((n) => n.id === stateNovelId) || fetchedNovels[0] || null;
        setActiveNovel(initialNovel);
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }
        setError(requestError.message);
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, location.state?.activeNovelId]);

  useEffect(() => {
    if (activeNovel) {
      if (activeNovel.subcategory === 'episodic-novel' && activeNovel.episodes?.length > 0) {
        setActiveEpisode(activeNovel.episodes[0]);
      } else {
        setActiveEpisode(null);
      }
    } else {
      setActiveEpisode(null);
    }
  }, [activeNovel]);

  return (
    <AppShell>
      <section className="page-section writer-layout">
        {loading ? <div className="state-card">Loading writer...</div> : null}
        {error ? <div className="state-card state-card--error">{error}</div> : null}

        {writer ? (
          <>
            <div className="writer-hero">
              <div>
                <span className="eyebrow">Writer library</span>
                <h2>{writer.name}</h2>
                <p>{writer.bio}</p>
              </div>
              <div className="writer-hero__badge">
                <strong>{novels.length}</strong>
                <span>Available novels</span>
              </div>
            </div>

            <div className="writer-layout__grid">
              <aside className="novel-list">
                <h3>Novels</h3>
                {novels.length === 0 ? <div className="state-card">No novels uploaded yet.</div> : null}
                {novels.map((novel) => (
                  <button
                    key={novel.id}
                    className={`novel-list__item ${activeNovel?.id === novel.id ? 'is-active' : ''}`}
                    onClick={() => setActiveNovel(novel)}
                  >
                    <span>{novel.title}</span>
                    <small>★ {(novel.averageRating || 0).toFixed(1)} ({novel.reviews?.length || 0} reviews)</small>
                  </button>
                ))}
              </aside>

              <article className="reader-panel">
                {activeNovel ? (
                  <>
                    <div className="reader-panel__head">
                      <div>
                        <span className="eyebrow">Now reading</span>
                        <h3>{activeNovel.title}</h3>
                        <p>{activeNovel.summary}</p>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <StarRating rating={activeNovel.averageRating} />
                          <span style={{ marginLeft: '0.5rem', color: 'var(--plum-700)' }}>
                            ({activeNovel.reviews?.length || 0} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="reader-panel__actions">
                        {activeNovel.subcategory === 'episodic-novel' && activeNovel.episodes?.length > 0 && (
                          <button
                            onClick={downloadAllEpisodes}
                            className="secondary-button"
                            disabled={downloading}
                            style={{ background: 'var(--plum-800)', color: 'white', borderColor: 'transparent' }}
                          >
                            {downloading ? 'Downloading...' : 'Download Complete Novel'}
                          </button>
                        )}
                        <a
                          href={apiAsset(activeEpisode ? activeEpisode.fileUrl : activeNovel.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary-button"
                        >
                          Open {activeEpisode ? activeEpisode.title : 'PDF'}
                        </a>
                        <a
                          href={apiAsset(activeEpisode ? activeEpisode.fileUrl : activeNovel.fileUrl)}
                          download
                          className="primary-button"
                        >
                          Download {activeEpisode ? activeEpisode.title : 'PDF'}
                        </a>
                      </div>
                    </div>

                    {activeNovel.subcategory === 'episodic-novel' && activeNovel.episodes?.length > 0 && (
                      <div className="episode-selector-section">
                        <span className="eyebrow">Select Episode</span>
                        <div className="episode-btn-grid">
                          {activeNovel.episodes.map((ep) => {
                            const isSelected = activeEpisode?.id === ep.id;
                            return (
                              <button
                                key={ep.id}
                                onClick={() => setActiveEpisode(ep)}
                                className={`episode-btn ${isSelected ? 'is-active' : ''}`}
                              >
                                {ep.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pdf-frame-wrap">
                      <iframe
                        title={activeEpisode ? `${activeNovel.title} - ${activeEpisode.title}` : activeNovel.title}
                        src={apiAsset(activeEpisode ? activeEpisode.fileUrl : activeNovel.fileUrl)}
                        className="pdf-frame"
                      />
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                      <h3>Rate & Review</h3>
                      <ReviewForm novel={activeNovel} onSubmit={(r, name, text) => submitRating(activeNovel.id, r, name, text)} />
                    </div>
                    {activeNovel.reviews?.length > 0 && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <h3>Reviews ({activeNovel.reviews.length})</h3>
                        <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {activeNovel.reviews.map(review => (
                            <div key={review.id} className="review-card" style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(88, 63, 88, 0.14)', background: 'var(--paper-soft)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <strong>{review.reviewerName}</strong>
                                <StarRating rating={review.rating} size={18} />
                              </div>
                              {review.reviewText && <p style={{ margin: 0, color: 'var(--plum-700)' }}>{review.reviewText}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="state-card">Select a novel to read it online.</div>
                )}
              </article>
            </div>
          </>
        ) : null}
      </section>
    </AppShell>
  );
}

function ReviewForm({ novel, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return alert('Please select a rating');
    setSubmitting(true);
    await onSubmit(rating, name || 'Anonymous', text);
    setRating(0);
    setName('');
    setText('');
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(88, 63, 88, 0.14)', background: 'var(--paper-soft)' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Rating</label>
        <StarRating rating={rating} onRate={setRating} editable />
      </div>
      <div>
        <label htmlFor="reviewer-name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Name (optional)</label>
        <input id="reviewer-name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(88, 63, 88, 0.16)', background: 'white' }} placeholder="Anonymous" />
      </div>
      <div>
        <label htmlFor="review-text" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Review (optional)</label>
        <textarea id="review-text" value={text} onChange={(e) => setText(e.target.value)} rows={3} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(88, 63, 88, 0.16)', background: 'white' }} placeholder="Write your review here..." />
      </div>
      <button type="submit" disabled={submitting} className="primary-button" style={{ width: 'fit-content' }}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminLogin({ username: username.trim(), password: password.trim() });
      localStorage.setItem('kitab-era-admin-token', response.token);
      navigate('/admin');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="page-section admin-auth">
        <form className="auth-card" onSubmit={handleSubmit} autoComplete="off">
          <span className="eyebrow">Admin access</span>
          <h2>Secure the writer dashboard.</h2>

          <label>
            Username
            <input
              name="admin-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              autoComplete="off"
            />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                name="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-field__toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </label>
          {error ? <div className="state-card state-card--error">{error}</div> : null}
          <button className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Enter admin panel'}
          </button>
        </form>
      </section>
    </AppShell>
  );
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [writers, setWriters] = useState([]);
  const [writerForm, setWriterForm] = useState({ name: '', bio: '' });
  const [novelForm, setNovelForm] = useState({
    writerId: '',
    title: '',
    summary: '',
    category: 'islamic',
    subcategory: 'complete-novel'
  });
  const [writerAvatar, setWriterAvatar] = useState(null);
  const [novelPdf, setNovelPdf] = useState(null);
  const [episodicAction, setEpisodicAction] = useState('create'); // 'create' | 'upload'
  const [episodeUploadNovelId, setEpisodeUploadNovelId] = useState(null);
  const [newEpisodeTitle, setNewEpisodeTitle] = useState('');
  const [writerFeedback, setWriterFeedback] = useState({ message: '', error: '' });
  const [novelFeedback, setNovelFeedback] = useState({ message: '', error: '' });
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('kitab-era-admin-token');

  async function loadLibrary() {
    setLoading(true);
    try {
      const data = await getAdminLibrary(token);
      const items = data.writers || [];
      setWriters(items);
      setNovelForm((current) => ({
        ...current,
        writerId: String(current.writerId || items[0]?.id || ''),
        subcategory: CATEGORY_WITHOUT_SUBCATEGORY.has(current.category) ? '' : current.subcategory || 'complete-novel'
      }));
    } catch (e) {
      console.error("Failed to load library:", e);
      if (e.status === 401) {
        localStorage.removeItem('kitab-era-admin-token');
        navigate('/admin/login', { replace: true });
        return;
      }
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    loadLibrary();
  }, [navigate, token]);

  async function handleWriterSubmit(event) {
    event.preventDefault();
    setWriterFeedback({ message: '', error: '' });

    const createdName = writerForm.name.trim();

    const formData = new FormData();
    formData.append('name', writerForm.name);
    formData.append('bio', writerForm.bio);

    if (writerAvatar) {
      formData.append('avatar', writerAvatar);
    }

    try {
      const response = await createWriter(token, formData);
      setWriterForm({ name: '', bio: '' });
      setWriterAvatar(null);
      setWriterFeedback({ message: 'Writer added successfully.', error: '' });

      // Reload the fresh writer list directly (instead of the generic loadLibrary
      // heuristic) so we can reliably figure out the ID of the writer we just created.
      const data = await getAdminLibrary(token);
      const items = data.writers || [];
      setWriters(items);

      const newWriterId =
        response?.writer?.id ||
        response?.id ||
        items.find((w) => w.name === createdName)?.id ||
        items[items.length - 1]?.id ||
        '';

      // Auto-select the newly created writer in the Upload Novel form so the
      // person doesn't have to pick it manually (and so writerId is never stale).
      setNovelForm((current) => ({
        ...current,
        writerId: String(newWriterId || current.writerId || items[0]?.id || ''),
        subcategory: CATEGORY_WITHOUT_SUBCATEGORY.has(current.category) ? '' : current.subcategory || 'complete-novel'
      }));
    } catch (requestError) {
      setWriterFeedback({ message: '', error: requestError.message });
    }
  }

  async function handleNovelSubmit(event) {
    event.preventDefault();
    console.log('handleNovelSubmit called!');
    console.log('novelForm:', novelForm);
    console.log('novelPdf:', novelPdf);
    console.log('episodicAction:', episodicAction);
    console.log('episodeUploadNovelId:', episodeUploadNovelId);
    setNovelFeedback({ message: '', error: '' });

    if (!novelForm.title.trim()) {
      console.log('No title provided!');
      setNovelFeedback({ message: '', error: 'Novel title is required.' });
      return;
    }

    const isEpisodic = novelForm.subcategory === 'episodic-novel';

    // For non-episodic novels PDF is always required
    if (!isEpisodic && !novelPdf) {
      setNovelFeedback({ message: '', error: 'PDF file is required.' });
      return;
    }

    // For episodic "Upload Episode" mode, PDF required
    if (isEpisodic && episodicAction === 'upload' && !novelPdf) {
      setNovelFeedback({ message: '', error: 'PDF file is required for episode upload.' });
      return;
    }

    // For episodic "Upload Episode" mode, folder selection required
    if (isEpisodic && episodicAction === 'upload' && !episodeUploadNovelId) {
      setNovelFeedback({ message: '', error: 'Please select a folder (novel) to upload the episode into.' });
      return;
    }

    const formData = new FormData();
    formData.append('writerId', novelForm.writerId);
    formData.append('title', novelForm.title);
    formData.append('summary', novelForm.summary);
    formData.append('category', novelForm.category);
    formData.append('subcategory', novelForm.subcategory);

    if (isEpisodic && episodicAction === 'upload') {
      // Upload episode into existing folder
      formData.append('novelId', episodeUploadNovelId);
      formData.append('episodeTitle', newEpisodeTitle.trim());
      formData.append('pdf', novelPdf);
    } else if (novelPdf) {
      formData.append('pdf', novelPdf);
    }
    // else: creating empty episodic folder with no PDF

    try {
      await createNovel(token, formData);
      setNovelForm((current) => ({
        ...current,
        title: '',
        summary: '',
        subcategory: CATEGORY_WITHOUT_SUBCATEGORY.has(current.category) ? '' : current.subcategory || 'complete-novel'
      }));
      setNovelPdf(null);
      setNewEpisodeTitle('');
      setEpisodeUploadNovelId(null);
      setEpisodicAction('create');
      setNovelFeedback({
        message: isEpisodic && episodicAction === 'upload' ? 'Episode uploaded successfully.' : 'Novel created successfully.',
        error: ''
      });
      await loadLibrary();
    } catch (requestError) {
      setNovelFeedback({ message: '', error: requestError.message });
    }
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AppShell>
      <section className="page-section admin-layout">
        <button 
          className="secondary-button" 
          onClick={() => navigate('/')}
          style={{ 
            marginBottom: '1.5rem',
            width: 'fit-content',
            fontSize: '0.9rem',
            padding: '0.6rem 1rem',
            boxShadow: '0 4px 12px rgba(88, 63, 88, 0.12)',
            border: '1px solid rgba(88, 63, 88, 0.2)'
          }}
        >
          ← Back to Explore
        </button>
        <div className="section-heading admin-layout__heading">
          <div>
            <span className="eyebrow">Admin dashboard</span>
            <h2>Add writers & upload content.</h2>
            <p>Add writers first, then upload their PDFs into the selected writer profile. Head to "Manage Uploads" in the nav to edit or delete existing content.</p>
          </div>
        </div>

        {loading ? <div className="state-card">Loading dashboard...</div> : null}
        {loadError ? <div className="state-card state-card--error">{loadError}</div> : null}

        {!loading && (
          <>
            <div className="admin-grid">
              <form className="admin-card" onSubmit={handleWriterSubmit}>
                <h3>Add Writer</h3>
                <label>
                  Writer name
                  <input value={writerForm.name} onChange={(event) => setWriterForm({ ...writerForm, name: event.target.value })} />
                </label>
                <label>
                  Bio
                  <textarea value={writerForm.bio} onChange={(event) => setWriterForm({ ...writerForm, bio: event.target.value })} rows="5" />
                </label>
                <label>
                  Avatar image
                  <input type="file" accept="image/*" onChange={(event) => setWriterAvatar(event.target.files?.[0] || null)} />
                </label>
                <button className="primary-button">Save writer</button>
                {writerFeedback.message ? <div className="state-card state-card--success">{writerFeedback.message}</div> : null}
                {writerFeedback.error ? <div className="state-card state-card--error">{writerFeedback.error}</div> : null}
              </form>

              <form className="admin-card" onSubmit={handleNovelSubmit}>
                <h3>Upload Novel / Create Folder</h3>
                <label>
                  Writer
                  <select
                    value={String(novelForm.writerId ?? '')}
                    onChange={(event) => setNovelForm({ ...novelForm, writerId: event.target.value })}
                  >
                    {writers.map((writer) => (
                      <option key={writer.id} value={String(writer.id)}>
                        {writer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Category
                  <select
                    value={novelForm.category}
                    onChange={(event) => {
                      const nextCategory = event.target.value;
                      setNovelForm((current) => ({
                        ...current,
                        category: nextCategory,
                        subcategory: CATEGORY_WITHOUT_SUBCATEGORY.has(nextCategory)
                          ? ''
                          : current.subcategory || 'complete-novel'
                      }));
                    }}
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                {!CATEGORY_WITHOUT_SUBCATEGORY.has(novelForm.category) ? (
                  <label>
                    Subcategory
                    <select
                      value={novelForm.subcategory}
                      onChange={(event) => {
                        setNovelForm({ ...novelForm, subcategory: event.target.value });
                        setEpisodicAction('create');
                        setEpisodeUploadNovelId(null);
                        setNewEpisodeTitle('');
                        setNovelPdf(null);
                      }}
                    >
                      {SUBCATEGORY_OPTIONS.map((subcategory) => (
                        <option key={subcategory.key} value={subcategory.key}>
                          {subcategory.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="admin-card__hint">No subcategory required for this section.</div>
                )}

                {/* Episodic Action Chooser: shows the moment "Episodic Novels" subcategory is picked */}
                {novelForm.subcategory === 'episodic-novel' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>Action</strong>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input
                          type="radio"
                          name="episodicAction"
                          value="create"
                          checked={episodicAction === 'create'}
                          onChange={() => { setEpisodicAction('create'); setEpisodeUploadNovelId(null); setNovelPdf(null); setNewEpisodeTitle(''); }}
                        />
                        Create Folder
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input
                          type="radio"
                          name="episodicAction"
                          value="upload"
                          checked={episodicAction === 'upload'}
                          onChange={() => { setEpisodicAction('upload'); setNovelForm(f => ({ ...f, title: '', summary: '' })); }}
                        />
                        Upload File to Folder
                      </label>
                    </div>

                    {episodicAction === 'create' ? (
                      <>
                        <label>
                          Folder Name (Novel Title)
                          <input value={novelForm.title} onChange={(event) => setNovelForm({ ...novelForm, title: event.target.value })} placeholder="e.g. Jannat Kay Pattay" />
                        </label>
                        <label>
                          Summary
                          <textarea value={novelForm.summary} onChange={(event) => setNovelForm({ ...novelForm, summary: event.target.value })} rows="4" placeholder="Brief description of the novel..." />
                        </label>
                        <button className="primary-button" disabled={!novelForm.title.trim()}>
                          Create Folder
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Select existing episodic folder, then upload a file into it */}
                        {(() => {
                          const episodicFolders = writers
                            .flatMap(w => (w.novels || []).filter(n => n.subcategory === 'episodic-novel').map(n => ({ ...n, writerName: w.name, writerId: w.id })));
                          return (
                            <label>
                              Select Folder (Novel)
                              <select
                                value={episodeUploadNovelId || ''}
                                onChange={(e) => {
                                  const selectedNovel = episodicFolders.find(n => n.id === e.target.value);
                                  setEpisodeUploadNovelId(e.target.value);
                                  if (selectedNovel) {
                                    setNovelForm(f => ({
                                      ...f,
                                      writerId: selectedNovel.writerId,
                                      title: selectedNovel.title,
                                      summary: selectedNovel.summary,
                                      category: selectedNovel.category,
                                      subcategory: selectedNovel.subcategory
                                    }));
                                  }
                                }}
                              >
                                <option value="">-- Select a folder --</option>
                                {episodicFolders.map(n => (
                                  <option key={n.id} value={n.id}>{n.title} ({n.writerName})</option>
                                ))}
                              </select>
                            </label>
                          );
                        })()}
                        {episodeUploadNovelId ? (
                          <>
                            <label>
                              Episode / File Title (optional)
                              <input
                                value={newEpisodeTitle}
                                onChange={(e) => setNewEpisodeTitle(e.target.value)}
                                placeholder={`Episode ${(writers.flatMap(w => w.novels || []).find(n => n.id === episodeUploadNovelId)?.episodes?.length || 0) + 1}`}
                              />
                            </label>
                            <label>
                              PDF File
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={(event) => setNovelPdf(event.target.files?.[0] || null)}
                                required
                              />
                              {novelPdf && <small style={{ color: 'var(--plum-700)' }}>✓ {novelPdf.name}</small>}
                            </label>
                            <button className="primary-button" disabled={!novelPdf}>
                              Upload File
                            </button>
                          </>
                        ) : (
                          <div className="admin-card__hint">Select a folder above to reveal the file upload option.</div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  /* Regular (non-episodic) novel */
                  <>
                    <label>
                      Novel title
                      <input value={novelForm.title} onChange={(event) => setNovelForm({ ...novelForm, title: event.target.value })} />
                    </label>
                    <label>
                      Summary
                      <textarea value={novelForm.summary} onChange={(event) => setNovelForm({ ...novelForm, summary: event.target.value })} rows="5" />
                    </label>
                    <label>
                      PDF file
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => setNovelPdf(event.target.files?.[0] || null)}
                        required
                      />
                      {novelPdf && <small style={{ color: 'var(--plum-700)' }}>✓ {novelPdf.name}</small>}
                    </label>
                    <button className="primary-button" disabled={!novelPdf || !novelForm.title.trim()}>
                      {!novelPdf ? 'Select PDF file to upload' : 'Upload novel'}
                    </button>
                  </>
                )}
                {novelFeedback.message ? <div className="state-card state-card--success">{novelFeedback.message}</div> : null}
                {novelFeedback.error ? <div className="state-card state-card--error">{novelFeedback.error}</div> : null}
              </form>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}

function AdminManagePage() {
  const navigate = useNavigate();
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [libraryFeedback, setLibraryFeedback] = useState({ message: '', error: '' });
  const [episodeUploadNovelId, setEpisodeUploadNovelId] = useState(null);
  const [newEpisodeTitle, setNewEpisodeTitle] = useState('');
  const [newEpisodePdf, setNewEpisodePdf] = useState(null);
  const [editingWriterId, setEditingWriterId] = useState(null);
  const [writerEditForm, setWriterEditForm] = useState({ name: '', bio: '' });
  const [writerEditAvatar, setWriterEditAvatar] = useState(null);
  const [editingNovelId, setEditingNovelId] = useState(null);
  const [novelEditForm, setNovelEditForm] = useState({ title: '', summary: '', category: '', subcategory: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('kitab-era-admin-token');

  async function loadLibrary() {
    setLoading(true);
    try {
      const data = await getAdminLibrary(token);
      setWriters(data.writers || []);
    } catch (e) {
      console.error("Failed to load library:", e);
      if (e.status === 401) {
        localStorage.removeItem('kitab-era-admin-token');
        navigate('/admin/login', { replace: true });
        return;
      }
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    loadLibrary();
  }, [navigate, token]);

  async function handleAddEpisodeSubmit(event, novel, writerId) {
    event.preventDefault();
    setLibraryFeedback({ message: '', error: '' });

    if (!newEpisodePdf) {
      setLibraryFeedback({ message: '', error: 'PDF file is required.' });
      return;
    }

    const formData = new FormData();
    formData.append('writerId', writerId);
    formData.append('novelId', novel.id);
    formData.append('title', novel.title);
    formData.append('summary', novel.summary);
    formData.append('category', novel.category);
    formData.append('subcategory', novel.subcategory);
    formData.append('episodeTitle', newEpisodeTitle.trim());
    formData.append('pdf', newEpisodePdf);

    try {
      await createNovel(token, formData);
      setNewEpisodeTitle('');
      setNewEpisodePdf(null);
      setEpisodeUploadNovelId(null);
      setLibraryFeedback({ message: `Episode uploaded successfully to "${novel.title}".`, error: '' });
      await loadLibrary();
    } catch (requestError) {
      setLibraryFeedback({ message: '', error: requestError.message });
    }
  }

  async function handleDeleteWriter(writer) {
    if (!window.confirm(`Delete ${writer.name}? This will also delete their novels.`)) {
      return;
    }

    try {
      setLibraryFeedback({ message: '', error: '' });
      await deleteWriter(token, writer.id);
      setLibraryFeedback({ message: 'Writer deleted successfully.', error: '' });
      await loadLibrary();
    } catch (requestError) {
      setLibraryFeedback({ message: '', error: requestError.message });
    }
  }

  async function handleDeleteNovel(novel) {
    if (!window.confirm(`Delete ${novel.title}?`)) {
      return;
    }

    try {
      setLibraryFeedback({ message: '', error: '' });
      await deleteNovel(token, novel.id);
      setLibraryFeedback({ message: 'Novel deleted successfully.', error: '' });
      await loadLibrary();
    } catch (requestError) {
      setLibraryFeedback({ message: '', error: requestError.message });
    }
  }

  function startEditWriter(writer) {
    setEditingWriterId(writer.id);
    setWriterEditForm({ name: writer.name, bio: writer.bio });
    setWriterEditAvatar(null);
  }

  function cancelEditWriter() {
    setEditingWriterId(null);
    setWriterEditAvatar(null);
  }

  async function handleWriterEditSubmit(event, writerId) {
    event.preventDefault();
    setLibraryFeedback({ message: '', error: '' });

    const formData = new FormData();
    formData.append('name', writerEditForm.name);
    formData.append('bio', writerEditForm.bio);
    if (writerEditAvatar) {
      formData.append('avatar', writerEditAvatar);
    }

    try {
      await updateWriter(token, writerId, formData);
      setLibraryFeedback({ message: 'Writer updated successfully.', error: '' });
      setEditingWriterId(null);
      setWriterEditAvatar(null);
      await loadLibrary();
    } catch (requestError) {
      setLibraryFeedback({ message: '', error: requestError.message });
    }
  }

  function startEditNovel(novel) {
    setEditingNovelId(novel.id);
    setNovelEditForm({
      title: novel.title,
      summary: novel.summary,
      category: novel.category,
      subcategory: novel.subcategory || ''
    });
  }

  function cancelEditNovel() {
    setEditingNovelId(null);
  }

  async function handleNovelEditSubmit(event, novelId) {
    event.preventDefault();
    setLibraryFeedback({ message: '', error: '' });

    try {
      await updateNovel(token, novelId, novelEditForm);
      setLibraryFeedback({ message: 'Novel updated successfully.', error: '' });
      setEditingNovelId(null);
      await loadLibrary();
    } catch (requestError) {
      setLibraryFeedback({ message: '', error: requestError.message });
    }
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AppShell>
      <section className="page-section admin-layout">
        <button 
          className="secondary-button" 
          onClick={() => navigate('/admin')}
          style={{ 
            marginBottom: '1.5rem',
            width: 'fit-content',
            fontSize: '0.9rem',
            padding: '0.6rem 1rem',
            boxShadow: '0 4px 12px rgba(88, 63, 88, 0.12)',
            border: '1px solid rgba(88, 63, 88, 0.2)'
          }}
        >
          ← Back to Dashboard
        </button>
        <div className="section-heading admin-layout__heading">
          <div>
            <span className="eyebrow">Manage uploads</span>
            <h2>Review, update & delete content.</h2>
            <p>Delete anything you no longer want published, or add more episodes to an existing folder.</p>
          </div>
        </div>

        {loading ? <div className="state-card">Loading library...</div> : null}
        {loadError ? <div className="state-card state-card--error">{loadError}</div> : null}
        {libraryFeedback.message ? <div className="state-card state-card--success">{libraryFeedback.message}</div> : null}
        {libraryFeedback.error ? <div className="state-card state-card--error">{libraryFeedback.error}</div> : null}

        {!loading && (
          <>
            <div className="search-bar-container">
              <div className="search-input-wrap">
                <svg className="search-icon-svg" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by writer name or novel title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {(() => {
              const query = searchQuery.trim().toLowerCase();
              const nonDigestWriters = writers
                .map((writer) => {
                  const originalNovels = writer.novels || [];
                  const realNovels = originalNovels.filter((novel) => novel.category !== 'digest');
                  const wasDigestOnly = originalNovels.length > 0 && realNovels.length === 0;
                  return { ...writer, novels: realNovels, wasDigestOnly };
                })
                .filter((writer) => !writer.wasDigestOnly);
              const filteredWriters = query
                ? nonDigestWriters
                    .map((writer) => {
                      const writerMatches = writer.name.toLowerCase().includes(query);
                      const matchingNovels = (writer.novels || []).filter((novel) =>
                        novel.title.toLowerCase().includes(query)
                      );
                      if (!writerMatches && matchingNovels.length === 0) {
                        return null;
                      }
                      return {
                        ...writer,
                        novels: writerMatches ? writer.novels : matchingNovels
                      };
                    })
                    .filter(Boolean)
                : nonDigestWriters;

              if (filteredWriters.length === 0) {
                return <div className="state-card">No writers or novels match "{searchQuery}".</div>;
              }

              return (
                <div className="admin-library__grid">
                  {filteredWriters.map((writer) => (
              <article key={writer.id} className="admin-card admin-library-card">
                <div className="admin-library-card__head">
                  <div>
                    <span className="eyebrow">Writer</span>
                    <h3>{writer.name}</h3>
                    <p>{writer.bio}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => (editingWriterId === writer.id ? cancelEditWriter() : startEditWriter(writer))}
                    >
                      {editingWriterId === writer.id ? 'Cancel' : 'Edit writer'}
                    </button>
                    <button className="danger-button" type="button" onClick={() => handleDeleteWriter(writer)}>
                      Delete writer
                    </button>
                  </div>
                </div>

                {editingWriterId === writer.id && (
                  <form
                    onSubmit={(e) => handleWriterEditSubmit(e, writer.id)}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.9rem', borderRadius: '0.75rem', border: '1px solid rgba(88, 63, 88, 0.14)', background: 'var(--paper-soft)' }}
                  >
                    <label style={{ fontSize: '0.85rem' }}>
                      Writer name
                      <input
                        value={writerEditForm.name}
                        onChange={(e) => setWriterEditForm({ ...writerEditForm, name: e.target.value })}
                      />
                    </label>
                    <label style={{ fontSize: '0.85rem' }}>
                      Bio
                      <textarea
                        value={writerEditForm.bio}
                        onChange={(e) => setWriterEditForm({ ...writerEditForm, bio: e.target.value })}
                        rows="3"
                      />
                    </label>
                    <label style={{ fontSize: '0.85rem' }}>
                      Replace avatar (optional)
                      <input type="file" accept="image/*" onChange={(e) => setWriterEditAvatar(e.target.files?.[0] || null)} />
                    </label>
                    <button type="submit" className="primary-button" disabled={!writerEditForm.name.trim()} style={{ width: 'fit-content' }}>
                      Save changes
                    </button>
                  </form>
                )}

                <div className="admin-library-card__novels">
                  <div className="admin-library-card__subhead">
                    <strong>{writer.novels?.length || 0}</strong>
                    <span>novels</span>
                  </div>

                  {writer.novels?.length ? (
                    writer.novels.map((novel) => (
                      <div key={novel.id} className="admin-library-card__novel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span className="admin-library-card__meta">
                              {CATEGORY_LABEL_MAP[novel.category] || 'Category'}
                              {novel.subcategory ? ` / ${SUBCATEGORY_LABEL_MAP[novel.subcategory] || novel.subcategory}` : ''}
                            </span>
                            <h4>{novel.title}</h4>
                            <p>{novel.summary}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--plum-700)', margin: '0.25rem 0 0' }}>
                              ★ {(novel.averageRating || 0).toFixed(1)} ({novel.reviews?.length || 0} reviews)
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <button
                              className="secondary-button"
                              type="button"
                              style={{ minHeight: '2.1rem', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
                              onClick={() => (editingNovelId === novel.id ? cancelEditNovel() : startEditNovel(novel))}
                            >
                              {editingNovelId === novel.id ? 'Cancel' : 'Edit novel'}
                            </button>
                            <button
                              className="danger-button danger-button--ghost"
                              type="button"
                              onClick={() => handleDeleteNovel(novel)}
                            >
                              Delete novel
                            </button>
                          </div>
                        </div>

                        {editingNovelId === novel.id && (
                          <form
                            onSubmit={(e) => handleNovelEditSubmit(e, novel.id)}
                            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(88, 63, 88, 0.12)', background: 'var(--paper-soft)' }}
                          >
                            <label style={{ fontSize: '0.8rem' }}>
                              Title
                              <input
                                value={novelEditForm.title}
                                onChange={(e) => setNovelEditForm({ ...novelEditForm, title: e.target.value })}
                              />
                            </label>
                            <label style={{ fontSize: '0.8rem' }}>
                              Summary
                              <textarea
                                value={novelEditForm.summary}
                                onChange={(e) => setNovelEditForm({ ...novelEditForm, summary: e.target.value })}
                                rows="3"
                              />
                            </label>
                            <label style={{ fontSize: '0.8rem' }}>
                              Category
                              <select
                                value={novelEditForm.category}
                                onChange={(e) => {
                                  const nextCategory = e.target.value;
                                  setNovelEditForm((current) => ({
                                    ...current,
                                    category: nextCategory,
                                    subcategory: CATEGORY_WITHOUT_SUBCATEGORY.has(nextCategory) ? '' : current.subcategory || 'complete-novel'
                                  }));
                                }}
                              >
                                {CATEGORY_OPTIONS.map((category) => (
                                  <option key={category.key} value={category.key}>
                                    {category.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            {!CATEGORY_WITHOUT_SUBCATEGORY.has(novelEditForm.category) ? (
                              <label style={{ fontSize: '0.8rem' }}>
                                Subcategory
                                <select
                                  value={novelEditForm.subcategory}
                                  onChange={(e) => setNovelEditForm({ ...novelEditForm, subcategory: e.target.value })}
                                >
                                  {SUBCATEGORY_OPTIONS.map((subcategory) => (
                                    <option key={subcategory.key} value={subcategory.key}>
                                      {subcategory.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : null}
                            <button
                              type="submit"
                              className="primary-button"
                              disabled={!novelEditForm.title.trim()}
                              style={{ width: 'fit-content' }}
                            >
                              Save changes
                            </button>
                          </form>
                        )}

                        {novel.subcategory === 'episodic-novel' && (
                          <div style={{ marginTop: '0.5rem', padding: '0.75rem', border: '1px solid rgba(88, 63, 88, 0.12)', borderRadius: '0.5rem', background: 'var(--paper-soft)' }}>
                            <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Episodes:</strong>
                            {novel.episodes?.length > 0 ? (
                              <ul style={{ margin: '0 0 0.5rem 1rem', padding: 0, fontSize: '0.85rem' }}>
                                {novel.episodes.map((ep) => (
                                  <li key={ep.id} style={{ marginBottom: '0.25rem' }}>
                                    {ep.title} <span style={{ color: 'var(--plum-500)', fontSize: '0.75rem' }}>({ep.file})</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--plum-500)' }}>No episodes yet.</p>
                            )}

                            <button
                              type="button"
                              className="secondary-button"
                              style={{ minHeight: '2rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                              onClick={() => {
                                if (episodeUploadNovelId === novel.id) {
                                  setEpisodeUploadNovelId(null);
                                  setNewEpisodeTitle('');
                                  setNewEpisodePdf(null);
                                } else {
                                  setEpisodeUploadNovelId(novel.id);
                                }
                              }}
                            >
                              {episodeUploadNovelId === novel.id ? 'Cancel' : 'Add Episode'}
                            </button>

                            {episodeUploadNovelId === novel.id && (
                              <form
                                onSubmit={(e) => handleAddEpisodeSubmit(e, novel, writer.id)}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid rgba(88, 63, 88, 0.1)', paddingTop: '0.75rem' }}
                              >
                                <label style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  Episode Title (optional)
                                  <input
                                    type="text"
                                    placeholder={`Episode ${(novel.episodes?.length || 0) + 1}`}
                                    value={newEpisodeTitle}
                                    onChange={(e) => setNewEpisodeTitle(e.target.value)}
                                    style={{ padding: '0.4rem 0.6rem', borderRadius: '0.4rem', border: '1px solid rgba(88, 63, 88, 0.16)', background: 'white' }}
                                  />
                                </label>
                                <label style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  PDF File
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setNewEpisodePdf(e.target.files?.[0] || null)}
                                    required
                                    style={{ fontSize: '0.85rem' }}
                                  />
                                </label>
                                <button
                                  type="submit"
                                  className="primary-button"
                                  disabled={!newEpisodePdf}
                                  style={{ minHeight: '2rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', alignSelf: 'flex-start' }}
                                >
                                  Upload Episode
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="state-card">No novels uploaded yet.</div>
                  )}
                </div>
              </article>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </section>
    </AppShell>
  );
}

function AdminDigestPage() {
  const navigate = useNavigate();
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [digestForm, setDigestForm] = useState({ writerId: '', title: '', summary: '' });
  const [digestPdf, setDigestPdf] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState({ message: '', error: '' });
  const [listFeedback, setListFeedback] = useState({ message: '', error: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('kitab-era-admin-token');

  async function loadLibrary() {
    setLoading(true);
    try {
      const data = await getAdminLibrary(token);
      const items = data.writers || [];
      setWriters(items);
      setDigestForm((current) => ({ ...current, writerId: current.writerId || items[0]?.id || '' }));
    } catch (e) {
      console.error("Failed to load digest library:", e);
      if (e.status === 401) {
        localStorage.removeItem('kitab-era-admin-token');
        navigate('/admin/login', { replace: true });
        return;
      }
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    loadLibrary();
  }, [navigate, token]);

  async function handleDigestUpload(event) {
    event.preventDefault();
    setUploadFeedback({ message: '', error: '' });

    if (!digestForm.writerId) {
      setUploadFeedback({ message: '', error: 'Please select a writer.' });
      return;
    }

    if (!digestForm.title.trim()) {
      setUploadFeedback({ message: '', error: 'Title is required.' });
      return;
    }

    if (!digestPdf) {
      setUploadFeedback({ message: '', error: 'PDF file is required.' });
      return;
    }

    const formData = new FormData();
    formData.append('writerId', digestForm.writerId);
    formData.append('title', digestForm.title);
    formData.append('summary', digestForm.summary);
    formData.append('category', 'digest');
    formData.append('subcategory', '');
    formData.append('pdf', digestPdf);

    try {
      await createNovel(token, formData);
      setDigestForm((current) => ({ ...current, title: '', summary: '' }));
      setDigestPdf(null);
      setUploadFeedback({ message: 'Digest uploaded successfully.', error: '' });
      await loadLibrary();
    } catch (requestError) {
      setUploadFeedback({ message: '', error: requestError.message });
    }
  }

  async function handleDeleteDigest(novel) {
    if (!window.confirm(`Delete "${novel.title}" from Digest?`)) {
      return;
    }

    try {
      setListFeedback({ message: '', error: '' });
      await deleteNovel(token, novel.id);
      setListFeedback({ message: 'Digest item deleted successfully.', error: '' });
      await loadLibrary();
    } catch (requestError) {
      setListFeedback({ message: '', error: requestError.message });
    }
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const digestItems = writers
    .flatMap((writer) => (writer.novels || [])
      .filter((novel) => novel.category === 'digest')
      .map((novel) => ({ ...novel, writerName: writer.name })))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

  const query = searchQuery.trim().toLowerCase();
  const filteredDigestItems = query
    ? digestItems.filter((item) =>
        item.title.toLowerCase().includes(query) || (item.summary || '').toLowerCase().includes(query)
      )
    : digestItems;

  const groupedByMonth = filteredDigestItems.reduce((groups, item) => {
    const monthLabel = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthLabel]) {
      groups[monthLabel] = [];
    }
    groups[monthLabel].push(item);
    return groups;
  }, {});

  const monthGroups = Object.entries(groupedByMonth);

  return (
    <AppShell>
      <section className="page-section admin-layout">
        <button 
          className="secondary-button" 
          onClick={() => navigate('/admin')}
          style={{ 
            marginBottom: '1.5rem',
            width: 'fit-content',
            fontSize: '0.9rem',
            padding: '0.6rem 1rem',
            boxShadow: '0 4px 12px rgba(88, 63, 88, 0.12)',
            border: '1px solid rgba(88, 63, 88, 0.2)'
          }}
        >
          ← Back to Dashboard
        </button>
        <div className="section-heading admin-layout__heading">
          <div>
            <span className="eyebrow">Digest</span>
            <h2>Upload & manage Digest files.</h2>
            <p>Digest uploads live here, separate from the main library, so the rest of Manage Uploads stays uncluttered.</p>
          </div>
        </div>

        <form className="admin-card" onSubmit={handleDigestUpload} style={{ marginBottom: '2rem' }}>
          <h3>Upload Digest</h3>
          <label>
            Writer
            <select
              value={String(digestForm.writerId ?? '')}
              onChange={(event) => setDigestForm({ ...digestForm, writerId: event.target.value })}
            >
              {writers.map((writer) => (
                <option key={writer.id} value={String(writer.id)}>
                  {writer.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input value={digestForm.title} onChange={(event) => setDigestForm({ ...digestForm, title: event.target.value })} />
          </label>
          <label>
            Summary
            <textarea value={digestForm.summary} onChange={(event) => setDigestForm({ ...digestForm, summary: event.target.value })} rows="3" />
          </label>
          <label>
            PDF file
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => setDigestPdf(event.target.files?.[0] || null)}
              required
            />
            {digestPdf && <small style={{ color: 'var(--plum-700)' }}>✓ {digestPdf.name}</small>}
          </label>
          <button className="primary-button" disabled={!digestPdf || !digestForm.title.trim()} style={{ width: 'fit-content' }}>
            Upload Digest
          </button>
          {uploadFeedback.message ? <div className="state-card state-card--success">{uploadFeedback.message}</div> : null}
          {uploadFeedback.error ? <div className="state-card state-card--error">{uploadFeedback.error}</div> : null}
        </form>

        {loading ? <div className="state-card">Loading digest...</div> : null}
        {loadError ? <div className="state-card state-card--error">{loadError}</div> : null}
        {listFeedback.message ? <div className="state-card state-card--success">{listFeedback.message}</div> : null}
        {listFeedback.error ? <div className="state-card state-card--error">{listFeedback.error}</div> : null}

        {!loading && (
          <>
            <div className="search-bar-container">
              <div className="search-input-wrap">
                <svg className="search-icon-svg" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search digest by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button type="button" className="search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {monthGroups.length === 0 ? (
              <div className="state-card">
                {query ? `No digest items match "${searchQuery}".` : 'No digest files uploaded yet.'}
              </div>
            ) : (
              monthGroups.map(([monthLabel, items]) => (
                <div key={monthLabel} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--plum-900)', marginBottom: '0.85rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(88, 63, 88, 0.16)' }}>
                    {monthLabel}
                  </h3>
                  <div className="admin-library__grid">
                    {items.map((item) => (
                      <article key={item.id} className="admin-card admin-library-card">
                        <div className="admin-library-card__head">
                          <div>
                            <span className="admin-library-card__meta">By {item.writerName}</span>
                            <h3>{item.title}</h3>
                            <p>{item.summary}</p>
                          </div>
                          <button className="danger-button" type="button" onClick={() => handleDeleteDigest(item)}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </section>
    </AppShell>
  );
}

function ScrollAnimationObserver() {
  const location = useLocation();

  useEffect(() => {
    // Reset animation state when path changes
    document.querySelectorAll('[data-animated]').forEach(el => {
      el.removeAttribute('data-animated');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            if (target.dataset.animated) return;
            target.dataset.animated = 'true';

            const parent = target.parentElement;
            const isGridItem = parent?.classList.contains('team-grid') ||
                              parent?.classList.contains('writer-grid') ||
                              parent?.classList.contains('category-grid') ||
                              parent?.classList.contains('library-grid') ||
                              parent?.classList.contains('contact-cards-grid') ||
                              parent?.classList.contains('novel-highlight-grid');

            requestAnimationFrame(() => {
              if (isGridItem) {
                const siblings = Array.from(parent.querySelectorAll('.animate-on-scroll'));
                const idx = siblings.indexOf(target);
                target.style.animationDelay = `${idx * 0.1}s`;
                target.classList.add(idx % 2 === 0 ? 'animate-on-scroll--left' : 'animate-on-scroll--right');
              } else {
                target.classList.add('animate-on-scroll--up');
              }
            });
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll([
        '.team-card',
        '.writer-card',
        '.category-card',
        '.library-card',
        '.contact-card',
        '.novel-highlight-card',
        '.admin-card',
        '.reader-panel',
        '.novel-list',
        '.state-card',
        '.writer-hero',
        '.section-heading',
        '.search-bar',
        '.contact-note',
        '.services-hero__card',
        '.services-hero__visual',
        '.services-card',
        '.services-why__card',
        '.admin-auth',
        '.admin-library-card'
      ].join(','));

      elements.forEach((el) => {
        if (!el.classList.contains('animate-on-scroll')) {
          el.classList.add('animate-on-scroll');
          observer.observe(el);
        }
      });
    };

    setTimeout(observeElements, 150);

    return () => {
      observer.disconnect();
    };
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollAnimationObserver />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about-us" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/popular-novels" element={<PopularNovelsPage />} />
        <Route path="/digest" element={<DigestPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/:category" element={<ExplorePage />} />
        <Route path="/explore/:category/:subcategory" element={<ExplorePage />} />
        <Route path="/novel/:id" element={<NovelPage />} />
        <Route path="/writer/:slug" element={<WriterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/manage" element={<AdminManagePage />} />
        <Route path="/admin/digest" element={<AdminDigestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
