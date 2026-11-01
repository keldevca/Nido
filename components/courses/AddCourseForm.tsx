"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPath } from "@/lib/api";
import { useCaptions } from "../LanguageProvider";
import type { ListKind } from "@/lib/lists";
import CourseForm, { type CourseFormValues } from "./CourseForm";

type Props = {
  list: ListKind;
  onAdded: () => void;
};

export default function AddCourseForm({ list, onAdded }: Props) {
  const { t } = useCaptions();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function add(values: CourseFormValues) {
    await fetch(apiPath("/api/courses"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, list }),
    });
    onAdded();
    setOpen(false);
    setFormKey((k) => k + 1);
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        {t.lists[list].addItem}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key={formKey}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="card mt-2 p-4 overflow-hidden"
          >
            <CourseForm list={list} submitLabel={t.common.add} onSubmit={add} onCancel={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
