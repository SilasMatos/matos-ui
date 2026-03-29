"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/registry/new-york-v4/ui/button";
import {
  type NotificationData,
  NotificationStack,
} from "@/registry/new-york-v4/ui/notification-stack";

const sampleNotifications: Omit<NotificationData, "id">[] = [
  {
    app: "GitHub",
    title: "Marina Rocha",
    description: "Abriu PR #128: Refatoração dos design tokens 🚀",
    timestamp: "2 min atrás",
    avatar: (
      <span className="flex size-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        MR
      </span>
    ),
  },
  {
    app: "Slack",
    title: "João Silva",
    description: "Hey, revisou o componente novo? ☕",
    timestamp: "5 min atrás",
    avatar: (
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
        JS
      </span>
    ),
  },
  {
    app: "Vercel",
    title: "Deploy concluído",
    description: "matos-ui foi implantado em produção com sucesso.",
    timestamp: "8 min atrás",
    avatar: (
      <span className="flex size-10 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
        ▲
      </span>
    ),
  },
  {
    app: "Linear",
    title: "Lucas Pereira",
    description: "Atribuiu MAT-342 a você: Corrigir layout mobile",
    timestamp: "12 min atrás",
    avatar: (
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
        LP
      </span>
    ),
  },
  {
    app: "E-mail",
    title: "Ana Costa",
    description: "Enviou os wireframes atualizados para revisão 📎",
    timestamp: "15 min atrás",
    avatar: (
      <span className="flex size-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        AC
      </span>
    ),
  },
];

export default function NotificationStackDemo() {
  const [notifications, setNotifications] = useState<NotificationData[]>(() =>
    sampleNotifications.slice(0, 3).map((n, i) => ({
      ...n,
      id: `initial-${i}`,
    })),
  );

  const counterRef = useRef(3);

  const addNotification = useCallback(() => {
    const sample =
      sampleNotifications[
        Math.floor(Math.random() * sampleNotifications.length)
      ];
    counterRef.current += 1;

    const newNotification: NotificationData = {
      ...sample,
      id: `demo-${counterRef.current}-${Date.now()}`,
      timestamp: "agora",
    };

    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={addNotification}
        >
          Adicionar notificação
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={dismissAll}
          disabled={notifications.length === 0}
        >
          Limpar tudo
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Arraste o card para dispensar · Clique no × para fechar
      </p>

      <div className="flex items-center justify-center py-4">
        <NotificationStack
          notifications={notifications}
          onDismiss={dismiss}
          size="md"
        />
      </div>
    </div>
  );
}
