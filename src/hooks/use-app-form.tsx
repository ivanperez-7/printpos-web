import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Key } from 'react';

const { fieldContext, formContext, useFormContext, useFieldContext } = createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { InputField, NumberSelectField },
  formComponents: { SaveButton },
});

function InputField({ label }: { label: string }) {
  const field = useFieldContext<string>();
  return (
    <Field className='space-y-1'>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

function NumberSelectField({
  label,
  placeholder,
  options,
  onValueChange,
}: {
  label: string;
  placeholder: string;
  options: { key: Key; value: number; label: string }[];
  onValueChange?: (v: string) => void;
}) {
  const field = useFieldContext<number>();
  return (
    <Field className='space-y-1'>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Select
        value={String(field.state.value ?? '')}
        onValueChange={(v) => {
          field.handleChange(Number(v));
          if (onValueChange) onValueChange(v);
        }}
      >
        <SelectTrigger id={field.name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.length > 0 ?
            options.map((opt) => (
              <SelectItem key={opt.key} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))
          : <SelectItem value='0'>No hay opciones</SelectItem>}
        </SelectContent>
      </Select>
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

function SaveButton() {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type='submit' disabled={isSubmitting} className='w-full md:w-auto'>
          {isSubmitting && <Spinner />} Guardar
        </Button>
      )}
    </form.Subscribe>
  );
}
