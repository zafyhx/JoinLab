"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Play,
  X,
  Loader2,
  FileQuestion,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SchemaOption = { id: number; slug: string; name: string };

type QuestionRow = {
  id: number;
  code: string;
  title: string;
  level: number;
  prompt: string;
  expectedSql: string;
  requiredTables: string[];
  conceptTags: string[];
  hints: string[];
  orderMatters: boolean;
  isPublished: boolean;
  schemaDefinitionId: number;
  schemaSlug: string;
  schemaName: string;
};

type FormState = {
  code: string;
  title: string;
  schemaDefinitionId: number;
  level: number;
  prompt: string;
  expectedSql: string;
  requiredTablesText: string;
  conceptTagsText: string;
  hint1: string;
  hint2: string;
  hint3: string;
  orderMatters: boolean;
  isPublished: boolean;
};

type PreviewResult = {
  columns: string[];
  rows: unknown[][];
  rowCount?: number;
  executionMs?: number;
  truncated?: boolean;
  error?: string | null;
};

function emptyForm(schemaId: number): FormState {
  return {
    code: "",
    title: "",
    schemaDefinitionId: schemaId,
    level: 1,
    prompt: "",
    expectedSql: "",
    requiredTablesText: "",
    conceptTagsText: "",
    hint1: "",
    hint2: "",
    hint3: "",
    orderMatters: false,
    isPublished: false,
  };
}

function splitTags(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function SoalManager() {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [schemas, setSchemas] = useState<SchemaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterSchema, setFilterSchema] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(0));

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/dosen/soal");
      const data = await res.json();
      if (!res.ok) {
        setListError(data.error || "Gagal memuat data soal.");
        return;
      }
      setQuestions(data.questions);
      setSchemas(data.schemas);
    } catch {
      setListError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredQuestions = questions.filter((q) => {
    const s = search.trim().toLowerCase();
    if (s && !q.code.toLowerCase().includes(s) && !q.title.toLowerCase().includes(s)) {
      return false;
    }
    if (filterSchema !== "all" && String(q.schemaDefinitionId) !== filterSchema) return false;
    if (filterLevel !== "all" && String(q.level) !== filterLevel) return false;
    if (filterStatus !== "all" && q.isPublished !== (filterStatus === "published")) return false;
    return true;
  });

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm(schemas[0]?.id ?? 0));
    setFormError(null);
    setPreview(null);
    setShowForm(true);
  }

  function openEdit(q: QuestionRow) {
    setEditingId(q.id);
    setForm({
      code: q.code,
      title: q.title,
      schemaDefinitionId: q.schemaDefinitionId,
      level: q.level,
      prompt: q.prompt,
      expectedSql: q.expectedSql,
      requiredTablesText: (q.requiredTables || []).join(", "),
      conceptTagsText: (q.conceptTags || []).join(", "),
      hint1: q.hints?.[0] ?? "",
      hint2: q.hints?.[1] ?? "",
      hint3: q.hints?.[2] ?? "",
      orderMatters: q.orderMatters,
      isPublished: q.isPublished,
    });
    setFormError(null);
    setPreview(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
    setPreview(null);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    setPreview(null);

    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      schemaDefinitionId: form.schemaDefinitionId,
      level: form.level,
      prompt: form.prompt.trim(),
      expectedSql: form.expectedSql.trim(),
      requiredTables: splitTags(form.requiredTablesText),
      conceptTags: splitTags(form.conceptTagsText),
      hints: [form.hint1, form.hint2, form.hint3],
      orderMatters: form.orderMatters,
      isPublished: form.isPublished,
    };

    try {
      const url = editingId ? `/api/dosen/soal/${editingId}` : "/api/dosen/soal";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Gagal menyimpan soal.");
      } else {
        closeForm();
        await loadData();
      }
    } catch {
      setFormError("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    setPreviewing(true);
    setPreview(null);
    try {
      const res = await fetch("/api/dosen/soal/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemaDefinitionId: form.schemaDefinitionId,
          sql: form.expectedSql,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreview({ columns: [], rows: [], error: data.error || "Pratinjau gagal" });
      } else {
        setPreview({
          columns: data.columns,
          rows: data.rows,
          rowCount: data.rowCount,
          executionMs: data.executionMs,
          truncated: data.truncated,
          error: null,
        });
      }
    } catch {
      setPreview({ columns: [], rows: [], error: "Terjadi kesalahan jaringan." });
    } finally {
      setPreviewing(false);
    }
  }

  async function handleTogglePublish(q: QuestionRow) {
    try {
      const res = await fetch(`/api/dosen/soal/${q.id}/publish`, { method: "POST" });
      if (res.ok) {
        await loadData();
      }
    } catch {
      // ignore
    }
  }

  async function handleDelete(q: QuestionRow) {
    if (!confirm(`Hapus soal '${q.code}' - ${q.title}?`)) return;
    try {
      const res = await fetch(`/api/dosen/soal/${q.id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      }
    } catch {
      // ignore
    }
  }

  const selectCls =
    "h-9 rounded-md border border-input bg-card px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dosen"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Kembali ke panel dosen"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Kelola soal
              </h1>
              <p className="text-xs text-muted-foreground">
                Tambah, ubah, publikasikan, dan pratinjau kunci jawaban soal.
              </p>
            </div>
          </div>

          <Button type="button" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Tambah Soal
          </Button>
        </div>
      </header>

      <main className="page-container space-y-6">
        {listError && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {listError}
          </p>
        )}

        {/* Form */}
        {showForm && (
          <div className="space-y-5 rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? "Ubah soal" : "Tambah soal baru"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Kode Soal">
                <input
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                  placeholder="AK-6A"
                  className={inputCls}
                />
              </Field>
              <Field label="Judul">
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Judul soal"
                  className={inputCls}
                />
              </Field>
              <Field label="Skema">
                <select
                  value={form.schemaDefinitionId}
                  onChange={(e) => set("schemaDefinitionId", Number(e.target.value))}
                  className={inputCls}
                >
                  {schemas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Level">
                <select
                  value={form.level}
                  onChange={(e) => set("level", Number(e.target.value))}
                  className={inputCls}
                >
                  <option value={1}>Level 1 - Dasar</option>
                  <option value={2}>Level 2 - Menengah</option>
                  <option value={3}>Level 3 - Lanjut</option>
                </select>
              </Field>
            </div>

            <Field label="Deskripsi Soal (Prompt)">
              <textarea
                value={form.prompt}
                onChange={(e) => set("prompt", e.target.value)}
                rows={3}
                placeholder="Tuliskan instruksi soal di sini..."
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Tabel Acuan (pisahkan dengan koma)">
                <input
                  value={form.requiredTablesText}
                  onChange={(e) => set("requiredTablesText", e.target.value)}
                  placeholder="mahasiswa, jurusan"
                  className={inputCls}
                />
              </Field>
              <Field label="Konsep (pisahkan dengan koma)">
                <input
                  value={form.conceptTagsText}
                  onChange={(e) => set("conceptTagsText", e.target.value)}
                  placeholder="inner_join, pk_fk"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Kunci Jawaban (SQL)">
              <div className="flex gap-2">
                <textarea
                  value={form.expectedSql}
                  onChange={(e) => set("expectedSql", e.target.value)}
                  rows={4}
                  placeholder="SELECT ... FROM ... JOIN ..."
                  className={`${inputCls} font-mono text-xs`}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePreview}
                  disabled={previewing || !form.expectedSql.trim()}
                  className="self-start"
                >
                  {previewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Preview
                </Button>
              </div>
            </Field>

            {preview && (
              <div className="space-y-2 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Hasil pratinjau {preview.rowCount != null ? `(${preview.rowCount} baris)` : ""}
                  </span>
                  {preview.executionMs != null && (
                    <span className="text-[11px] text-muted-foreground">
                      {preview.executionMs} ms
                    </span>
                  )}
                </div>
                {preview.error ? (
                  <p className="text-xs text-destructive">{preview.error}</p>
                ) : (
                  <div className="max-h-64 overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          {preview.columns.map((c) => (
                            <th key={c} className="border p-2 font-semibold">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {preview.rows.map((row, i) => (
                          <tr key={i}>
                            {(row as unknown[]).map((cell, j) => (
                              <td key={j} className="border p-2 text-foreground">
                                {cell === null ? (
                                  <span className="italic text-muted-foreground">NULL</span>
                                ) : (
                                  String(cell)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Petunjuk 1">
                <input
                  value={form.hint1}
                  onChange={(e) => set("hint1", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Petunjuk 2">
                <input
                  value={form.hint2}
                  onChange={(e) => set("hint2", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Petunjuk 3">
                <input
                  value={form.hint3}
                  onChange={(e) => set("hint3", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={form.orderMatters}
                  onChange={(e) => set("orderMatters", e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-[oklch(0.5_0.12_65)]"
                />
                Urutan baris berpengaruh (ORDER BY)
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => set("isPublished", e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-[oklch(0.5_0.12_65)]"
                />
                Publikasikan soal
              </label>
            </div>

            {formError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {formError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Menyimpan..." : "Simpan Soal"}
              </Button>
              <Button type="button" variant="secondary" onClick={closeForm}>
                Batal
              </Button>
            </div>
          </div>
        )}

        {/* Search & filter */}
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau judul soal..."
              className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <select value={filterSchema} onChange={(e) => setFilterSchema(e.target.value)} className={selectCls}>
            <option value="all">Semua Skema</option>
            {schemas.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className={selectCls}>
            <option value="all">Semua Level</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectCls}>
            <option value="all">Semua Status</option>
            <option value="published">Publik</option>
            <option value="draft">Draft</option>
          </select>
          <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
            {filteredQuestions.length} dari {questions.length} soal
          </span>
        </div>

        {/* Question table */}
        <div className="overflow-hidden rounded-lg border bg-card">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
              <p className="text-sm">Memuat daftar soal...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FileQuestion className="mx-auto mb-3 h-10 w-10 stroke-border" />
              <p className="text-sm">
                {questions.length === 0
                  ? "Belum ada soal yang tersimpan."
                  : "Tidak ada soal yang cocok dengan pencarian atau filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="p-3.5 font-semibold">Kode</th>
                    <th className="p-3.5 font-semibold">Judul Soal</th>
                    <th className="p-3.5 font-semibold">Skema</th>
                    <th className="p-3.5 font-semibold">Level</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="transition-colors hover:bg-muted/40">
                      <td className="p-3.5 font-mono font-bold text-accent">{q.code}</td>
                      <td className="p-3.5 font-medium text-foreground">{q.title}</td>
                      <td className="p-3.5 text-muted-foreground">{q.schemaName}</td>
                      <td className="p-3.5 text-muted-foreground">Level {q.level}</td>
                      <td className="p-3.5">
                        {q.isPublished ? (
                          <Badge variant="success">
                            <Eye className="h-3 w-3" />
                            Publik
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <EyeOff className="h-3 w-3" />
                            Draft
                          </Badge>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(q)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-accent"
                            title="Ubah"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(q)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-success"
                            title={q.isPublished ? "Sembunyikan" : "Publikasikan"}
                          >
                            {q.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(q)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}
