"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/useToast";
import { api, type AskCfoResponse, type CfoFigure } from "@/lib/api/client";
import { getDatesForPeriod, type PeriodKey } from "@/components/profit-os/PeriodPicker";

export interface CopilotPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  figures?: CfoFigure[];
  isVerified?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "Pourquoi mon net a baissé ?",
  "Quel produit couper ?",
  "Où sont mes refus ?",
];

export function CopilotPanel({ open, onOpenChange }: CopilotPanelProps) {
  const searchParams = useSearchParams();
  const { info, error: showError } = useToast();

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Period defaults to active Profit OS period
  const getActivePeriodDates = () => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    if (fromParam && toParam) {
      return { from: fromParam, to: toParam };
    }
    const periodParam = (searchParams.get("period") as PeriodKey) || "90d";
    return getDatesForPeriod(periodParam);
  };

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${prev.length + 1}`,
        role: "user",
        content: q,
      },
    ]);
    setQuestion("");
    setLoading(true);

    const { from, to } = getActivePeriodDates();

    try {
      const res: AskCfoResponse = await api.askCfo({
        question: q,
        from,
        to,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${prev.length + 1}`,
          role: "assistant",
          content: res.answer,
          citations: res.citations,
          figures: res.figures,
          isVerified: res.isVerified,
        },
      ]);
      setUnavailable(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (
        errorMsg.includes("503") ||
        errorMsg.toLowerCase().includes("indisponible") ||
        errorMsg.toLowerCase().includes("gemini")
      ) {
        setUnavailable(true);
      } else {
        showError(
          errorMsg || "Impossible d'obtenir une réponse du Copilote.",
          "Erreur Copilote"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (fig: CfoFigure) => {
    info(
      `${fig.label} : ${fig.value.toLocaleString("fr-FR")} ${fig.unit} (Source: ${fig.source})`,
      "Chiffre certifié"
    );
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Copilote CFO IA"
      description="Analyses décisionnelles et métriques certifiées sans hallucination"
      className="max-w-lg"
    >
      <div className="flex flex-col h-[calc(100vh-140px)] justify-between gap-4">
        {/* Top Disclaimer / Unavailable Banner */}
        {unavailable && (
          <div
            role="alert"
            className="p-3.5 rounded-xl border border-warning-border bg-warning-cream/40 text-xs text-foreground flex items-start gap-2.5 shadow-2xs"
          >
            <AlertTriangle className="w-4 h-4 text-warning-amber shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-warning-amber">
                Copilote indisponible — configurez votre clé Gemini
              </p>
              <p className="text-muted mt-0.5">
                Vérifiez la variable GEMINI_API_KEY dans votre environnement. Les
                calculs purs de Profit OS continuent de fonctionner normalement.
              </p>
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 && !unavailable && (
            <div className="text-center py-8 px-2 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border flex items-center justify-center mx-auto text-brand-lime">
                <Sparkles className="w-6 h-6 fill-brand-lime" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                Comment puis-je vous aider aujourd hui ?
              </h4>
              <p className="text-xs text-muted max-w-xs mx-auto">
                Posez vos questions sur vos marges, retours COD, et coûts
                publicitaires. Tous les chiffres sont vérifiés sur votre
                snapshot.
              </p>

              {/* Suggested Questions */}
              <div className="pt-2 flex flex-col gap-2">
                <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
                  Suggestions rapides
                </span>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTED_QUESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAsk(sug)}
                      className="text-left text-xs p-2.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle text-foreground transition-colors flex items-center justify-between group"
                    >
                      <span>{sug}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                {msg.role === "user" ? (
                  <>
                    <span>Vous</span>
                    <User className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 text-brand-lime" />
                    <span>Copilote CFO</span>
                    {msg.isVerified === false && (
                      <Badge variant="warning" className="text-[10px] py-0 px-1.5">
                        Partiellement vérifié
                      </Badge>
                    )}
                  </>
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand-lime text-black font-medium rounded-tr-xs"
                    : "bg-surface-subtle border border-border text-foreground rounded-tl-xs shadow-2xs"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* Verified Figure Chips */}
                {msg.figures && msg.figures.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-border flex flex-wrap gap-1.5">
                    {msg.figures.map((fig, idx) => (
                      <button
                        key={`${fig.label}-${idx}`}
                        type="button"
                        onClick={() => handleChipClick(fig)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface border border-border text-[11px] font-medium text-foreground hover:border-brand-lime transition-colors"
                        title={`Source: ${fig.source}`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-positive-emerald" />
                        <span>{fig.label}:</span>
                        <span className="font-semibold">
                          {fig.value.toLocaleString("fr-FR")} {fig.unit}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-muted">
                    <span>Sources :</span>
                    {msg.citations.map((cite, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-surface border border-border"
                      >
                        {cite}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Skeleton */}
          {loading && (
            <div className="flex flex-col gap-2 items-start animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <Bot className="w-3.5 h-3.5 text-brand-lime animate-pulse" />
                <span>Analyse du FinancialSnapshot en cours...</span>
              </div>
              <Card className="p-3.5 max-w-[85%] space-y-2 border-border bg-surface-subtle">
                <Skeleton className="h-3 w-48 rounded" />
                <Skeleton className="h-3 w-64 rounded" />
                <Skeleton className="h-3 w-36 rounded" />
              </Card>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-2 border-t border-border space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Posez une question sur votre rentabilité..."
              disabled={loading || unavailable}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-lime disabled:opacity-50 transition-shadow"
            />
            <Button
              type="submit"
              variant="brand"
              size="sm"
              disabled={loading || !question.trim() || unavailable}
              className="rounded-xl px-3.5 py-2.5 text-black font-semibold h-auto"
              aria-label="Envoyer la question"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <Send className="w-4 h-4 text-black" />
              )}
            </Button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-muted px-1">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Règle : Données certifiées uniquement
            </span>
            <span>Limite : 10 req / min</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

