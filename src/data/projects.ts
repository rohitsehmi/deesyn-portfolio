/**
 * The eight older projects, in the order the homepage shows them.
 *
 * They are not in `studies.ts` on purpose. That list is the case studies: it
 * feeds the partner hero count and the next-study rotation. These pages are
 * the earlier work, written shorter.
 *
 * The words live in src/copy/projects.json. This file only decides the order
 * and which picture a figure key points at.
 */
import copy from '../copy/projects.json';
import appsFurther from '../assets/project-apps-further.jpg';
import appsMapLight from '../assets/project-apps-map-light.jpg';
import appsMapDark from '../assets/project-apps-map-dark.jpg';
import appsListLight from '../assets/project-apps-list-light.jpg';
import appsListDark from '../assets/project-apps-list-dark.jpg';
import appsScreens from '../assets/project-apps-screens.png';
import appsBuild from '../assets/project-apps-build.jpg';
import appsStore1 from '../assets/project-apps-store-1.jpg';
import appsStore2 from '../assets/project-apps-store-2.jpg';
import rebrandCover from '../assets/work-rebrand.png';
import rebrandDevices from '../assets/project-rebrand-devices.jpg';
import rebrandMix1 from '../assets/project-rebrand-mix-1.jpg';
import rebrandMix2 from '../assets/project-rebrand-mix-2.jpg';
import rebrandMix3 from '../assets/project-rebrand-mix-3.jpg';
import rebrandIcons from '../assets/project-rebrand-icons.jpg';
import rebrandIcon from '../assets/project-rebrand-icon.png';
import rebrandLocal from '../assets/project-rebrand-local.jpg';
import rebrandColour from '../assets/project-rebrand-colour.jpg';
import rebrandAccessible from '../assets/project-rebrand-accessible.jpg';
import rebrandType from '../assets/project-rebrand-type.png';
import rebrandAndroid from '../assets/project-rebrand-android.jpg';
import rebrandPhoto from '../assets/project-rebrand-photo.jpg';
import rebrandMerch from '../assets/project-rebrand-merch.jpg';
import keyCover from '../assets/work-mobile-key.png';
import keyFlow from '../assets/project-key-flow.png';
import keyLaptop from '../assets/project-key-laptop.jpg';
import keyPoster from '../assets/project-key-phone.jpg';
import watchTrio from '../assets/project-watch-trio.jpg';
import watch from '../assets/project-watch.png';
import appletv from '../assets/project-appletv.jpg';
import casinoPhones from '../assets/project-casino-phones.jpg';
import casinoIpad from '../assets/project-casino-ipad.jpg';
import casino from '../assets/project-casino.jpg';
import arcade from '../assets/project-arcade.jpg';
import arcadeBonus from '../assets/project-arcade-bonus.jpg';
import arcadePhones from '../assets/project-arcade-phones.jpg';
import pokerIphone from '../assets/project-poker-iphone.jpg';
import pokerAndroid from '../assets/project-poker-android.jpg';
import sportsbookIos from '../assets/project-sportsbook-1.jpg';
import sportsbookWeb from '../assets/project-sportsbook-2.jpg';
import sportsbookThree from '../assets/project-sportsbook-3.jpg';
import grabbdHand1 from '../assets/project-grabbd-hand-1.jpg';
import grabbdHand2 from '../assets/project-grabbd-hand-2.jpg';
import grabbdBrand from '../assets/project-grabbd-brand.jpg';
import grabbdLogos from '../assets/project-grabbd-logos.jpg';
import grabbdWatch from '../assets/project-grabbd-watch.jpg';
import grabbdApp from '../assets/project-grabbd-concepts.jpg';
import grabbdPhones from '../assets/project-grabbd-phones.jpg';
import grabbdSite from '../assets/project-grabbd-landing.jpg';
import tvFilm from '../assets/work-tv.jpg';
import tvViaplay from '../assets/project-tv-22.jpg';
import tvViagame from '../assets/project-tv-11.jpg';
import tvGuide from '../assets/project-tv-guide.jpg';
import tvNote from '../assets/project-tv-note.jpg';
import tvPlayback from '../assets/project-tv-playback.jpg';

export const projectOrder = [
  'hotels-apps',
  'rebrand',
  'mobile-key',
  'wearables',
  'betfair-games',
  'betfair-sportsbook',
  'grabbd',
  'tv'
] as const;

export type ProjectSlug = (typeof projectOrder)[number];

export const projectImages: Record<string, ImageMetadata> = {
  'apps-further': appsFurther,
  'apps-map-light': appsMapLight,
  'apps-map-dark': appsMapDark,
  'apps-list-light': appsListLight,
  'apps-list-dark': appsListDark,
  'apps-screens': appsScreens,
  'apps-build': appsBuild,
  'apps-store-1': appsStore1,
  'apps-store-2': appsStore2,
  'rebrand-cover': rebrandCover,
  'rebrand-devices': rebrandDevices,
  'rebrand-mix-1': rebrandMix1,
  'rebrand-mix-2': rebrandMix2,
  'rebrand-mix-3': rebrandMix3,
  'rebrand-icons': rebrandIcons,
  'rebrand-icon': rebrandIcon,
  'rebrand-local': rebrandLocal,
  'rebrand-colour': rebrandColour,
  'rebrand-accessible': rebrandAccessible,
  'rebrand-type': rebrandType,
  'rebrand-android': rebrandAndroid,
  'rebrand-photo': rebrandPhoto,
  'rebrand-merch': rebrandMerch,
  'key-cover': keyCover,
  'key-flow': keyFlow,
  'key-laptop': keyLaptop,
  'key-poster': keyPoster,
  'watch-trio': watchTrio,
  watch,
  appletv,
  'casino-phones': casinoPhones,
  'casino-ipad': casinoIpad,
  casino,
  arcade,
  'arcade-bonus': arcadeBonus,
  'arcade-phones': arcadePhones,
  'poker-iphone': pokerIphone,
  'poker-android': pokerAndroid,
  'sportsbook-ios': sportsbookIos,
  'sportsbook-web': sportsbookWeb,
  'sportsbook-3': sportsbookThree,
  'grabbd-hand-1': grabbdHand1,
  'grabbd-hand-2': grabbdHand2,
  'grabbd-brand': grabbdBrand,
  'grabbd-logos': grabbdLogos,
  'grabbd-watch': grabbdWatch,
  'grabbd-app': grabbdApp,
  'grabbd-phones': grabbdPhones,
  'grabbd-site': grabbdSite,
  'tv-film': tvFilm,
  'tv-viaplay': tvViaplay,
  'tv-viagame': tvViagame,
  'tv-guide': tvGuide,
  'tv-note': tvNote,
  'tv-playback': tvPlayback
};

export function projectCopy(slug: ProjectSlug) {
  return copy[slug];
}

export const projectPath = (slug: string) => `/work/${slug}`;

/*
  The same photograph, with the flat studio ground taken out. Dark mode shows
  this so a white sweep does not sit in the middle of a navy page. The screen
  is not redrawn. Diagrams whose white is the paper are absent on purpose:
  taking that white out eats the artwork. See design/build-dark-plates.py.
*/
const plateModules = import.meta.glob<ImageMetadata>('../assets/dark-*.webp', {
  eager: true,
  import: 'default'
});

const plate = (file: string): ImageMetadata => {
  const found = plateModules[`../assets/${file}`];
  if (!found) throw new Error(`projects: no dark plate ${file}`);
  return found;
};

/** Homepage archive slug to its dark plate, when the cover has a studio ground. */
export const archivePlates: Partial<Record<string, ImageMetadata>> = {
  'betfair-sportsbook': plate('dark-work-betfair-sportsbook.webp'),
  grabbd: plate('dark-work-grabbd.webp'),
  tv: plate('dark-work-tv.webp')
};

const PLATE_FOR_FIGURE: Record<string, string> = {
  'apps-further': 'dark-project-apps-further.webp',
  'apps-store-1': 'dark-project-apps-store-1.webp',
  'apps-store-2': 'dark-project-apps-store-2.webp',
  'rebrand-devices': 'dark-project-rebrand-devices.webp',
  'key-flow': 'dark-project-key-flow.webp',
  watch: 'dark-project-watch.webp',
  'casino-phones': 'dark-project-casino-phones.webp',
  'casino-ipad': 'dark-project-casino-ipad.webp',
  casino: 'dark-project-casino.webp',
  arcade: 'dark-project-arcade.webp',
  'arcade-bonus': 'dark-project-arcade-bonus.webp',
  'arcade-phones': 'dark-project-arcade-phones.webp',
  'poker-iphone': 'dark-project-poker-iphone.webp',
  'poker-android': 'dark-project-poker-android.webp',
  'sportsbook-ios': 'dark-project-sportsbook-1.webp',
  'sportsbook-web': 'dark-project-sportsbook-2.webp',
  'sportsbook-3': 'dark-project-sportsbook-3.webp',
  'grabbd-app': 'dark-project-grabbd-concepts.webp',
  'tv-film': 'dark-work-tv.webp',
  'tv-viaplay': 'dark-project-tv-22.webp',
  'tv-viagame': 'dark-project-tv-11.webp',
  'tv-guide': 'dark-project-tv-guide.webp',
  'tv-note': 'dark-project-tv-note.webp',
  'tv-playback': 'dark-project-tv-playback.webp'
};

export const projectPlate = (key: string): ImageMetadata | undefined => {
  const file = PLATE_FOR_FIGURE[key];
  return file ? plate(file) : undefined;
};
