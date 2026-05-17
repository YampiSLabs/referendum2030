import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { issueToken } from "../../lib/api";

const tokenSchema = z.object({
  token: z.string().min(8, "Introdueix o genera un token demo."),
});

type TokenFormValues = z.infer<typeof tokenSchema>;

interface TokenFormProps {
  referendumSlug: string;
  onTokenReady: (token: string) => void;
}

export default function TokenForm({ referendumSlug, onTokenReady }: TokenFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TokenFormValues>({
    resolver: zodResolver(tokenSchema),
    defaultValues: { token: "" },
  });

  async function generateToken() {
    const response = await issueToken(referendumSlug);
    setValue("token", response.token, { shouldValidate: true });
    onTokenReady(response.token);
  }

  function submit(values: TokenFormValues) {
    onTokenReady(values.token);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <div className="field">
        <label htmlFor="token" className="font-bold">
          Token demo
        </label>
        <input
          id="token"
          type="text"
          autoComplete="off"
          aria-describedby={errors.token ? "token-error" : undefined}
          {...register("token")}
        />
        {errors.token ? (
          <p id="token-error" className="error">
            {errors.token.message}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="btn" type="button" onClick={generateToken}>
          <KeyRound size={18} aria-hidden="true" />
          Generar token demo
        </button>
        <button className="btn btn-secondary" type="submit" disabled={isSubmitting}>
          Utilitzar token
        </button>
      </div>
    </form>
  );
}

