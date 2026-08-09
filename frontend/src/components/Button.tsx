import { forwardRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from 'react';

interface ButtonOwnProps<E extends ElementType> {
  as?: E;
  className?: string;
  children?: ReactNode;
}

export type ButtonProps<E extends ElementType = 'button'> = ButtonOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps<E>>;

const baseClass =
  'px-4 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-700 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 font-medium rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-auto';

export const Button = forwardRef<HTMLElement, ButtonProps<'button'>>(function Button(
  { as: Tag = 'button', className, children, ...props },
  ref
) {
  return (
    <Tag ref={ref as never} className={`${baseClass} ${className ?? ''}`} {...props}>
      {children}
    </Tag>
  );
}) as <E extends ElementType = 'button'>(props: ButtonProps<E> & { ref?: never }) => ReactNode;
