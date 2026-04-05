import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function OverallTab({ stats, deleteRegion, questPoints, totalQuests, totalPossiblePoints }) { // 1. Added deleteRegion here
  const [expanded, setExpanded] = useState(null);
  const questPercent = totalPossiblePoints > 0
    ? (questPoints / totalPossiblePoints) * 100
    : 0;
  const isFullyComplete = questPercent >= 100 && totalPossiblePoints > 0;

  return (<div className="space-y-4">
    {/* GLOBAL QUEST POINTS TRACKER */}
    <div className="border-2 border-[#3d3d3d] bg-[#0d0d0d] p-3 mb-4 rs-stone">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[#ffff00] font-bold text-xs uppercase flex items-center gap-2">
          Quest Points: <span className="text-white">{questPoints} / {totalPossiblePoints}</span>
        </span>
        <span className="text-[10px] text-[#5d5d5d] italic">
          {totalQuests} ACTIVE QUESTS
        </span>
      </div>

      {/* Quest Progress Bar */}
      <div className="h-2 bg-black border border-[#3d3d3d] p-[1px]">
        <div
          className={`h-full transition-all duration-1000 ${isFullyComplete
              ? 'bg-[#00ff00] shadow-[0_0_10px_#00ff00]' // Green Glow
              : 'bg-[#ffff00] shadow-[0_0_8px_#ffff00]'   // Yellow Glow
            }`}
          style={{ width: `${questPercent}%` }}
        />
      </div>
    </div>

    {stats.map(reg => (
      <div key={reg.id} className="border-2 border-[#3d3d3d] bg-[#1a1a1a] p-3">

        {/* HEADER SECTION - Now handles its own clicks */}
        <div className="flex justify-between items-center mb-2 font-bold uppercase text-sm">
          <span
            className="cursor-pointer flex-grow hover:text-[#ffb74d]"
            onClick={() => setExpanded(expanded === reg.id ? null : reg.id)}
          >
            {reg.name}
          </span>

          <div className="flex items-center gap-3">
            {/* THE TRASH CAN */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevents the card from expanding when you delete
                deleteRegion(reg.id);
              }}
              className="text-[#a51c1c] hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>

            {/* TOGGLE ICON */}
            <div
              className="cursor-pointer"
              onClick={() => setExpanded(expanded === reg.id ? null : reg.id)}
            >
              {expanded === reg.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>

        {/* THE 4 SEGMENT BAR (Remains the same) */}
        <div className="grid grid-cols-4 gap-1 h-6 bg-black border border-[#3d3d3d] p-[2px]">
          {[reg.easy, reg.med, reg.hard, reg.elite].map((v, i) => (
            <div key={i} className="bg-[#0d0d0d] relative overflow-hidden border border-[#1a1a1a]">
              <div
                className={`h-full transition-all duration-1000 ${v >= 100 ? 'bg-[#00ff00]' : v > 0 ? 'bg-[#ff9800]' : 'bg-[#4a0000]'}`}
                style={{ width: `${v || 0}%` }}
              />
            </div>
          ))}
        </div>

        {/* EXPANDED TEXT (Remains the same) */}
        {expanded === reg.id && (
          <div className="mt-2 text-[10px] text-[#5d5d5d] border-t border-[#2a2a2a] pt-2 grid grid-cols-2 gap-2 uppercase">
            <div>Easy: {Math.round(reg.easy)}%</div>
            <div>Med: {Math.round(reg.med)}%</div>
            <div>Hard: {Math.round(reg.hard)}%</div>
            <div>Elite: {Math.round(reg.elite)}%</div>
          </div>
        )}
      </div>
    ))}
  </div>
  );
}