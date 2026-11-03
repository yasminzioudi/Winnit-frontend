"use client";

import React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/lib/format/date";
import type { OrderResponse } from "@/lib/api/types";
import { Clock, User } from "lucide-react";

interface StatusTimelineModalProps {
  order: OrderResponse | null;
  open: boolean;
  onClose: () => void;
}

export function StatusTimelineModal({
  order,
  open,
  onClose,
}: StatusTimelineModalProps) {
  if (!order) return null;

  const history = order.statusHistory || [
    {
      status: order.status,
      changedAt: order.placedAt,
      changedBy: "system",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Historique de la commande ${order.orderNumber}`}
      description={`Détail des transitions d&apos;état pour ${order.productNameSnapshot}`}
    >
      <div className="py-2 space-y-4">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
          {history.map((step, idx) => (
            <div key={idx} className="relative flex items-start justify-between gap-4">
              {/* Dot indicator */}
              <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-surface dark:ring-neutral-900" />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusPill status={step.status as OrderResponse['status']} />
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(step.changedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {step.changedBy}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}

