import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function OverallTab({ stats }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-3">
      {stats.map(reg => (
        <div key={reg.id} className="border-2 border-[#3d3d3d] bg-[#1a1a1a] p-3 cursor-pointer" onClick={() => setExpanded(expanded === reg.id ? null : reg.id)}>
          <div className="flex justify-between mb-2 font-bold uppercase text-sm">
            <span>{reg.name}</span>
            {expanded === reg.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </div>
          {/* THE 4 SEGMENT BAR */}
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