"use client";

import { useState } from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { trpc } from "@/lib/trpc";
import {
  CATEGORY_LABELS,
  type ModuleCategory,
} from "@/app/(main)/dashboard/pro/modules/_components/module-types";

import { ModuleForm, type ModuleFormValues } from "./_components/ModuleForm";

type AdminModuleLink = { id: string; label: string; url: string; order: number };
type AdminModule = {
  id: string;
  title: string;
  description: string | null;
  category: ModuleCategory;
  bunnyVideoId: string;
  order: number;
  links: AdminModuleLink[];
};

type View = { mode: "list" } | { mode: "create" } | { mode: "edit"; module: AdminModule };

function toFormValues(module: AdminModule): ModuleFormValues {
  return {
    title: module.title,
    description: module.description ?? "",
    category: module.category,
    bunnyVideoId: module.bunnyVideoId,
    order: module.order,
    links: module.links.map((l) => ({ label: l.label, url: l.url })),
  };
}

const ModulesCmsPage = (): JSX.Element => {
  const { status } = useSession();
  const [view, setView] = useState<View>({ mode: "list" });

  const authenticated = status === "authenticated";

  const { data: isAdmin, isLoading: adminCheckLoading } =
    trpc.modules.isAdmin.useQuery(undefined, { enabled: authenticated });

  if (status === "loading" || (authenticated && adminCheckLoading)) {
    return (
      <CenteredMessage>
        <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </CenteredMessage>
    );
  }

  if (!authenticated) {
    return (
      <CenteredMessage>
        <p className="text-text-secondary">You need to sign in to continue.</p>
        <Link href="/login" className="text-brand-purple-light hover:underline">
          Go to login
        </Link>
      </CenteredMessage>
    );
  }

  if (!isAdmin) {
    return (
      <CenteredMessage>
        <p className="text-text-primary font-semibold text-lg">Access denied</p>
        <p className="text-text-secondary text-sm">
          This area is restricted to administrators.
        </p>
      </CenteredMessage>
    );
  }

  return (
    <div className="min-h-screen bg-ox-content">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Pro Modules CMS
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Add, edit, and remove the modules shown to Pro members.
            </p>
          </div>
          {view.mode === "list" ? (
            <button
              type="button"
              onClick={() => setView({ mode: "create" })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-text-primary text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New module
            </button>
          ) : null}
        </div>

        {view.mode === "list" ? (
          <ModuleList
            onCreate={() => setView({ mode: "create" })}
            onEdit={(module) => setView({ mode: "edit", module })}
          />
        ) : (
          <ModuleEditor view={view} onDone={() => setView({ mode: "list" })} />
        )}
      </div>
    </div>
  );
};

function CenteredMessage({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="min-h-screen bg-ox-content flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center px-4">
        {children}
      </div>
    </div>
  );
}

function ModuleList({
  onCreate,
  onEdit,
}: {
  onCreate: () => void;
  onEdit: (module: AdminModule) => void;
}): JSX.Element {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.modules.adminList.useQuery();
  const deleteModule = trpc.modules.adminDelete.useMutation({
    onSuccess: () => utils.modules.adminList.invalidate(),
  });

  const modules = (data ?? []) as AdminModule[];

  if (isLoading) {
    return <p className="text-text-secondary">Loading modules...</p>;
  }

  if (modules.length === 0) {
    return (
      <div className="border border-dash-border rounded-xl p-10 text-center">
        <p className="text-text-secondary">No modules yet.</p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 text-brand-purple-light hover:underline text-sm"
        >
          Create your first module
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((module) => (
        <div
          key={module.id}
          className="bg-dash-surface border border-dash-border rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-purple-light bg-brand-purple/10 rounded-full px-2 py-0.5">
                {CATEGORY_LABELS[module.category]}
              </span>
              <span className="text-text-muted text-xs">#{module.order}</span>
            </div>
            <p className="text-text-primary font-medium mt-1.5 truncate">
              {module.title}
            </p>
            <p className="text-text-muted text-xs mt-0.5 truncate">
              {module.links.length} link
              {module.links.length === 1 ? "" : "s"} · video {module.bunnyVideoId}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(module)}
              aria-label={`Edit ${module.title}`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-raised hover:bg-dash-hover transition-colors"
            >
              <Pencil className="w-4 h-4 text-text-secondary" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(`Delete "${module.title}"? This can't be undone.`)
                ) {
                  deleteModule.mutate({ id: module.id });
                }
              }}
              aria-label={`Delete ${module.title}`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-raised hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ModuleEditor({
  view,
  onDone,
}: {
  view: { mode: "create" } | { mode: "edit"; module: AdminModule };
  onDone: () => void;
}): JSX.Element {
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);

  const onSuccess = () => {
    utils.modules.adminList.invalidate();
    onDone();
  };

  const createModule = trpc.modules.adminCreate.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });
  const updateModule = trpc.modules.adminUpdate.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });

  const isSubmitting = createModule.isPending || updateModule.isPending;

  const handleSubmit = (values: ModuleFormValues) => {
    setError(null);
    const payload = {
      title: values.title,
      description: values.description || undefined,
      category: values.category,
      bunnyVideoId: values.bunnyVideoId,
      order: values.order,
      links: values.links,
    };

    if (view.mode === "edit") {
      updateModule.mutate({ id: view.module.id, data: payload });
    } else {
      createModule.mutate(payload);
    }
  };

  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl p-5 md:p-6">
      <h2 className="text-text-primary font-semibold text-lg mb-5">
        {view.mode === "edit" ? "Edit module" : "New module"}
      </h2>

      {error ? (
        <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      <ModuleForm
        initialValues={
          view.mode === "edit" ? toFormValues(view.module) : undefined
        }
        submitLabel={view.mode === "edit" ? "Save changes" : "Create module"}
        isSubmitting={isSubmitting}
        onSubmitAction={handleSubmit}
        onCancelAction={onDone}
      />
    </div>
  );
}

export default ModulesCmsPage;
