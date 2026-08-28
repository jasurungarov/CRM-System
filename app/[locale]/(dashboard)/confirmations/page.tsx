import { getTranslations } from "next-intl/server";
import { getConfirmations } from "@/actions/confirmations.actions";
import { ConfirmationsList } from "@/components/confirmations/ConfirmationsList";

export default async function ConfirmationsPage() {
  const t = await getTranslations("confirmations");
  const confirmations = await getConfirmations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>
      <ConfirmationsList confirmations={confirmations as never} />
    </div>
  );
}