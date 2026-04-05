import React from 'react';
import { CheckSquare, Square, Plus, Trash2, Trophy } from 'lucide-react';

export default function WeeklyTab({ db, setDb, currentWeek, triggerPopup, deleteTask }) {

    const addTask = (regId, type) => {
        const text = prompt(`Enter ${type} task name:`);
        if (!text) return;

        let target = 1;
        if (type === 'daily') {
            target = parseInt(prompt("Target days per week? (1-7)", "7")) || 1;
        }

        setDb(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const reg = next.regions.find(r => r.id === regId);

            // Update Template
            if (type === 'daily') reg.daily.push({ text, target });
            else if (type === 'weekly') reg.weekly.push({ text });
            else if (type === 'boss') reg.elite.push({ text });

            // Ensure History Entry exists
            if (!next.history[currentWeek]) next.history[currentWeek] = {};
            if (!next.history[currentWeek][regId]) {
                next.history[currentWeek][regId] = { daily: [], weekly: [] };
            }

            const h = next.history[currentWeek][regId];
            if (type === 'daily') h.daily.push(Array(7).fill(false));
            if (type === 'weekly') h.weekly.push(false);

            return next;
        });
    };

    const toggleDaily = (regId, tIdx, dIdx) => {
        setDb(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const h = next.history[currentWeek][regId];
            const task = next.regions.find(r => r.id === regId).daily[tIdx];

            h.daily[tIdx][dIdx] = !h.daily[tIdx][dIdx];

            // Check for Target Completion for Popup
            const count = h.daily[tIdx].filter(Boolean).length;
            if (h.daily[tIdx][dIdx] && count === task.target) {
                triggerPopup(task.text);
            }
            return next;
        });
    };

    const toggleWeekly = (regId, idx) => {
        setDb(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const h = next.history[currentWeek][regId];
            h.weekly[idx] = !h.weekly[idx];
            if (h.weekly[idx]) triggerPopup(next.regions.find(r => r.id === regId).weekly[idx].text);
            return next;
        });
    };

    const toggleBoss = (regId, idx) => {
        setDb(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            if (!next.bossCompletions[regId]) next.bossCompletions[regId] = [];
            const isDone = next.bossCompletions[regId].includes(idx);

            if (isDone) {
                next.bossCompletions[regId] = next.bossCompletions[regId].filter(i => i !== idx);
            } else {
                next.bossCompletions[regId].push(idx);
                triggerPopup(`BOSS: ${next.regions.find(r => r.id === regId).elite[idx].text}`);
            }
            return next;
        });
    };

    return (
        <div className="space-y-4">
            {db.regions.map(reg => (
                <div key={reg.id} className="border-2 border-[#3d3d3d] bg-[#1a1a1a] p-3 space-y-4">
                    <div className="flex justify-between border-b border-[#3d3d3d] pb-2">
                        <span className="font-bold uppercase text-[#ffb74d]">{reg.name}</span>
                        <div className="flex gap-1">
                            <button onClick={() => addTask(reg.id, 'daily')} className="text-[10px] border border-[#ff9800] px-2 py-1">+HABIT</button>
                            <button onClick={() => addTask(reg.id, 'weekly')} className="text-[10px] border border-[#00ff00] px-2 py-1">+WEEKLY</button>
                            <button onClick={() => addTask(reg.id, 'boss')} className="text-[10px] border border-[#a51c1c] px-2 py-1">+BOSS</button>
                        </div>
                    </div>

                    {/* Weekly Checklist */}
                    {reg.weekly.map((task, idx) => (
                        <div key={idx} className="flex items-center justify-between group py-1">
                            <div
                                onClick={() => toggleWeekly(reg.id, idx)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                {db.history[currentWeek]?.[reg.id]?.weekly?.[idx] ?
                                    <CheckSquare className="text-[#00ff00]" size={18} /> :
                                    <Square className="text-[#3d3d3d]" size={18} />
                                }
                                <span className={db.history[currentWeek]?.[reg.id]?.weekly?.[idx] ? 'text-[#00ff00]' : 'text-[#bfbfbf]'}>
                                    {task.text}
                                </span>
                            </div>

                            {/* THE TRASH CAN */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents accidental checking when deleting
                                    deleteTask(reg.id, 'weekly', idx);
                                }}
                                className="opacity-100 group-hover:opacity-100 text-[#a51c1c] hover:text-red-500 transition-opacity px-2"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Render Daily Habit Grids */}
                    {reg.daily.map((task, tIdx) => (
                        <div key={tIdx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>{task.text}</span>
                                <span className="text-[#5d5d5d]">{db.history[currentWeek]?.[reg.id]?.daily[tIdx]?.filter(Boolean).length || 0}/{task.target}</span>
                            </div>
                            <div className="flex gap-1">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => (
                                    <button key={dIdx} onClick={() => toggleDaily(reg.id, tIdx, dIdx)}
                                        className={`w-7 h-7 text-[10px] border ${db.history[currentWeek]?.[reg.id]?.daily[tIdx]?.[dIdx] ? 'bg-[#00ff00] text-black border-[#00ff00]' : 'border-[#3d3d3d] text-[#5d5d5d]'}`}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Boss/Elite Tasks */}
                    {reg.elite.map((task, idx) => (
                        <div key={idx} className="flex items-center justify-between group border-t border-[#2a2a2a] pt-2 mt-2">
                            <div onClick={() => toggleBoss(reg.id, idx)} className="flex items-center gap-2 cursor-pointer italic">
                                {db.bossCompletions[reg.id]?.includes(idx) ?
                                    <Trophy className="text-[#ff0000]" size={16} /> :
                                    <Square className="text-[#4a0000]" size={16} />
                                }
                                <span className={db.bossCompletions[reg.id]?.includes(idx) ? 'text-[#ff0000]' : 'text-[#5d5d5d]'}>
                                    {task.text}
                                </span>
                            </div>

                            {/* THE TRASH CAN */}
                            <button
                                onClick={() => deleteTask(reg.id, 'elite', idx)}
                                className="opacity-0 group-hover:opacity-100 text-[#a51c1c] transition-opacity px-2"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}