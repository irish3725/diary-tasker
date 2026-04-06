import React, { useState } from 'react';
import { useDiary } from './hooks/useDiary';
import OverallTab from './components/OverallTab';
import WeeklyTab from './components/WeeklyTab';
import QuestsTab from './components/QuestsTab';
import CollectionPopup from './components/CollectionPopup';
import { Download, Upload, LayoutDashboard, Calendar, Plus, Scroll } from 'lucide-react';

export default function App() {
  const {
    db, setDb, currentWeek, stats,
    questPoints, deleteTask, deleteRegion,
    addQuest, addQuestTask, toggleQuestTask,
    deleteQuest, totalPossiblePoints
  } = useDiary();
  const [activeTab, setActiveTab] = useState('overall');
  const [popupText, setPopupText] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const addRegion = () => {
    const name = prompt("New Region Name:");
    if (name) setDb(p => ({ ...p, regions: [...p.regions, { id: Date.now().toString(), name, daily: [], weekly: [], elite: [] }] }));
  };

  // FIX: Moved exportData and importData inside the component, before the return statement
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "diary_tasker_backup.json");
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
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be re-imported if needed
    event.target.value = '';
  };

  return (
    <div className="min-h-screen p-4 text-[#ff9800] font-osrs bg-[#0a0a0a]">

      {popupText && (
        <CollectionPopup
          text={popupText}
          onClose={() => setPopupText(null)}
        />
      )}

      <div className="max-w-md mx-auto rs-stone bg-[#2a2a2a] border-4 border-[#3d3d3d]">
        {/* FIX: Tab bar now includes functional export/import/add-region buttons */}
        <div className="flex bg-[#3d3d3d] border-b-4 border-[#111]">
          <button
            onClick={() => setActiveTab('overall')}
            className={`flex-1 p-4 flex justify-center gap-2 ${activeTab === 'overall' ? 'bg-[#1a1a1a] text-[#00ff00]' : ''}`}
          >
            <LayoutDashboard size={20} /> OVERALL
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 p-4 flex justify-center gap-2 ${activeTab === 'weekly' ? 'bg-[#1a1a1a] text-[#00ff00]' : ''}`}
          >
            <Calendar size={20} /> WEEKLY
          </button>
          <button
            onClick={() => setActiveTab('quests')}
            className={`flex-1 p-4 flex justify-center gap-2 ${activeTab === 'quests' ? 'bg-[#1a1a1a] text-[#ffb74d]' : ''}`}
          >
            <Scroll size={20} /> QUESTS
          </button>

          {/* Action buttons — now wired up and inside the return */}
          <div className="relative flex items-center border-l border-[#111]">
            <button
              onClick={() => setShowMenu(p => !p)}
              className="p-4 hover:text-white"
              title="Options"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-[#2a2a2a] border-2 border-[#3d3d3d] text-sm min-w-[140px]">
                <button
                  onClick={() => { exportData(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#3d3d3d] hover:text-white"
                >
                  <Download size={14} /> Export
                </button>
                <label className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#3d3d3d] hover:text-white cursor-pointer">
                  <Upload size={14} /> Import
                  <input type="file" className="hidden" onChange={(e) => { importData(e); setShowMenu(false); }} accept=".json" />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 max-h-[80vh] overflow-y-auto">
          {activeTab === 'overall' && (
            <OverallTab
              stats={stats}
              deleteRegion={deleteRegion}
              questPoints={questPoints}
              totalPossiblePoints={totalPossiblePoints}
              totalQuests={db.quests.length}
              addRegion={addRegion}
            />
          )}
          {activeTab === 'weekly' && (
            <WeeklyTab
              db={db}
              setDb={setDb}
              currentWeek={currentWeek}
              triggerPopup={(txt) => setPopupText(txt)}
              deleteTask={deleteTask}
            />
          )}
          {activeTab === 'quests' && (
            <QuestsTab
              quests={db.quests}
              addQuest={addQuest}
              addQuestTask={addQuestTask}
              toggleQuestTask={toggleQuestTask}
              deleteQuest={deleteQuest}
              triggerPopup={(txt) => setPopupText(txt)}
              questPoints={questPoints}
              totalPossiblePoints={totalPossiblePoints}
            />
          )}
        </div>
      </div>
    </div>
  );
}