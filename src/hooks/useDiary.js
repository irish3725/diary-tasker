import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export const useDiary = () => {
    const [db, setDb] = useState({ regions: [], history: {}, bossCompletions: {}, quests: [] });
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load session and data on mount
    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserId(session.user.id);
                const { data } = await supabase
                    .from('diary_data')
                    .select('data')
                    .eq('user_id', session.user.id)
                    .maybeSingle();
                if (data) setDb(data.data);
                setIsLoaded(true);
            }
            if (!session) setIsLoaded(true);
            setLoading(false);
        };
        init();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    // Save to Supabase whenever db changes
    useEffect(() => {
        if (!userId || !isLoaded) return;
        const save = async () => {
            const { error } = await supabase
                .from('diary_data')
                .upsert({ user_id: userId, data: db });
            if (error) console.error('Supabase save error:', error);
        };
        save();
    }, [db, userId, isLoaded]);

    const currentWeek = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        return `${d.getFullYear()}-W${Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 86400000) + 1) / 7)}`;
    }, []);

    const questPoints = useMemo(() => {
        return (db.quests || []).reduce((acc, q) => acc + (q.tasks?.filter(t => t.done).length || 0), 0);
    }, [db.quests]);

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

    const toggleQuestTask = (questId, taskIdx, triggerPopup) => { // 1. Pass triggerPopup as an arg
        setDb(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const quest = next.quests.find(q => q.id === questId);
            if (!quest) return prev;

            const task = quest.tasks[taskIdx];
            task.done = !task.done;

            // Check if ALL tasks are now done
            const allDone = quest.tasks.length > 0 && quest.tasks.every(t => t.done);

            if (allDone && !quest.completed) {
                quest.completed = true;
                // 2. Safety check: only call if it exists
                if (triggerPopup) triggerPopup(`QUEST COMPLETE: ${quest.name}`);
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
            // 1. Create a deep copy to avoid React state mutation bugs
            const next = JSON.parse(JSON.stringify(prev));

            // 2. Remove from the "Master Template" (The Regions Tab)
            const reg = next.regions.find(r => r.id === regId);
            if (reg && reg[type]) {
                reg[type].splice(index, 1);
            }

            // 3. Remove from the "Current Week" (The Weekly Tab)
            // We use optional chaining (?.) to ensure we don't crash if the week doesn't exist yet
            const currentWeekHistory = next.history[currentWeek]?.[regId];

            if (currentWeekHistory && currentWeekHistory[type]) {
                currentWeekHistory[type].splice(index, 1);
            }

            return next;
        });
    };

    const deleteQuest = (questId) => {
        if (window.confirm("Delete this quest?")) {
            setDb(prev => ({
                ...prev,
                quests: prev.quests.filter(q => q.id !== questId)
            }));
        }
    };

    const questStats = useMemo(() => {
        const quests = db.quests || [];

        const current = quests.reduce((acc, q) =>
            acc + (q.tasks?.filter(t => t.done).length || 0), 0
        );

        const total = quests.reduce((acc, q) =>
            acc + (q.tasks?.length || 0), 0
        );

        return { current, total };
    }, [db.quests]);


    return {
        db,
        setDb,
        currentWeek,
        stats,
        deleteTask,
        deleteRegion,
        addQuest,
        addQuestTask,
        toggleQuestTask,
        deleteQuest,
        questPoints: questStats.current,
        totalPossiblePoints: questStats.total,
        loading, userId
    };
};