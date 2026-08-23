
import { getConfirmations } from "@/actions/confirmations.actions";
import { ConfirmationsList } from "@/components/confirmations/ConfirmationsList";

export default async function ConfirmationsPage() {
  const confirmations = await getConfirmations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">Tasdiqnomalar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mijoz sahifasidan yangi shartnoma-tasdiqnoma yuborishingiz mumkin
        </p>
      </div>
      <ConfirmationsList confirmations={confirmations as never} />
    </div>
  );
}
