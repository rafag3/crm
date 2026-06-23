"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Users,
  Zap,
  Building2,
  ChevronRight,
  ChevronLeft,
  X,
  Radio,
  GitBranch,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "crm_welcome_seen";

interface Slide {
  icon: typeof MessageSquare;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  highlights: { icon: typeof MessageSquare; text: string }[];
}

const SLIDES: Slide[] = [
  {
    icon: MessageSquare,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    title: "Bem-vindo ao seu CRM para WhatsApp",
    description:
      "Centralize todo o atendimento da sua empresa num único lugar. Sua equipe atende, você acompanha. Simples assim.",
    highlights: [
      { icon: Users, text: "Vários agentes no mesmo número" },
      { icon: BarChart3, text: "Dashboard com métricas em tempo real" },
      { icon: MessageSquare, text: "Histórico completo de conversas" },
    ],
  },
  {
    icon: Users,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    title: "Caixa de entrada compartilhada",
    description:
      "Toda a equipe vê as mesmas conversas. Atribua atendimentos, defina responsáveis e nunca deixe um cliente sem resposta.",
    highlights: [
      { icon: MessageSquare, text: "Status: Aberta, Pendente, Encerrada" },
      { icon: Users, text: "Atribuição por agente" },
      { icon: Zap, text: "Notificação de novas mensagens" },
    ],
  },
  {
    icon: Zap,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    title: "Automações e Disparos",
    description:
      "Responda perguntas frequentes automaticamente, envie mensagens em massa com templates aprovados e feche mais negócios sem esforço extra.",
    highlights: [
      { icon: Zap, text: "Automações por palavra-chave ou horário" },
      { icon: Radio, text: "Disparos em massa com templates" },
      { icon: GitBranch, text: "Pipeline de vendas integrado" },
    ],
  },
  {
    icon: Building2,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    title: "Personalize para o seu negócio",
    description:
      "Cadastre as informações do seu negócio — horários, serviços, preços e perguntas frequentes. Isso ajuda sua equipe a atender com mais consistência e velocidade.",
    highlights: [
      { icon: Building2, text: "Templates prontos por segmento" },
      { icon: MessageSquare, text: "Respostas padronizadas para sua equipe" },
      { icon: Zap, text: "Configure em menos de 5 minutos" },
    ],
  },
];

export function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setVisible(true);
    } catch {
      // localStorage unavailable — skip
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  function goTo(next: number) {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 150);
  }

  function handleFinish() {
    dismiss();
    router.push("/settings?tab=negocio");
  }

  if (!visible) return null;

  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isLast = step === SLIDES.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal
        aria-label="Boas-vindas ao CRM"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
          {/* Close */}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div
            className={cn(
              "p-8 transition-opacity duration-150",
              animating ? "opacity-0" : "opacity-100"
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl",
                slide.iconBg
              )}
            >
              <Icon className={cn("h-7 w-7", slide.iconColor)} />
            </div>

            {/* Text */}
            <h2 className="text-xl font-bold text-foreground">{slide.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {slide.description}
            </p>

            {/* Highlights */}
            <ul className="mt-5 space-y-2.5">
              {slide.highlights.map((h, i) => {
                const HIcon = h.icon;
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        slide.iconBg
                      )}
                    >
                      <HIcon className={cn("h-3.5 w-3.5", slide.iconColor)} />
                    </span>
                    <span className="text-sm text-foreground">{h.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-8 py-4">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir para etapa ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    i === step
                      ? "w-5 bg-primary"
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  )}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goTo(step - 1)}
                  className="text-muted-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
              )}

              {isLast ? (
                <Button
                  size="sm"
                  onClick={handleFinish}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Configurar meu negócio
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => goTo(step + 1)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
