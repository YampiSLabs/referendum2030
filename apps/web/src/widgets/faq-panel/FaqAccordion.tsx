import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS, FAQ_CATEGORIES } from "./faq-data";

export default function FaqAccordion() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredItems = FAQ_ITEMS.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="grid gap-8">
      {/* Category Tab Filter Navigation */}
      <nav aria-label="Filtre de categories de FAQ" className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => {
            setActiveCategory("all");
            setExpandedIndex(null);
          }}
          className={`font-outfit text-xs font-black uppercase tracking-wider py-2.5 px-5 rounded-full border-2 cursor-pointer transition-all duration-200 ${
            activeCategory === "all"
              ? "bg-brand-red border-brand-red text-white shadow-md shadow-brand-red/10"
              : "border-line text-muted hover:border-brand-red hover:text-brand-red bg-white"
          }`}
          aria-pressed={activeCategory === "all"}
        >
          Tots els temes
        </button>

        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
              setExpandedIndex(null);
            }}
            className={`font-outfit text-xs font-black uppercase tracking-wider py-2.5 px-5 rounded-full border-2 cursor-pointer transition-all duration-200 ${
              activeCategory === cat.id
                ? "bg-brand-red border-brand-red text-white shadow-md shadow-brand-red/10"
                : "border-line text-muted hover:border-brand-red hover:text-brand-red bg-white"
            }`}
            aria-pressed={activeCategory === cat.id}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Accordion List */}
      <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
        {filteredItems.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          const globalId = `faq-${activeCategory}-${idx}`;

          return (
            <article
              key={globalId}
              className={`panel border bg-white overflow-hidden transition-all duration-300 ${
                isExpanded ? "border-brand-gold/65 shadow-md shadow-brand-gold/5" : "border-line"
              }`}
            >
              <button
                type="button"
                id={`${globalId}-trigger`}
                aria-expanded={isExpanded}
                aria-controls={`${globalId}-content`}
                onClick={() => toggleAccordion(idx)}
                className="w-full text-left py-4.5 px-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <span className="font-outfit text-sm font-black text-gray-900 group-hover:text-brand-red leading-snug">
                  {item.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-brand-red transition-transform duration-300 shrink-0 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              <div
                id={`${globalId}-content`}
                role="region"
                aria-labelledby={`${globalId}-trigger`}
                className={`transition-all duration-300 ease-in-out ${
                  isExpanded ? "max-h-72 opacity-100 border-t border-line/60" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                <div className="py-4.5 px-6 text-xs text-muted leading-relaxed font-semibold">
                  {item.answer}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
