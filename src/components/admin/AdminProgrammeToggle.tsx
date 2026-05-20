"use client";

import { useState } from "react";

interface Props {
  id: string;
  isActive: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
}

export function AdminProgrammeToggle({ id, isActive: initActive, isFeatured: initFeatured, isSponsored: initSponsored }: Props) {
  const [isActive, setIsActive] = useState(initActive);
  const [isFeatured, setIsFeatured] = useState(initFeatured);
  const [isSponsored, setIsSponsored] = useState(initSponsored);

  async function patch(data: object) {
    await fetch(`/api/admin/programmes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Toggle label="Active" active={isActive} onChange={async (v) => { setIsActive(v); await patch({ isActive: v }); }} />
      <Toggle label="Featured" active={isFeatured} onChange={async (v) => { setIsFeatured(v); await patch({ isFeatured: v }); }} />
      <Toggle label="Sponsored" active={isSponsored} onChange={async (v) => { setIsSponsored(v); await patch({ isSponsored: v }); }} />
    </div>
  );
}

function Toggle({ label, active, onChange }: { label: string; active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
        active ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-zinc-700 bg-zinc-800 text-zinc-500 hover:border-zinc-600"
      }`}
    >
      {label}
    </button>
  );
}
