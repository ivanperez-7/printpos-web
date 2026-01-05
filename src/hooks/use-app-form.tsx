import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

const { fieldContext, formContext, useFormContext, useFieldContext } = createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { InputField },
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
