import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeading } from './SectionHeading';
import { Prose } from './Prose';

// Default args cover the required `children`, so the stories below can supply
// everything through `render` without each one having to restate it.
const meta = {
  title: 'Content/SectionHeading',
  component: SectionHeading,
  args: { children: 'Section heading' }
} satisfies Meta<typeof SectionHeading>;
export default meta;
type S = StoryObj<typeof meta>;

/** Heading and standfirst stack. The split-header pattern is not offered. */
export const WithStandfirst: S = {
  args: {
    children: 'The problem',
    standfirst: 'Applicants were abandoning at the point where we asked for proof of address, and we had been reading that as a form length problem for two years.'
  }
};

export const HeadingOnly: S = { args: { children: 'What shipped' } };

/** Level 3 for a subsection inside a long process section. */
export const Subsection: S = {
  render: () => (
    <>
      <SectionHeading level={3} children="Why the first structure failed" />
      <Prose>
        <p>
          The first structure grouped fields by the legal entity that required
          them, which matched how the risk team thought and matched nothing
          about how an applicant reads a form.
        </p>
      </Prose>
    </>
  )
};
