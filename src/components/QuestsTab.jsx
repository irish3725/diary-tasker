import React, { useState } from 'react';
import { Scroll, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

export default function QuestsTab({
    quests, addQuest, addQuestTask, toggleQuestTask,
    deleteQuest, deleteQuestTask, triggerPopup, questPoints, totalPossiblePoints
}) {
    const [activeQuest, setActiveQuest] = useState(null);
    const questPercent = totalPossiblePoints > 0 ? (questPoints / totalPossiblePoints) * 100 : 0;
    const isFullyComplete = questPercent >= 100 && totalPossiblePoints > 0;

    return (
        <div className="space-y-4">
            <div className="border-2 border-[#3d3d3d] bg-[#0d0d0d] p-3 mb-4">
                <div className="flex justify-between items-center mb-1 text-[10px] uppercase font-bold">
                    <span className={isFullyComplete ? "text-[#00ff00]" : "text-[#ffff00]"}>
                        Quest Points: {questPoints} / {totalPossiblePoints}
                    </span>
                    <span className="text-[#5d5d5d]">
                        {Math.round(questPercent)}% COMPLETE
                    </span>
                </div>

                <div className="h-2 bg-black border border-[#3d3d3d] p-[1px]">
                    <div
                        className={`h-full transition-all duration-1000 ${isFullyComplete ? 'bg-[#00ff00] shadow-[0_0_8px_#00ff00]' : 'bg-[#ffff00] shadow-[0_0_8px_#ffff00]'}`}
                        style={{ width: `${questPercent}%` }}
                    />
                </div>
            </div>

            <button
                onClick={() => {
                    const name = prompt("Quest Name:");
                    if (name) addQuest(name);
                }}
                className="w-full border-2 border-dashed border-[#3d3d3d] p-3 text-[#5d5d5d] hover:text-[#ffb74d] hover:border-[#ffb74d] transition-colors flex items-center justify-center gap-2 uppercase font-bold text-xs"
            >
                <Plus size={16} /> Start New Quest
            </button>

            <div className="grid gap-2">
                {quests.map((quest) => (
                    <div key={quest.id} className="border-2 border-[#3d3d3d] bg-[#1a1a1a] overflow-hidden">
                        {/* Quest Header */}
                        <div className="p-3 flex justify-between items-center">
                            <div
                                onClick={() => setActiveQuest(activeQuest === quest.id ? null : quest.id)}
                                className="flex items-center gap-3 cursor-pointer flex-grow"
                            >
                                <Scroll size={18} className={quest.completed ? "text-[#00ff00]" : "text-[#ffff00]"} />
                                <span className={`font-bold ${quest.completed ? "text-[#00ff00]" : "text-[#ffff00]"}`}>
                                    {quest.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-[#5d5d5d]">
                                    {quest.tasks.filter(t => t.done).length}/{quest.tasks.length} STEPS
                                </span>
                                {/* Quest-level delete button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteQuest(quest.id);
                                    }}
                                    className="text-[#a51c1c] hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Quest Tasks (Dropdown) */}
                        {activeQuest === quest.id && (
                            <div className="p-3 border-t border-[#3d3d3d] bg-[#0d0d0d] space-y-3">
                                {quest.tasks.map((task, idx) => (
                                    // FIX: Each task row now has its own delete button
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div
                                            // FIX: triggerPopup is now passed as the 3rd argument so quest completion popup fires
                                            onClick={() => toggleQuestTask(quest.id, idx, triggerPopup)}
                                            className="flex items-center gap-2 cursor-pointer flex-grow"
                                        >
                                            {task.done
                                                ? <CheckCircle2 size={16} className="text-[#00ff00]" />
                                                : <Circle size={16} className="text-[#3d3d3d]" />
                                            }
                                            <span className={task.done ? "text-[#5d5d5d] line-through" : "text-[#bfbfbf]"}>
                                                {task.text}
                                            </span>
                                        </div>
                                        {/* FIX: Individual task delete button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteQuestTask(quest.id, idx);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 text-[#a51c1c] hover:text-red-500 transition-opacity px-2"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() => {
                                        const t = prompt("Next step in the quest:");
                                        if (t) addQuestTask(quest.id, t);
                                    }}
                                    className="text-[10px] text-[#ffb74d] hover:underline flex items-center gap-1"
                                >
                                    <Plus size={12} /> ADD STEP
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}