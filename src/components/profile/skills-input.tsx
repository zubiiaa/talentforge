"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function SkillsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const skill = raw.trim();
    if (!skill) return;
    if (value.some((s) => s.toLowerCase() === skill.toLowerCase())) return;
    if (value.length >= 30) return;
    onChange([...value, skill]);
    setDraft("");
  }

  return (
    <div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          }
          if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => add(draft)}
        placeholder="Type a skill and press Enter"
      />
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 pr-1">
              {skill}
              <button
                type="button"
                onClick={() => onChange(value.filter((s) => s !== skill))}
                className="rounded-full p-0.5 hover:bg-black/10"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
