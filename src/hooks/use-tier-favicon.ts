import { useEffect } from 'react';

type UserRole = 'student' | 'teacher' | 'developer' | null;
type Tier = 'basic' | 'silver' | 'gold' | 'ruby';

export const useTierFavicon = (tier: Tier, role?: UserRole) => {
  useEffect(() => {
    const getFaviconBasePath = () => {
      // Role-based favicons take priority over tier-based
      if (role === 'developer') {
        return '/favicon-developer';
      }
      if (role === 'teacher') {
        return '/favicon-teacher';
      }
      
      // For students, use tier-based favicons
      switch (tier) {
        case 'ruby':
          return '/favicon-ruby';
        case 'gold':
          return '/favicon-gold';
        case 'silver':
          return '/favicon-silver';
        default:
          return '/favicon';
      }
    };

    const basePath = getFaviconBasePath();

    // Remove existing icon links
    const existingLinks = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");
    existingLinks.forEach(link => link.remove());

    // Create favicon links with properly sized versions for crisp display
    // Use the 32x32 version for best clarity in browser tabs
    const link32 = document.createElement('link');
    link32.rel = 'icon';
    link32.type = 'image/png';
    link32.href = `${basePath}-32.png`;
    link32.setAttribute('sizes', '32x32');
    document.head.appendChild(link32);

    // Also add 64x64 for high-DPI displays
    const link64 = document.createElement('link');
    link64.rel = 'icon';
    link64.type = 'image/png';
    link64.href = `${basePath}-64.png`;
    link64.setAttribute('sizes', '64x64');
    document.head.appendChild(link64);

    // Add the full-size for larger contexts
    const linkFull = document.createElement('link');
    linkFull.rel = 'icon';
    linkFull.type = 'image/png';
    linkFull.href = `${basePath}.png`;
    linkFull.setAttribute('sizes', '128x128');
    document.head.appendChild(linkFull);

    // Also update apple-touch-icon with full size
    let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (appleLink) {
      appleLink.href = `${basePath}.png`;
      appleLink.setAttribute('sizes', '180x180');
    } else {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = `${basePath}.png`;
      appleLink.setAttribute('sizes', '180x180');
      document.head.appendChild(appleLink);
    }
  }, [tier, role]);
};
