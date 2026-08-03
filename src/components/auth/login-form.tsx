"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Briefcase } from "lucide-react";
import { loginAction, loginAsGuest } from "@/server/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { startTopLoader } from "@/components/top-loader";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/feed";
  const [serverError, setServerError] = useState<string | null>(null);
  const [guestRole, setGuestRole] = useState<"seeker" | "employer" | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const res = await loginAction(values);
    if (res.error) {
      setServerError(res.error);
      return;
    }
    startTopLoader();
    router.replace(callbackUrl);
  }

  async function onDemo(role: "seeker" | "employer") {
    setServerError(null);
    setGuestRole(role);
    const res = await loginAsGuest(role);
    if (res.error) {
      setServerError(res.error);
      setGuestRole(null);
      return;
    }
    startTopLoader();
    router.replace(role === "employer" ? "/jobs" : "/feed");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Log in to continue to TalentForge.</p>

      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Try it instantly — no signup
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onDemo("seeker")}
          disabled={guestRole !== null}
        >
          {guestRole === "seeker" ? <Loader2 className="animate-spin" /> : <Sparkles />}
          As job seeker
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onDemo("employer")}
          disabled={guestRole !== null}
        >
          {guestRole === "employer" ? <Loader2 className="animate-spin" /> : <Briefcase />}
          As employer
        </Button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or log in <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to TalentForge?{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
