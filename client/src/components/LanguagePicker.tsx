import { useId, useState } from "react";
import { X, Plus } from "lucide-react";
export const popularLanguages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Solidity",
  "Move",
  "Cairo",
  "Dart",
  "Elixir",
  "R",
  "Scala",
];
export default function LanguagePicker({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const id = useId();
  function add(value: string) {
    const language = value.trim();
    if (!language) return;
    if (!/^[\p{L}\p{N}#+. -]{1,40}$/u.test(language)) {
      setError("Use a language name, up to 40 characters.");
      return;
    }
    if (values.length >= 8) {
      setError("Choose up to eight languages.");
      return;
    }
    if (!values.some((v) => v.toLowerCase() === language.toLowerCase()))
      onChange([...values, language]);
    setInput("");
    setError("");
  }
  return (
    <div className="language-picker">
      <label htmlFor={id}>Languages</label>
      <p className="filter-help">Match any selected language.</p>
      <form
        className="language-input"
        onSubmit={(e) => {
          e.preventDefault();
          add(input);
        }}
      >
        <input
          id={id}
          list={`${id}-options`}
          value={input}
          maxLength={40}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search or add a language"
          autoComplete="off"
        />
        <datalist id={`${id}-options`}>
          {popularLanguages
            .filter((l) => !values.includes(l))
            .map((l) => (
              <option key={l} value={l} />
            ))}
        </datalist>
        <button
          type="submit"
          className="icon-button"
          aria-label="Add language"
          disabled={!input.trim()}
        >
          <Plus size={16} />
        </button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="selected-languages">
        {values.map((l) => (
          <button
            type="button"
            key={l}
            onClick={() => onChange(values.filter((v) => v !== l))}
            aria-label={`Remove ${l}`}
          >
            {l}
            <X size={12} />
          </button>
        ))}
      </div>
      <div className="language-options">
        {popularLanguages.slice(0, 13).map((l) => (
          <label key={l}>
            <input
              type="checkbox"
              checked={values.includes(l)}
              onChange={(e) =>
                e.target.checked
                  ? add(l)
                  : onChange(values.filter((v) => v !== l))
              }
            />
            {l}
          </label>
        ))}
      </div>
    </div>
  );
}
