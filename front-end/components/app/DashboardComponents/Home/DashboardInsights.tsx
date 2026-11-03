"use client";

import { Badge } from "@/components/ui/badge";
import {
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";
import styles from "./dashboard-insights.module.css";

interface Insights {
  topCustomers: { name: string; acceptedValue: number; acceptedCount: number }[];
  topCatalogItems: { name: string; timesUsed: number; totalQuantity: number }[];
  teamPerformance: {
    id: string;
    name: string;
    role: string;
    created: number;
    sent: number;
    accepted: number;
    acceptanceRate: number;
  }[];
  onboarding: { id: string; label: string; completed: boolean }[];
}

interface DashboardInsightsProps {
  insights: Insights | null;
  isOwner: boolean;
}

export default function DashboardInsights({ insights, isOwner }: DashboardInsightsProps) {
  if (!isOwner || !insights) return null;

  const renderCheckItem = (item: { id: string; label: string; completed: boolean }) => {
    const getIcon = () => {
      if (item.completed) return <CheckCircleIcon className={styles.iconDone} />;
      return <ClockIcon className={styles.iconPending} />;
    };

    return (
      <li className={styles.onboardingItem} key={item.id}>
        <div className={styles.iconCircle}>
          {getIcon()}
        </div>
        <div>
          <p className={styles.itemLabel}>{item.label}</p>
          <Badge
            variant={item.completed ? "secondary" : "outline"}
            className={styles.itemBadge}
          >
            {item.completed ? "Completato" : "Da completare"}
          </Badge>
        </div>
      </li>
    );
  };

  const onboardingComplete = insights.onboarding?.every((o) => o.completed) ?? false;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>Azienda</div>
        <div className={styles.description}>
          Informazioni aziendali e checklist
        </div>
      </div>
      <div className={styles.content}>
        {/* Checklist onboarding */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Checklist di onboarding</h4>
          <ul className={styles.list}>
            {insights.onboarding?.map((item) => renderCheckItem(item))}
          </ul>
          {onboardingComplete && (
            <div className={styles.completeBanner}>
              🎉 Onboarding completato!
            </div>
          )}
        </div>

        {/* Top clienti e voci catalogo (se presenti) */}
        <div className={styles.topGrid}>
          <div>
            <h4 className={styles.sectionTitle}>
              Top clienti per valore accettato
            </h4>
            {insights.topCustomers?.length ? (
              <ul className={styles.list}>
                {insights.topCustomers.map((c, i) => (
                  <li key={i} className={styles.listItem}>
                    <span>{i + 1}. {c.name}</span>
                    <span className={styles.value}>
                      {c.acceptedValue.toLocaleString("it-IT", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.mutedText}>
                Nessun dato disponibile
              </p>
            )}
          </div>

          <div>
            <h4 className={styles.sectionTitle}>
              Top voci di catalogo usate
            </h4>
            {insights.topCatalogItems?.length ? (
              <ul className={styles.list}>
                {insights.topCatalogItems.map((c, i) => (
                  <li key={i} className={styles.listItem}>
                    <span>{c.name}</span>
                    <span className={styles.value}>{c.timesUsed} usi</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.mutedText}>
                Nessun dato disponibile
              </p>
            )}
          </div>
        </div>

        {/* Team performance */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Performance del team</h4>
          {insights.teamPerformance?.length ? (
            <table className={styles.teamTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th className={styles.textRight}>Preventivi creati</th>
                  <th className={styles.textRight}>Inviati</th>
                  <th className={styles.textRight}>Accettati</th>
                  <th className={styles.textRight}>Tasso</th>
                </tr>
              </thead>
              <tbody>
                {insights.teamPerformance.map((member) => (
                  <tr key={member.id}>
                    <td className={styles.fontMedium}>{member.name}</td>
                    <td className={styles.textRight}>{member.created}</td>
                    <td className={styles.textRight}>{member.sent}</td>
                    <td className={styles.textRight}>{member.accepted}</td>
                    <td className={`${styles.textRight} ${styles.fontMedium}`}>
                      {member.acceptanceRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.mutedText}>
              Nessun dato del team disponibile
            </p>
          )}
        </div>
      </div>
      <div className={styles.footer}>
        Dati aggiornati in tempo reale
      </div>
    </div>
  );
}
