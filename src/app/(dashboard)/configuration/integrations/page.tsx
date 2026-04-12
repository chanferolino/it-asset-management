import { MessageSquare, Mail, KeyRound, Webhook } from "lucide-react";
import { IntegrationCard } from "./_components/integration-card";

const INTEGRATIONS = [
  {
    name: "Slack",
    description:
      "Push ticket updates and asset alerts to a Slack channel for real-time visibility.",
    icon: MessageSquare,
  },
  {
    name: "Email / SMTP",
    description:
      "Configure outbound delivery for notifications, password resets, and digest emails.",
    icon: Mail,
  },
  {
    name: "Single Sign-On",
    description:
      "Let users sign in with your existing identity provider (Google Workspace, Azure AD, Okta).",
    icon: KeyRound,
  },
  {
    name: "Webhooks",
    description:
      "Fire outbound webhooks on asset and ticket events so other systems can react.",
    icon: Webhook,
  },
] as const;

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-[#300000]">
            Integrations
          </h2>
          <p className="text-sm text-[#888888]">
            Planned integrations for future releases. None are active yet — this
            is a preview of what&apos;s on the roadmap.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard
            key={integration.name}
            name={integration.name}
            description={integration.description}
            icon={integration.icon}
          />
        ))}
      </div>
    </div>
  );
}
