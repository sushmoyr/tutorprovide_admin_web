import { useTranslations } from "next-intl";

function BrandPanel() {
  const t = useTranslations("auth");

  return (
    <div className="relative hidden overflow-hidden lg:block">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-gradient-from via-brand-primary to-brand-secondary" />

      {/* Decorative circles */}
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-foreground/10" />
      <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-primary-foreground/10" />
      <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-primary-foreground/5" />

      {/* Content */}
      <div className="relative flex h-full flex-col items-start justify-center gap-6 p-12 xl:p-16">
        <h2 className="text-4xl font-bold leading-tight tracking-tight text-primary-foreground xl:text-5xl">
          Tutorprovide.
        </h2>
        <p className="max-w-sm text-lg text-primary-foreground/70">
          {t("brandTagline")}
        </p>
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form area */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-[420px]">{children}</div>
      </div>

      {/* Right: brand panel */}
      <BrandPanel />
    </div>
  );
}
