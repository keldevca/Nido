"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPath } from "@/lib/api";
import CourseForm, { type CourseFormValues } from "./CourseForm";

type Props = {
  onAdded: () => void;
};

export default function AddCourseForm({ onAdded }: Props) {
  const [open, setOpen] = useState(false);

  async function add(values: CourseFormValues) {
    await fetch(apiPath("/api/courses"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    onAdded();
    setOpen(false);
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Ajouter un article
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="card mt-2 p-4 overflow-hidden"
          >
            <CourseForm submitLabel="Ajouter" onSubmit={add} onCancel={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
