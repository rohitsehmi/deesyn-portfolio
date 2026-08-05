import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import './ButtonGlow.stories.css';

/**
 * EXPERIMENT — not shipped. A rotating conic-gradient border, the `@property`
 * technique, applied to the one button the site actually wants pressed.
 *
 * Two versions, because the technique is not the question. Where it runs is.
 *
 * The motion spec on Figma page "Foundations — Revolut" opens with "Frequency
 * decides before taste does", and its gate reads:
 *
 *     100+/day    none
 *     tens/day    minimal
 *     occasional  standard
 *     rare        delight
 *
 * A fixed nav is on every page of every visit — the highest-frequency surface
 * on the site. Something that loops there is in the corner of the reader's eye
 * for the entire time they are reading a case study, and the gate says `none`.
 *
 * Hovering Contact is the other end of that table. It happens once, if at all,
 * at the moment someone decides to get in touch. `rare` earns `delight`.
 *
 * Two rules it still bends, worth being honest about rather than pretending:
 * "animate transform and opacity only" — this animates an angle that drives a
 * background, so it repaints rather than composites; and "no box-shadow in site
 * chrome", which is why the glow here is a border rather than a bloom.
 */
const meta = {
  title: 'Experiments/Button glow',
  component: Button,
  args: { children: 'Contact' },
  // Out of Chromatic. These loop forever and one of them only exists on hover,
  // so they would either flake the diff or snapshot a state nobody sees. They
  // are here to be looked at and decided on, not to be regression-tested.
  parameters: { layout: 'centered', chromatic: { disableSnapshot: true } }
} satisfies Meta<typeof Button>;
export default meta;
type S = StoryObj<typeof meta>;

const Stage = ({ label, note, children }: { label: string; note: string; children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 'var(--primitive-space-sp400)', justifyItems: 'start', padding: 'var(--primitive-layout-l48)' }}>
    <p style={{ margin: 0, font: 'var(--type-emphasis-2)', color: 'var(--semantic-fg-primary)' }}>{label}</p>
    <p style={{ margin: 0, maxWidth: '46ch', font: 'var(--type-body-3)', color: 'var(--semantic-fg-secondary)' }}>{note}</p>
    <div style={{ paddingTop: 'var(--primitive-space-sp600)' }}>{children}</div>
  </div>
);

/** What the reel does: the angle animates forever, whether anyone is there or not. */
export const AlwaysOn: S = {
  render: () => (
    <Stage
      label="Always on"
      note="The version from the reel. Runs on every page, forever, next to whatever the reader is trying to read. The frequency gate rates a fixed nav at 100+/day, and 100+/day is none."
    >
      <span className="glow" data-mode="loop">
        <Button variant="primary" size="sm" href="#">Contact</Button>
      </span>
    </Stage>
  )
};

/** The same effect, spent where it is earned. */
export const OnHover: S = {
  render: () => (
    <Stage
      label="On hover — recommended"
      note="Identical treatment, triggered by intent instead of by a clock. Idle it costs nothing and adds no motion to a page someone is reading; on hover it is the most alive thing on the site. Hover me."
    >
      <span className="glow" data-mode="hover">
        <Button variant="primary" size="sm" href="#">Contact</Button>
      </span>
    </Stage>
  )
};

/** Side by side, plus the untreated control. */
export const Compare: S = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--primitive-layout-l64)', alignItems: 'center', padding: 'var(--primitive-layout-l48)' }}>
      <Button variant="primary" size="sm" href="#">Contact</Button>
      <span className="glow" data-mode="hover"><Button variant="primary" size="sm" href="#">Contact</Button></span>
      <span className="glow" data-mode="loop"><Button variant="primary" size="sm" href="#">Contact</Button></span>
    </div>
  )
};