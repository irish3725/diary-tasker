import React, { useState } from 'react';
import { useDiary } from './hooks/useDiary';
import OverallTab from './components/OverallTab';
import WeeklyTab from './components/WeeklyTab';
import CollectionPopup from './components/CollectionPopup'; // New Import
import { Download, Upload, Trash2, LayoutDashboard, Calendar, Plus, Trophy } from 'lucide-react';

export default function App() {
  const { db, setDb, currentWeek, stats, deleteTask } = useDiary();
  const [activeTab, setActiveTab] = useState('overall');
  const [popupText, setPopupText] = useState(null); // Just store the string

  const addRegion = () => {
    const name = prompt("New Region Name:");
    if (name) setDb(p => ({ ...p, regions: [...p.regions, { id: Date.now().toString(), name, daily: [], weekly: [], elite: [] }] }));
  };

  return (
    <div className="min-h-screen p-4 text-[#ff9800] font-osrs bg-[#0a0a0a]">

      {/* RENDER POPUP IF TEXT EXISTS */}
      {popupText && (
        <CollectionPopup
          text={popupText}
          onClose={() => setPopupText(null)}
        />
      )}

      <div className="max-w-md mx-auto rs-stone bg-[#2a2a2a] border-4 border-[#3d3d3d]">
        <div className="flex bg-[#3d3d3d] border-b-4 border-[#111]">
          <button onClick={() => setActiveTab('overall')} className={`flex-1 p-4 flex justify-center gap-2 ${activeTab === 'overall' ? 'bg-[#1a1a1a] text-[#00ff00]' : ''}`}>
            <LayoutDashboard size={20} /> OVERALL
          </button>
          <button onClick={() => setActiveTab('weekly')} className={`flex-1 p-4 flex justify-center gap-2 ${activeTab === 'weekly' ? 'bg-[#1a1a1a] text-[#00ff00]' : ''}`}>
            <Calendar size={20} /> WEEKLY
          </button>
          <button onClick={addRegion} className="p-4 border-l border-[#111] hover:text-white"><Plus /></button>
        </div>

        <div className="p-3 max-h-[80vh] overflow-y-auto">
          {activeTab === 'overall' ? (
            <OverallTab stats={stats} />
          ) : (
            <WeeklyTab
              db={db}
              setDb={setDb}
              currentWeek={currentWeek}
              triggerPopup={(txt) => setPopupText(txt)}
              deleteTask={deleteTask} // 2. Pass it down here!
            />
          )}
        </div>
      </div>
    </div>
  );

  // Inside your App component:
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "osrs_diary_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setDb(json);
        alert("Backup restored successfully!");
      } catch (err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  // Add these buttons near your "Add Region" (+) button:
  <div className="flex bg-[#3d3d3d] border-b-4 border-[#111] items-center">
    {/* ... existing tabs ... */}
    <div className="flex border-l border-[#111]">
      <button onClick={exportData} className="p-3 hover:text-white"><Download size={18} /></button>
      <label className="p-3 hover:text-white cursor-pointer">
        <Upload size={18} />
        <input type="file" className="hidden" onChange={importData} accept=".json" />
      </label>
      <button onClick={addRegion} className="p-3 hover:text-white border-l border-[#111]"><Plus size={18} /></button>
    </div>
  </div>
}