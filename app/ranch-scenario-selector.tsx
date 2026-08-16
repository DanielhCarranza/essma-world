"use client";

import { ranchScenarios, RanchScenarioId } from "./lib/game-catalog";

type ScenarioSelectorProps = {
  activeScenarioId: RanchScenarioId;
  onSelectScenario: (scenarioId: RanchScenarioId) => void;
};

export default function RanchScenarioSelector({
  activeScenarioId,
  onSelectScenario,
}: ScenarioSelectorProps) {
  return (
    <div
      tabIndex={-1}
      role="region"
      aria-label="Seleccionar escenario del rancho"
      className="ranch-scenario-selector flex items-center justify-center gap-2 px-3 py-2 bg-[#75412b]/90 backdrop-blur-sm rounded-full border-2 border-[#ffe9bd] shadow-lg"
    >
      <span className="text-xs font-bold text-[#fff7e7] uppercase tracking-wider hidden sm:inline px-2">
        Escenario:
      </span>
      {ranchScenarios.map((scenario) => {
        const isSelected = scenario.id === activeScenarioId;
        const name = scenario.locale["es-MX"].name;
        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelectScenario(scenario.id)}
            aria-pressed={isSelected}
            aria-label={`Cambiar fondo a ${name}`}
            className={`group relative flex items-center gap-2 min-w-[44px] min-h-[44px] px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#ffe9bd] ${
              isSelected
                ? "bg-[#d75b45] text-white border-[#ffe9bd] shadow-md scale-105"
                : "bg-[#5c3220]/80 text-[#ffe9bd] border-transparent hover:bg-[#6e3c27] hover:border-[#f3c77c]"
            }`}
          >
            <img
              src={scenario.asset.thumbnailPath}
              alt=""
              aria-hidden="true"
              className="w-6 h-6 rounded-full object-cover border border-[#ffe9bd]/50 group-hover:scale-110 transition-transform"
            />
            <span className="truncate max-w-[90px]">{name}</span>
          </button>
        );
      })}
    </div>
  );
}
