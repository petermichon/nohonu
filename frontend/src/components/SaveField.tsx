import type { ReactNode } from 'react';
import { Field } from './Field.tsx';
import { Input } from './Input.tsx';
import { Button } from './Button.tsx';

interface SaveFieldProps {
  label: string;
  htmlFor: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  hint?: ReactNode;
  action?: ReactNode;
  onSave?: () => void;
  saveDisabled?: boolean;
  buttonContent?: ReactNode;
}

export function SaveField({
  label,
  htmlFor,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  hint,
  action,
  onSave,
  saveDisabled,
  buttonContent,
}: SaveFieldProps) {
  return (
    <Field label={label} htmlFor={htmlFor}>
      <div className="flex gap-2">
        <Input
          type={type}
          id={htmlFor}
          name={htmlFor}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1"
        />
        {action ?? (
          <Button type="button" onClick={onSave} disabled={saveDisabled}>
            {buttonContent ?? 'Save'}
          </Button>
        )}
      </div>
      {hint}
    </Field>
  );
}
