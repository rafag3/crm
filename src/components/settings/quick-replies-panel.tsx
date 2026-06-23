"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Loader2, Zap, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuickReplies, type QuickReply } from "@/hooks/use-quick-replies";
import { SettingsPanelHead } from "./settings-panel-head";

interface EditState {
  shortcut: string;
  title: string;
  content: string;
}

function emptyEdit(): EditState {
  return { shortcut: "", title: "", content: "" };
}

export function QuickRepliesPanel() {
  const { replies, loading, invalidate } = useQuickReplies();
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState<EditState>(emptyEdit());
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>(emptyEdit());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetNew = useCallback(() => {
    setCreating(false);
    setNewForm(emptyEdit());
  }, []);

  const handleCreate = useCallback(async () => {
    const { shortcut, title, content } = newForm;
    if (!shortcut.trim() || !title.trim() || !content.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/quick-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortcut, title, content }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Erro ao criar");
      }
      invalidate();
      resetNew();
      toast.success("Resposta rápida criada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSaving(false);
    }
  }, [newForm, invalidate, resetNew]);

  const startEdit = useCallback((r: QuickReply) => {
    setEditingId(r.id);
    setEditForm({ shortcut: r.shortcut, title: r.title, content: r.content });
  }, []);

  const handleUpdate = useCallback(
    async (id: string) => {
      const { shortcut, title, content } = editForm;
      if (!shortcut.trim() || !title.trim() || !content.trim()) {
        toast.error("Preencha todos os campos.");
        return;
      }
      setSaving(true);
      try {
        const res = await fetch(`/api/quick-replies/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shortcut, title, content }),
        });
        if (!res.ok) throw new Error("Erro ao salvar");
        invalidate();
        setEditingId(null);
        toast.success("Resposta atualizada!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setSaving(false);
      }
    },
    [editForm, invalidate]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await fetch(`/api/quick-replies/${id}`, { method: "DELETE" });
        invalidate();
        toast.success("Resposta removida.");
      } catch {
        toast.error("Erro ao remover.");
      } finally {
        setDeletingId(null);
      }
    },
    [invalidate]
  );

  return (
    <section className="max-w-2xl animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title="Respostas Rápidas"
        description='Textos prontos acessíveis pelo compositor de mensagens. Digite "/" para abrir a lista enquanto atende um cliente.'
      />

      {/* New reply form */}
      {creating ? (
        <Card className="mb-4">
          <CardContent className="space-y-3">
            <p className="text-xs font-semibold text-foreground">Nova resposta rápida</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Atalho <span className="text-primary">(sem espaços)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    /
                  </span>
                  <Input
                    value={newForm.shortcut}
                    onChange={(e) =>
                      setNewForm((f) => ({
                        ...f,
                        shortcut: e.target.value.replace(/\s+/g, "-").toLowerCase(),
                      }))
                    }
                    placeholder="ex: ola, horario, preco"
                    className="pl-6"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Título (para identificar na lista)</label>
                <Input
                  value={newForm.title}
                  onChange={(e) => setNewForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Saudação inicial"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">Texto completo da resposta</label>
                <Textarea
                  value={newForm.content}
                  onChange={(e) => setNewForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Olá! Seja bem-vindo(a)! Como posso ajudar você hoje?"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={resetNew} disabled={saving}>
                <X className="size-4" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={() => setCreating(true)}
        >
          <Plus className="size-4" />
          Nova resposta rápida
        </Button>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Carregando…
        </div>
      ) : replies.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Zap className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Nenhuma resposta rápida ainda.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Crie a primeira para começar a atender mais rápido.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {replies.map((r) => {
            const isEditing = editingId === r.id;
            return (
              <li
                key={r.id}
                className={cn(
                  "group rounded-xl border border-border bg-card p-4 transition-colors",
                  isEditing && "border-primary/40 ring-2 ring-primary/20"
                )}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Atalho</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">/</span>
                          <Input
                            value={editForm.shortcut}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                shortcut: e.target.value.replace(/\s+/g, "-").toLowerCase(),
                              }))
                            }
                            className="pl-6"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Título</label>
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs text-muted-foreground">Texto</label>
                        <Textarea
                          value={editForm.content}
                          onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} disabled={saving}>
                        <X className="size-4" />
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={() => handleUpdate(r.id)} disabled={saving}>
                        {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                          /{r.shortcut}
                        </span>
                        <span className="text-sm font-semibold text-foreground">{r.title}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {r.content}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Editar"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Excluir"
                      >
                        {deletingId === r.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
