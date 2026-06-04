import { useEffect, useMemo, useRef, useState } from "react";

interface FuzzyComboBoxProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

const maxVisibleResults = 12;

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function fuzzyScore(option: string, query: string): number | undefined {
  const normalizedOption = normalize(option);
  const normalizedQuery = normalize(query);

  if (normalizedQuery.length === 0) {
    return 0;
  }

  const substringIndex = normalizedOption.indexOf(normalizedQuery);
  if (substringIndex >= 0) {
    return substringIndex;
  }

  let optionIndex = 0;
  let queryIndex = 0;
  let gapPenalty = 0;

  while (
    optionIndex < normalizedOption.length &&
    queryIndex < normalizedQuery.length
  ) {
    if (normalizedOption[optionIndex] === normalizedQuery[queryIndex]) {
      queryIndex++;
    } else {
      gapPenalty++;
    }

    optionIndex++;
  }

  if (queryIndex !== normalizedQuery.length) {
    return undefined;
  }

  return 1000 + gapPenalty;
}

function getFuzzyMatches(options: string[], query: string): string[] {
  return options
    .map((option) => ({
      option,
      score: fuzzyScore(option, query),
    }))
    .filter(
      (result): result is { option: string; score: number } =>
        result.score !== undefined,
    )
    .sort((a, b) => {
      const scoreCompare = a.score - b.score;
      if (scoreCompare !== 0) {
        return scoreCompare;
      }

      return a.option.localeCompare(b.option);
    })
    .slice(0, maxVisibleResults)
    .map((result) => result.option);
}

export function FuzzyComboBox({
  label,
  value,
  options,
  onChange,
  placeholder,
}: FuzzyComboBoxProps) {
  const rootRef = useRef<HTMLLabelElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const matches = useMemo(
    () => getFuzzyMatches(options, value),
    [options, value],
  );

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        rootRef.current !== null &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(0);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  function selectOption(option: string) {
    onChange(option);
    setIsOpen(false);
    setHighlightedIndex(0);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
    setIsOpen(true);
    setHighlightedIndex(0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && ["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
      setIsOpen(true);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        Math.min(current + 1, Math.max(matches.length - 1, 0)),
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter" && isOpen && matches[highlightedIndex]) {
      event.preventDefault();
      selectOption(matches[highlightedIndex]);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <label className="combo-label" ref={rootRef}>
      {label}

      <div className="combo-box">
        <input
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
        />

        {isOpen && matches.length > 0 && (
          <div className="combo-menu">
            {matches.map((option, index) => (
              <button
                className={
                  index === highlightedIndex
                    ? "combo-option highlighted"
                    : "combo-option"
                }
                key={option}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}