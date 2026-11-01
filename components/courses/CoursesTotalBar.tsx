"use client";

import { motion } from "framer-motion";
import { useCaptions } from "../LanguageProvider";

type Props = {
  sousTotal: number;
  sousTotalTaxable: number;
  tps: number;
  tvq: number;
  total: number;
};

export default function CoursesTotalBar({ sousTotal, sousTotalTaxable, tps, tvq, total }: Props) {
  const { t } = useCaptions();
  const sousTotalNonTaxable = sousTotal - sousTotalTaxable;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 sticky bottom-20 mt-2 shadow-2xl shadow-black/40"
    >
      <div className="space-y-1.5">
        {sousTotalNonTaxable > 0 && (
          <div className="flex justify-between text-sm text-slate-400">
            <span className="flex items-center gap-2">
              {t.totals.notTaxedItems}
              <span className="text-xs bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">0%</span>
            </span>
            <span className="font-mono">{sousTotalNonTaxable.toFixed(2)} $</span>
          </div>
        )}
        {sousTotalTaxable > 0 && (
          <div className="flex justify-between text-sm text-slate-400">
            <span className="flex items-center gap-2">
              {t.totals.taxedItems}
              <span className="text-xs bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded">{t.totals.taxBadge}</span>
            </span>
            <span className="font-mono">{sousTotalTaxable.toFixed(2)} $</span>
          </div>
        )}
        {(tps > 0 || tvq > 0) && (
          <>
            <div className="flex justify-between text-xs text-slate-500 pl-2">
              <span>{t.totals.gst}</span>
              <span className="font-mono">+ {tps.toFixed(2)} $</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 pl-2">
              <span>{t.totals.qst}</span>
              <span className="font-mono">+ {tvq.toFixed(2)} $</span>
            </div>
          </>
        )}
        <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between text-base font-semibold text-white">
          <span>{t.totals.total}</span>
          <span className="font-mono text-accent">{total.toFixed(2)} $</span>
        </div>
      </div>
    </motion.div>
  );
}
