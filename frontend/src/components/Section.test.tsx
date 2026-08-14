import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from './Section.tsx';
import { Settings } from 'lucide-react';

describe('Section', () => {
  it('renders the title, icon and children', () => {
    const { container } = render(
      <Section id="profile" icon={Settings} title="Profile">
        <p>Content here</p>
      </Section>
    );
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Content here')).toBeInTheDocument();
    expect(container.querySelector('#profile')).not.toBeNull();
  });

  it('applies the danger styling', () => {
    render(
      <Section id="danger" icon={Settings} title="Danger Zone" danger>
        <p>Careful</p>
      </Section>
    );
    expect(screen.getByText('Careful')).toBeInTheDocument();
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });

  it('renders children without a wrapper container when container=false', () => {
    render(
      <Section id="x" icon={Settings} title="Plain" container={false}>
        <p>Direct</p>
      </Section>
    );
    expect(screen.getByText('Direct')).toBeInTheDocument();
  });
});
