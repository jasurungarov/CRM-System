import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { ClientFormModal } from "./ClientFormModal";
import { ReassignButton } from "./ReassignButton";

type ClientRow = {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  pin: string;
  tariffId: string;
  profileCompletionPercent: number;
  universities: Array<{ submissionStatus: string }>;
  assignedToUser: { id: string; name: string } | null;
  tariff: { name: string; price: number } | null;
};

export function ClientList({
  clients,
  canManage,
  currentUserId,
  tariffs,
  consultants,
}: {
  clients: ClientRow[];
  canManage: boolean;
  currentUserId: string;
  tariffs: Array<{ _id: string; name: string; price: number }>;
  consultants: Array<{ id: string; name: string }>;
}) {
  if (clients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Hozircha mijozlar yo&apos;q
      </div>
    );
  }

  return (
    <>
      {/* Mobil/planshet: kartochkalar ro'yxati */}
      <div className="space-y-3 lg:hidden">
        {clients.map((c) => (
          <div key={c._id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/clients/${c._id}`} className="font-medium hover:underline">
                  {c.fullName}
                </Link>
                <p className="text-sm text-muted-foreground">{c.phone}</p>
              </div>
              <Badge variant="outline" className="shrink-0 font-mono">
                {c.pin}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{c.tariff?.name ?? "—"}</span>
              <span>•</span>
              <span>{c.assignedToUser?.name ?? "—"}</span>
              <span>•</span>
              <span>{c.profileCompletionPercent}% to&apos;liq</span>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <ClientFormModal
                tariffs={tariffs}
                consultants={consultants}
                canAssign={canManage}
                currentUserId={currentUserId}
                client={{
                  _id: c._id,
                  fullName: c.fullName,
                  phone: c.phone,
                  email: c.email,
                  tariffId: c.tariffId,
                  assignedTo: c.assignedToUser?.id ?? "",
                }}
              />
              {canManage && <ReassignButton clientId={c._id} consultants={consultants} />}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: jadval */}
      <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">F.I.SH</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">PIN</th>
              <th className="px-4 py-3 font-medium">Tarif</th>
              <th className="px-4 py-3 font-medium">Konsultant</th>
              <th className="px-4 py-3 font-medium">Profil</th>
              <th className="px-4 py-3 font-medium text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((c) => (
              <tr key={c._id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <Link href={`/clients/${c._id}`} className="font-medium hover:underline">
                    {c.fullName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="font-mono">
                    {c.pin}
                  </Badge>
                </td>
                <td className="px-4 py-3">{c.tariff?.name ?? "—"}</td>
                <td className="px-4 py-3">{c.assignedToUser?.name ?? "—"}</td>
                <td className="px-4 py-3">{c.profileCompletionPercent}%</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <ClientFormModal
                      tariffs={tariffs}
                      consultants={consultants}
                      canAssign={canManage}
                      currentUserId={currentUserId}
                      client={{
                        _id: c._id,
                        fullName: c.fullName,
                        phone: c.phone,
                        email: c.email,
                        tariffId: c.tariffId,
                        assignedTo: c.assignedToUser?.id ?? "",
                      }}
                    />
                    {canManage && <ReassignButton clientId={c._id} consultants={consultants} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
