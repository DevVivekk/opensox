"use client";

import { useState } from "react";

import { Plus, Trash2 } from "lucide-react";

import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ModuleCategory,
} from "@/app/(main)/dashboard/pro/modules/_components/module-types";

export type ModuleFormValues = {
  title: string;
  description: string;
  category: ModuleCategory;
  bunnyVideoId: string;
  order: number;
  links: { label: string; url: string }[];
};

type ModuleFormProps = {
  initialValues?: ModuleFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmitAction: (values: ModuleFormValues) => void;
  onCancelAction: () => void;
};

const EMPTY: ModuleFormValues = {
  title: "",
  description: "",
  category: "open_source",
  bunnyVideoId: "",
  order: 0,
  links: [],
};

const inputClass =
  "w-full bg-dash-base border border-dash-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-brand-purple/50 focus-visible:outline-none";

export function ModuleForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmitAction,
  onCancelAction,
}: ModuleFormProps): JSX.Element {
  const [values, setValues] = useState<ModuleFormValues>(
    initialValues ?? EMPTY
  );

  const update = <K extends keyof ModuleFormValues>(
    key: K,
    value: ModuleFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const updateLink = (index: number, field: "label" | "url", value: string) =>
    setValues((prev) => ({
      ...prev,
      links: prev.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));

  const addLink = () =>
    setValues((prev) => ({
      ...prev,
      links: [...prev.links, { label: "", url: "" }],
    }));

  const removeLink = (index: number) =>
    setValues((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitAction({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      bunnyVideoId: values.bunnyVideoId.trim(),
      // Drop blank link rows so we don't send empty entries.
      links: values.links
        .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
        .filter((l) => l.label && l.url),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-text-secondary mb-1.5">
          Title
        </label>
        <input
          className={inputClass}
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-1.5">
          Description
        </label>
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            Category
          </label>
          <select
            className={inputClass}
            value={values.category}
            onChange={(e) =>
              update("category", e.target.value as ModuleCategory)
            }
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm text-text-secondary mb-1.5">
            Bunny video id
          </label>
          <input
            className={inputClass}
            value={values.bunnyVideoId}
            onChange={(e) => update("bunnyVideoId", e.target.value)}
            placeholder="e.g. 8f4b2c1a-..."
            required
          />
        </div>
      </div>

      <div className="max-w-[8rem]">
        <label className="block text-sm text-text-secondary mb-1.5">
          Sort order
        </label>
        <input
          type="number"
          className={inputClass}
          value={values.order}
          onChange={(e) => update("order", Number(e.target.value) || 0)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm text-text-secondary">Links</label>
          <button
            type="button"
            onClick={addLink}
            className="inline-flex items-center gap-1 text-sm text-brand-purple-light hover:text-text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add link
          </button>
        </div>

        {values.links.length === 0 ? (
          <p className="text-text-muted text-sm">No links added.</p>
        ) : (
          <div className="space-y-2">
            {values.links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className={`${inputClass} flex-1`}
                  value={link.label}
                  onChange={(e) => updateLink(index, "label", e.target.value)}
                  placeholder="Label"
                />
                <input
                  className={`${inputClass} flex-[2]`}
                  value={link.url}
                  onChange={(e) => updateLink(index, "url", e.target.value)}
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  aria-label="Remove link"
                  className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-raised hover:bg-dash-hover transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-text-primary text-sm font-medium transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancelAction}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-dash-surface border border-dash-border text-text-secondary hover:bg-dash-hover text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
