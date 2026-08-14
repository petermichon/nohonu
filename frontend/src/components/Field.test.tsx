import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Field } from './Field.tsx';
import { Input } from './Input.tsx';

describe('Field', () => {
  it('renders the label', () => {
    render(
      <Field label="Site name">
        <Input />
      </Field>
    );
    expect(screen.getByText('Site name')).toBeInTheDocument();
  });

  it('associates the label with the input via htmlFor', () => {
    render(
      <Field label="Site name" htmlFor="site-name">
        <Input id="site-name" />
      </Field>
    );
    expect(screen.getByLabelText('Site name')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <Field label="Domain">
        <Input placeholder="example.com" />
      </Field>
    );
    expect(screen.getByPlaceholderText('example.com')).toBeInTheDocument();
  });
});
