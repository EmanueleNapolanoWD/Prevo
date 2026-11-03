"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ClockIcon,
  AlertTriangleIcon,
  FileCheckIcon,
} from "lucide-react";
import styles from "./actions-to-do.module.css";

interface TodoItem {
  id: string;
  number: string;
  customerName: string;
  total: number;
  reason: string;
  detail: string;
  date: string;
}

interface ActionsToDoProps {
  todos: TodoItem[] | null | undefined;
}

export default function ActionsToDo({ todos }: ActionsToDoProps) {
  const getLabel = (reason: string) => {
    if (reason === "scadenza") return "In scadenza";
    if (reason === "risposta") return "Da sollecitare";
    if (reason === "bozza") return "Bozza ferma";
    return "Da gestire";
  };

  const getIcon = (reason: string) => {
    if (reason === "scadenza") return <ClockIcon className={styles.icon} />;
    if (reason === "risposta") return <AlertTriangleIcon className={styles.icon} />;
    if (reason === "bozza") return <FileCheckIcon className={styles.icon} />;
    return <AlertTriangleIcon className={styles.icon} />;
  };

  if (!todos || todos.length === 0) {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.title}>Da fare adesso</div>
          <div className={styles.description}>
            Nessuna azione immediata necessaria
          </div>
        </div>
        <div className={styles.empty}>Tutto in ordine</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>Da fare adesso</div>
        <div className={styles.description}>
          {todos.length} elemento/ti in attesa di azione
        </div>
      </div>
      <div className={styles.content}>
        {todos.map((todo) => (
          <div key={todo.id} className={styles.item}>
            <div className={styles.iconWrapper}>
              <div className={styles.iconCircle}>
                {getIcon(todo.reason)}
              </div>
              <Badge variant="outline" className={styles.iconBadge}>
                {getLabel(todo.reason)}
              </Badge>
            </div>
            <div className={styles.details}>
              <div className={styles.detailsNumber}>
                {todo.number} - {todo.customerName}
              </div>
              <div className={styles.detailsDetail}>{todo.detail}</div>
              <div className={styles.detailsAmount}>
                Importo:{" "}
                {todo.total.toLocaleString("it-IT", {
                  style: "currency",
                  currency: "EUR",
                })}
              </div>
            </div>
            <Link
              href={`/${encodeURIComponent(todo.id)}/quote`}
              className={styles.link}
            >
              Vedi dettagli
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
