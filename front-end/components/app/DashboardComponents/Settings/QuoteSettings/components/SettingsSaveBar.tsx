import { Info, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FormMessage } from "@/lib/Utility/QuoteSettings/quote-settings.types";

export default function SettingsSaveBar({
  saving,
  message,
}: {
  saving: boolean;
  message: FormMessage;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
      {message ? (
        <p
          role="status"
          className={
            message.type === "ok"
              ? "text-sm text-green-600"
              : "text-sm text-destructive"
          }
        >
          {message.text}
        </p>
      ) : (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="size-4" /> Le modifiche si applicano ai nuovi
          preventivi.
        </p>
      )}
      <Button type="submit" disabled={saving}>
        <Save className="size-4" />
        {saving ? "Salvataggio…" : "Salva modifiche"}
      </Button>
    </div>
  );
}
