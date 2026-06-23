"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Building2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BUSINESS_TEMPLATES, type FaqPair } from "@/lib/business-templates";
import { SettingsPanelHead } from "./settings-panel-head";

interface BusinessProfile {
  segment: string;
  business_name: string;
  phone: string;
  address: string;
  hours: string;
  website: string;
  description: string;
  faqs: FaqPair[];
}

const EMPTY_PROFILE: BusinessProfile = {
  segment: "",
  business_name: "",
  phone: "",
  address: "",
  hours: "",
  website: "",
  description: "",
  faqs: [],
};

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export function BusinessProfilePanel() {
  const [profile, setProfile] = useState<BusinessProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business-profile", { cache: "no-store" });
      const json = await res.json();
      if (json.profile) {
        const p = json.profile;
        setProfile({
          segment: p.segment ?? "",
          business_name: p.business_name ?? "",
          phone: p.phone ?? "",
          address: p.address ?? "",
          hours: p.hours ?? "",
          website: p.website ?? "",
          description: p.description ?? "",
          faqs: Array.isArray(p.faqs)
            ? p.faqs.map((f: Omit<FaqPair, "id">) => ({
                ...f,
                id: genId(),
              }))
            : [],
        });
      }
    } catch {
      toast.error("Não foi possível carregar o perfil do negócio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patch<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function applyTemplate(templateId: string) {
    const tpl = BUSINESS_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const newFaqs: FaqPair[] = tpl.defaultFaqs.map((f) => ({
      ...f,
      id: genId(),
    }));
    setProfile((prev) => ({
      ...prev,
      segment: templateId,
      faqs: newFaqs,
    }));
    setDirty(true);
    setTemplateOpen(false);
    toast.success(`Template "${tpl.label}" aplicado. Edite as respostas e salve.`);
  }

  function addFaq() {
    const faq: FaqPair = { id: genId(), question: "", answer: "" };
    setProfile((prev) => ({ ...prev, faqs: [...prev.faqs, faq] }));
    setDirty(true);
  }

  function updateFaq(id: string, field: "question" | "answer", value: string) {
    setProfile((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    }));
    setDirty(true);
  }

  function removeFaq(id: string) {
    setProfile((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id),
    }));
    setDirty(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Strip the local `id` field from each FAQ before sending
      const payload = {
        ...profile,
        faqs: profile.faqs.map(({ id: _id, ...rest }) => rest),
      };
      const res = await fetch("/api/business-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Erro ao salvar");
      }
      setDirty(false);
      toast.success("Perfil do negócio salvo!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const selectedTemplate = BUSINESS_TEMPLATES.find((t) => t.id === profile.segment);

  if (loading) {
    return (
      <section className="flex items-center gap-2 py-10 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando perfil do negócio…
      </section>
    );
  }

  return (
    <section className="max-w-2xl animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title="Perfil do Negócio"
        description="Cadastre as informações do seu negócio. Sua equipe usa esses dados para responder clientes com consistência e agilidade."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Segment selector */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Tipo de negócio
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Escolha seu segmento para carregar perguntas frequentes pré-programadas.
              Você pode editar tudo depois.
            </p>

            {/* Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTemplateOpen((o) => !o)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/40",
                  templateOpen && "border-primary/60 ring-2 ring-primary/20"
                )}
              >
                <span className="flex items-center gap-2">
                  {selectedTemplate ? (
                    <>
                      <span>{selectedTemplate.emoji}</span>
                      <span className="font-medium text-foreground">
                        {selectedTemplate.label}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      Selecione o tipo de negócio…
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    templateOpen && "rotate-180"
                  )}
                />
              </button>

              {templateOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                  <ul className="max-h-64 overflow-y-auto p-1">
                    {BUSINESS_TEMPLATES.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => applyTemplate(t.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                            profile.segment === t.id && "bg-primary/10 text-primary"
                          )}
                        >
                          <span className="text-base">{t.emoji}</span>
                          <span>
                            <span className="block font-medium">{t.label}</span>
                            <span className="block text-xs text-muted-foreground">
                              {t.description}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic info */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Informações básicas
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bp-name">Nome do negócio</Label>
                <Input
                  id="bp-name"
                  value={profile.business_name}
                  onChange={(e) => patch("business_name", e.target.value)}
                  placeholder="Ex: Pizzaria do João"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bp-phone">Telefone / WhatsApp</Label>
                <Input
                  id="bp-phone"
                  value={profile.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bp-address">Endereço</Label>
                <Input
                  id="bp-address"
                  value={profile.address}
                  onChange={(e) => patch("address", e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bp-hours">Horário de funcionamento</Label>
                <Input
                  id="bp-hours"
                  value={profile.hours}
                  onChange={(e) => patch("hours", e.target.value)}
                  placeholder="Seg-Sex 9h-18h, Sáb 9h-13h"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bp-website">Site / Instagram</Label>
                <Input
                  id="bp-website"
                  value={profile.website}
                  onChange={(e) => patch("website", e.target.value)}
                  placeholder="@seuperfil ou www.site.com.br"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="bp-desc">Descrição do negócio</Label>
                <Textarea
                  id="bp-desc"
                  value={profile.description}
                  onChange={(e) => patch("description", e.target.value)}
                  placeholder="Descreva brevemente seu negócio, diferenciais, público-alvo…"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Perguntas frequentes
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Respostas que sua equipe pode usar no atendimento.
                  {profile.segment && " Editadas a partir do template selecionado."}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFaq}
              >
                <Plus className="size-4" />
                Adicionar
              </Button>
            </div>

            {profile.faqs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma pergunta ainda.{" "}
                  <button
                    type="button"
                    onClick={addFaq}
                    className="text-primary underline underline-offset-2 hover:no-underline"
                  >
                    Adicione a primeira
                  </button>{" "}
                  ou selecione um template acima.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {profile.faqs.map((faq, idx) => (
                  <li
                    key={faq.id}
                    className="group relative rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaq(faq.id)}
                        aria-label="Remover pergunta"
                        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                        placeholder="Pergunta do cliente…"
                        className="border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                        placeholder="Resposta da sua equipe…"
                        rows={2}
                        className="resize-none border-0 bg-transparent px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving || !dirty}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando…
              </>
            ) : (
              "Salvar perfil"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
