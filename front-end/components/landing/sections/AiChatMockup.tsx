import { cn } from "cn";
import { ButtonLink } from "@/components/landing/ui/ButtonLink";
import { LANDING } from "@/components/landing/landing.data";

export function AiChatMockup() {
  const { chat } = LANDING;

  return (
    <div className="rounded-xl border border-[var(--prepo-border)] bg-white shadow-sm p-6 lg:p-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-prepo-primary" aria-hidden="true">
          ✧
        </span>
        <span className="text-[13px] font-bold tracking-wider text-prepo-primary">
          {chat.title}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {chat.messages.map((message, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              message.speaker === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "rounded-2xl p-3 text-sm leading-relaxed max-w-[82%]",
                message.speaker === "user"
                  ? "bg-prepo-primary text-white rounded-br-none"
                  : "border border-[var(--prepo-border)] text-prepo-text rounded-bl-none"
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1">
                {message.speaker === "user" ? "Tu" : "Prevo"}
              </p>
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--prepo-border)] bg-prepo-bg p-4">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-prepo-text mb-2">
          {chat.draftTitle}
        </h4>
        <p className="text-sm font-medium text-prepo-ink mb-3">
          {chat.draftClient}
        </p>
        <ul className="space-y-2 text-sm text-prepo-text mb-4">
          {chat.rows.map((row) => (
            <li key={row.label} className="flex justify-between">
              <span>{row.label}</span>
              <span>{row.value}</span>
            </li>
          ))}
        </ul>
        <ButtonLink variant="primary" size="sm" href="#">
          {chat.buttonLabel}
        </ButtonLink>
        <p className="mt-3 text-[11px] text-prepo-text">{chat.footnote}</p>
      </div>
    </div>
  );
}
