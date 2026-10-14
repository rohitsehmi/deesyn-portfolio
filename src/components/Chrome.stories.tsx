import type { Meta, StoryObj } from '@storybook/react-vite';
import { Nav } from './Nav';
import { Footer } from './Footer';
import { Button } from './Button';
import { Link } from './Link';
import { heldFooterLinks } from '../data/nav';

const meta = { title: 'Chrome/Nav and Footer' } satisfies Meta;
export default meta;
type S = StoryObj;

const links = [{ label: 'Work', href: '#', current: true }, { label: 'About', href: '#' }];

/** top is transparent and inherits the band beneath it; scrolled takes the canvas. */
export const NavStates: S = {
  render: () => (
    <div style={{ display: 'grid', gap: 40 }}>
      <Nav state="top" links={links} actions={<Button variant="secondary" size="sm">Get in touch</Button>} />
      <Nav state="scrolled" links={links} actions={<Button variant="secondary" size="sm">Get in touch</Button>} />
    </div>
  )
};

/** Transparent by design — the band owns the surface. */
export const FooterFull: S = {
  render: () => (
    <Footer
      columns={
        <>
          <div style={{ display: 'grid', gap: 8 }}><Link href="#">Work</Link><Link href="#">About</Link></div>
          <div style={{ display: 'grid', gap: 8 }}><Link href="#">LinkedIn</Link><Link href="#">CV</Link></div>
        </>
      }
    />
  )
};
export const FooterCompact: S = { render: () => <Footer scale="compact" /> };

/**
 * On the page the footer link points at, it offers the work instead of itself.
 *
 * The live footer renders no links. This story passes the held pair so the
 * swap still has a picture: putting them back is moving an entry into
 * `footerLinks`, and this is the behaviour that move turns on.
 */
export const FooterOnItsOwnPage: S = {
  render: () => (
    <Footer scale="compact" links={heldFooterLinks} currentPath="/how-this-was-built/" />
  )
};
