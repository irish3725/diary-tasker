import { useState, useEffect, useMemo } from 'react';

export const useDiary = () => {
    const [db, setDb] = useState(() => {
        const saved = localStorage.getItem('osrs_life_v9');
        const parsed = saved ? JSON.parse(saved) : { regions: [], history: {}, bossCompletions: {} };

        return {
            regions: parsed.regions || [],
            history: parsed.history || {},
            bossCompletions: parsed.bossCompletions || {},
            quests: parsed.quests || []
        };
    });

    useEffect(() => { localStorage.setItem('osrs_life_v9', JSON.stringify(db)); }, [db]);

    const currentWeek = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        return `${d.getFullYear()}-W${Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 86400000) + 1) / 7)}`;
    }, []);

    // Centralized "Smart" Calculator
    const stats = useMemo(() => {
        const historyKeys = Object.keys(db.history).sort().reverse();
        const past4 = historyKeys.slice(0, 4).length > 0 ? historyKeys.slice(0, 4) : [currentWeek];
        const divisor = Math.max(past4.length, 1);

        return db.regions.map(reg => {
            let dSum = 0, wSum = 0;
            past4.forEach(wk => {
                const h = db.history[wk]?.[reg.id] || { daily: [], weekly: [] };
                const dDone = reg.daily.filter((t, i) => (h.daily[i]?.filter(Boolean).length || 0) >= t.target).length;
                const wDone = h.weekly?.filter(Boolean).length || 0;
                dSum += (dDone / (reg.daily.length || 1));
                wSum += (wDone / (reg.weekly.length || 1));
            });

            const bDone = db.bossCompletions[reg.id]?.length || 0;
            const easy = (dSum / divisor) * 100;
            const med = (wSum / divisor) * 100;

            return {
                id: reg.id, name: reg.name,
                easy, med, hard: (easy + med) / 2,
                elite: (bDone / (reg.elite.length || 1)) * 100
            };
        });
    }, [db, currentWeek]);

    const addQuest = (name) => {
        setDb(prev => ({
            ...prev,
            quests: [...prev.quests, { id: Date.now(), name, tasks: [], completed: false }]
        }));
    };

    const addQuestTask = (questId, taskText) => {
        setDb(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const quest = next.quests.find(q => q.id === questId);
            quest.tasks.push({ text: taskText, done: false });
            return next;
        });
    };

    const toggleQuestTask = (questId, taskIdx) => {
        setDb(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const quest = next.quests.find(q => q.id === questId);
            const task = quest.tasks[taskIdx];

            task.done = !task.done;

            // Check if ALL tasks are now done
            const allDone = quest.tasks.every(t => t.done);
            if (allDone && !quest.completed) {
                quest.completed = true;
                triggerPopup(`QUEST COMPLETE: ${quest.name}`);
            } else if (!allDone) {
                quest.completed = false;
            }

            return next;
        });
    };

    const deleteRegion = (regId) => {
        if (window.confirm("Danger: This will delete the entire region and all historical progress. Proceed?")) {
            setDb(prev => {
                const next = JSON.parse(JSON.stringify(prev));

                // 1. Remove the region template
                next.regions = next.regions.filter(r => r.id !== regId);

                // 2. Wipe history for this specific ID across all stored weeks
                Object.keys(next.history).forEach(weekKey => {
                    if (next.history[weekKey][regId]) {
                        delete next.history[weekKey][regId];
                    }
                });

                // 3. Wipe boss completion records
                if (next.bossCompletions[regId]) {
                    delete next.bossCompletions[regId];
                }

                return next;
            });
        }
    };

    const deleteTask = (regId, type, index) => {
        setDb(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const reg = next.regions.find(r => r.id === regId);
            reg[type].splice(index, 1);

            // Also clean up history for this week so indices stay aligned
            if (next.history[currentWeek]?.[regId]) {
                if (type === 'daily') next.history[currentWeek][regId].daily.splice(index, 1);
                if (type === 'weekly') next.history[currentWeek][regId].weekly.splice(index, 1);
            }
            return next;
        });
    };

    return { db, setDb, currentWeek, stats, deleteTask, deleteRegion };
};