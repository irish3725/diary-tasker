import { useState, useEffect, useMemo } from 'react';

export const useDiary = () => {
    const [db, setDb] = useState(() => {
        const saved = localStorage.getItem('osrs_life_v9');
        return saved ? JSON.parse(saved) : { regions: [], history: {}, bossCompletions: {} };
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

    // Add this inside your useDiary return object in useDiary.js
    const deleteRegion = (id) => {
        if (window.confirm("Delete this entire region?")) {
            setDb(prev => ({ ...prev, regions: prev.regions.filter(r => r.id !== id) }));
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

    return { db, setDb, currentWeek, stats, deleteTask };
};