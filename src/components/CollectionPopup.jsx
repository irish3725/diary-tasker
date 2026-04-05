import React, { useEffect } from 'react';
import { Trophy } from 'lucide-react';

export default function CollectionPopup({ text, onClose }) {
  // Auto-close after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none">
      <div 
        className="animate-rs-popup pointer-events-auto cursor-pointer"
        onClick={onClose}
      >
        {/* Main Box */}
        <div className="rs-stone p-1 border-2 border-[#3d3d3d] bg-[#2a2418] shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <div className="border border-[#4d4232] p-6 flex flex-col items-center gap-4 rs-shine-effect">
            
            {/* Header Area */}
            <div className="flex flex-col items-center">
              <h2 className="text-[#ff9800] text-2xl font-bold tracking-widest uppercase italic drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                Diary Task Completed!
              </h2>
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#4d4232] to-transparent mt-1" />
            </div>

            {/* Achievement Icon / Text */}
            <div className="flex items-center gap-4 py-2">
              <div className="p-3 bg-black/40 rounded-full border border-[#3d3d3d] text-[#00ff00]">
                <Trophy size={32} />
              </div>
              <div className="max-w-[200px]">
                <p className="text-[#00ff00] text-xl leading-tight font-bold italic drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                  {text}
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className="text-[10px] text-[#5d5d5d] uppercase tracking-[0.2em] font-bold">
              Achievement Unlocked
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}