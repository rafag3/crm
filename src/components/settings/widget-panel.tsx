"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, Check, Loader2, Globe, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SettingsPanelHead } from "./settings-panel-head";

interface WidgetConfig {
  enabled: boolean;
  phone_number: string;
  button_text: string;
  welcome_message: string;
  position: "left" | "right";
}

const DEFAULTS: WidgetConfig = {
  enabled: true,
  phone_number: "",
  button_text: "Fale conosco",
  welcome_message: "Olá! Como podemos ajudar?",
  position: "right",
};

export function WidgetPanel() {
  const [config, setConfig] = useState<WidgetConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/widget-config", { cache: "no-store" });
      const json = await res.json();
      if (json.config) {
        setConfig({ ...DEFAULTS, ...json.config });
      }
    } catch {
      toast.error("Não foi possível carregar as configurações do widget.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patch<K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!config.phone_number.trim()) {
      toast.error("Informe o número do WhatsApp.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/widget-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setDirty(false);
      toast.success("Widget salvo!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  }

  // Generates the embed snippet the user pastes in their site
  const embedCode = `<!-- Widget WhatsApp -->
<script>
  window._waCrmWidget = {
    phone: "${config.phone_number.replace(/\D/g, "")}",
    text: "${config.welcome_message.replace(/"/g, '\\"')}",
    label: "${config.button_text.replace(/"/g, '\\"')}",
    position: "${config.position}"
  };
  (function(){
    var s = document.createElement('script');
    s.src = window.location.origin + '/widget.js';
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`;

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto manualmente.");
    }
  }

  if (loading) {
    return (
      <section className="flex items-center gap-2 py-10 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando…
      </section>
    );
  }

  return (
    <section className="max-w-2xl animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title="Widget para Site"
        description="Um botão flutuante que aparece no site dos seus clientes e abre conversa diretamente no WhatsApp."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Config */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Configuração</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="wg-phone">
                  Número do WhatsApp{" "}
                  <span className="text-xs text-muted-foreground">(somente números, com DDI)</span>
                </Label>
                <Input
                  id="wg-phone"
                  value={config.phone_number}
                  onChange={(e) => patch("phone_number", e.target.value)}
                  placeholder="5511999999999"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wg-label">Texto do botão</Label>
                <Input
                  id="wg-label"
                  value={config.button_text}
                  onChange={(e) => patch("button_text", e.target.value)}
                  placeholder="Fale conosco"
                  maxLength={40}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wg-msg">Mensagem de abertura</Label>
                <Input
                  id="wg-msg"
                  value={config.welcome_message}
                  onChange={(e) => patch("welcome_message", e.target.value)}
                  placeholder="Olá! Como posso ajudar?"
                  maxLength={200}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Posição</Label>
                <div className="flex gap-2">
                  {(["right", "left"] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => patch("position", pos)}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-sm transition-colors",
                        config.position === pos
                          ? "border-primary/60 bg-primary/10 text-primary ring-2 ring-primary/20"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {pos === "right" ? "Direita" : "Esquerda"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="flex gap-2">
                  {([true, false] as const).map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => patch("enabled", val)}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-sm transition-colors",
                        config.enabled === val
                          ? val
                            ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/20"
                            : "border-border bg-muted text-muted-foreground"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {val ? "Ativo" : "Inativo"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Preview</span>
            </div>
            <div className="relative h-24 overflow-hidden rounded-lg border border-dashed border-border bg-muted/20">
              <div
                className={cn(
                  "absolute bottom-3 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white shadow-lg",
                  config.position === "right" ? "right-3" : "left-3"
                )}
              >
                <MessageCircle className="size-4" />
                {config.button_text || "Fale conosco"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Embed code */}
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Código para o site</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyEmbed}
              >
                {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                {copied ? "Copiado!" : "Copiar código"}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-[11px] leading-relaxed text-muted-foreground">
              {embedCode}
            </pre>
            <p className="text-xs text-muted-foreground">
              Cole esse código antes do <code className="text-primary">&lt;/body&gt;</code> no site do seu cliente.
            </p>
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
              "Salvar widget"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
