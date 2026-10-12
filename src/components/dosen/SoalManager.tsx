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

  // FR-19: pencarian & filter soal
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
    "px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dosen"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              title="Kembali ke panel dosen"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Kelola Soal</h1>
              <p className="text-xs text-slate-500">
                Tambah, ubah, publikasikan, dan pratinjau kunci jawaban soal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-6">
        {listError && (
          <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {listError}
          </p>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingId ? "Ubah Soal" : "Tambah Soal Baru"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={previewing || !form.expectedSql.trim()}
                  className="self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-50 transition-colors"
                >
                  {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>Preview</span>
                </button>
              </div>
            </Field>

            {preview && (
              <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Hasil Pratinjau {preview.rowCount != null ? `(${preview.rowCount} baris)` : ""}
                  </span>
                  {preview.executionMs != null && (
                    <span className="text-[11px] text-slate-400">{preview.executionMs} ms</span>
                  )}
                </div>
                {preview.error ? (
                  <p className="text-xs text-red-600">{preview.error}</p>
                ) : (
                  <div className="overflow-x-auto max-h-64">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          {preview.columns.map((c) => (
                            <th key={c} className="p-2 font-semibold border border-slate-200">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {preview.rows.map((row, i) => (
                          <tr key={i}>
                            {(row as unknown[]).map((cell, j) => (
                              <td key={j} className="p-2 border border-slate-100 text-slate-700">
                                {cell === null ? <span className="text-slate-400 italic">NULL</span> : String(cell)}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.orderMatters}
                  onChange={(e) => set("orderMatters", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Urutan baris berpengaruh (ORDER BY)
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => set("isPublished", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Publikasikan soal
              </label>
            </div>

            {formError && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? "Menyimpan..." : "Simpan Soal"}</span>
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* FR-19: Pencarian & Filter */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau judul soal..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">
            {filteredQuestions.length} dari {questions.length} soal
          </span>
        </div>

        {/* Question Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Memuat daftar soal...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileQuestion className="w-10 h-10 mx-auto mb-3 stroke-slate-300" />
              <p className="text-sm">
                {questions.length === 0
                  ? "Belum ada soal yang tersimpan."
                  : "Tidak ada soal yang cocok dengan pencarian atau filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 font-semibold">Kode</th>
                    <th className="p-3.5 font-semibold">Judul Soal</th>
                    <th className="p-3.5 font-semibold">Skema</th>
                    <th className="p-3.5 font-semibold">Level</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/60">
                      <td className="p-3.5 font-mono font-bold text-blue-600">{q.code}</td>
                      <td className="p-3.5 font-medium text-slate-800">{q.title}</td>
                      <td className="p-3.5 text-slate-600">{q.schemaName}</td>
                      <td className="p-3.5 text-slate-600">Level {q.level}</td>
                      <td className="p-3.5">
                        {q.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Eye className="w-3 h-3" />
                            Publik
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <EyeOff className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            title="Ubah"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                            title={q.isPublished ? "Sembunyikan" : "Publikasikan"}
                          >
                            {q.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(q)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
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
  "w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}
