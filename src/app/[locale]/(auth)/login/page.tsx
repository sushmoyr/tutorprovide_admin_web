import { LoginForm } from "@/components/auth/login-form";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth");

  return (
    <div className="flex flex-col gap-8">
      {/* Logo & heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("loginTitle")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("loginSubtitle")}</p>
      </div>

      {/* Form */}
      <LoginForm />
    </div>
  );
}
