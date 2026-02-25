import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { AppProviders } from "@/components/providers/app-providers";

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AppProviders>
        {children}
        <Toaster />
      </AppProviders>
    </NextIntlClientProvider>
  );
}
