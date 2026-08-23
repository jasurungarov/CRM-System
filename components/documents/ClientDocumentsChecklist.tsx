import { getClientDocuments } from "@/actions/documents.actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DocumentStatusBadge } from "./document-status-badge";
import { UploadDocumentButton } from "./UploadDocumentButton";
import { DocumentReviewControls } from "./DocumentReviewControls";
import { AddCustomDocumentButton } from "./AddCustomDocumentButton";
import { FileText } from "lucide-react";

export async function ClientDocumentsChecklist({
  clientId,
  canReview,
}: {
  clientId: string;
  canReview: boolean;
}) {
  const documents = await getClientDocuments(clientId);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Hujjatlar ro&apos;yxati</CardTitle>
        <AddCustomDocumentButton clientId={clientId} />
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {doc.title} {!doc.isRequired && <span className="text-xs text-muted-foreground">(ixtiyoriy)</span>}
                </p>
                <p className="text-xs text-muted-foreground">{doc.description}</p>
                {doc.fileName && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-primary hover:underline"
                  >
                    {doc.fileName}
                  </a>
                )}
                {doc.status === "rad_etildi" && doc.rejectionReason && (
                  <p className="mt-1 text-xs text-destructive">Sabab: {doc.rejectionReason}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DocumentStatusBadge status={doc.status} />
              <UploadDocumentButton clientId={clientId} documentId={doc._id} />
              {canReview && doc.status === "kutilmoqda" && <DocumentReviewControls documentId={doc._id} />}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
