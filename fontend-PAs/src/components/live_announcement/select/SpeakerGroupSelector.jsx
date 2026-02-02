import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import CreatespeakerModal from '../../speaker/createspeakergroups.jsx';
import { getSpeakerGroups } from '../../../api/speakerapi';
import { usePlaylistStore } from '../../../store/playlistStore';

const SpeakerGroupSelector = ({ selectedTab = 'live' }) => {
  const [speakerGroups, setSpeakerGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);

  const { 
    selectedGroupId, 
    checkedSpeakers, 
    setSelectedGroupId, 
    setCheckedSpeakers,
    selectedPlaylistId,
    isPlaylistPlaying,
    selectedPlaylistForApi
  } = usePlaylistStore();

  const checkedSpeakersSet = checkedSpeakers instanceof Set ? checkedSpeakers : new Set(Array.isArray(checkedSpeakers) ? checkedSpeakers : []);

const isDisabled = selectedTab === 'playlist' 
  && isPlaylistPlaying 
  && selectedPlaylistId === selectedPlaylistForApi;

  useEffect(() => {
    setIsLoading(true);
    getSpeakerGroups()
      .then(res => {
        const groups = res.data?.data || [];
        setSpeakerGroups(groups);
        if (!selectedGroupId && groups.length > 0) {
          const defaultGroup = groups.find(g => g.id === "4") || groups[0];
          setSelectedGroupId(String(defaultGroup.id));
        }
      })
      .catch(() => setSpeakerGroups([]))
      .finally(() => setIsLoading(false));
  }, [selectedGroupId, setSelectedGroupId]);

  const selectedGroup = speakerGroups.find(g => String(g.id) === String(selectedGroupId));
  const displaySpeakers = selectedGroup ? selectedGroup.speakers : [];

  // Sync checked speakers when group changes
  useEffect(() => {
    if (!selectedGroup || isDisabled) return;
    const allSpeakers = new Set(selectedGroup.speakers.map(s => s.id));
    setCheckedSpeakers(allSpeakers);
  }, [selectedGroup, isDisabled, setCheckedSpeakers]);

  const handleDropdownChange = (e) => {
    if (isDisabled) return;
    const newGroupId = e.target.value;
    setSelectedGroupId(newGroupId);
    const newGroup = speakerGroups.find(g => String(g.id) === newGroupId);
    if (newGroup) setCheckedSpeakers(new Set(newGroup.speakers.map(s => s.id)));
  };

  const handleCheckboxChange = (speakerId) => {
    if (isDisabled) return;
    const newSet = new Set(checkedSpeakersSet);
    newSet.has(speakerId) ? newSet.delete(speakerId) : newSet.add(speakerId);
    setCheckedSpeakers(newSet);
  };

  return (
    <div className="h-full bg-[#EFF0F2] rounded-xl border border-gray-200 p-4 flex flex-col min-h-0 shadow-lg">
      <div className="flex justify-between items-center mb-2 flex-shrink-0">
        <label className="block text-md text-left font-medium text-gray-800 prompt-bold">เลือกกลุ่มลำโพง</label>
        <button
          onClick={() => setShowSpeakerModal(true)}
          disabled={isDisabled}
          className={`group items-center justify-center rounded-full p-[2px] ${isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA]'}`}
        >
          <div className={`text-sm px-2 py-0.5 rounded-full ${isDisabled ? 'text-gray-400' : 'bg-[#EFF0F2] text-[#AD7CE1]'} prompt-regular`}>
            สร้างกลุ่มลำโพง
          </div>
        </button>
        <CreatespeakerModal isOpen={showSpeakerModal} onClose={() => setShowSpeakerModal(false)} />
      </div>

      <div className="relative mb-3 flex-shrink-0">
        <select
          value={selectedGroupId || ''}
          onChange={handleDropdownChange}
          disabled={isDisabled}
          className={`text-xs w-full px-3 py-2 border rounded-xl focus:outline-none pr-10 ${isDisabled ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] bg-white'} prompt-regular appearance-none`}
        >
          {speakerGroups.map(g => (
            <option key={g.id} value={g.id}>{g.group_name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      </div>

      <div className="flex-1 bg-white rounded-xl min-h-0 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="text-center text-gray-400 text-xs pt-8">กำลังโหลดลำโพง...</div>
        ) : displaySpeakers.length === 0 ? (
          <div className="text-center text-gray-400 text-xs pt-8">ไม่พบลำโพงในกลุ่มนี้</div>
        ) : displaySpeakers.map(speaker => (
          <div key={speaker.id || speaker.name} className="bg-white px-3 py-2 border-b border-gray-200 last:border-b-0 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={checkedSpeakersSet.has(speaker.id)}
                onChange={() => handleCheckboxChange(speaker.id)}
                disabled={isDisabled}
                className={`w-4 h-4 border-gray-400 rounded focus:ring-gray-300 ${isDisabled ? 'cursor-not-allowed opacity-60' : 'accent-purple-400'}`}
              />
              <div className='text-left'>
                <span className="text-xs text-gray-800 prompt-regular font-medium">{speaker.name}</span>
                {speaker.speaker_code && <div className="text-xs text-gray-500">{speaker.speaker_code}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isDisabled && (
        <div className="mt-4 text-xs text-red-700 text-center prompt-regular">ไม่สามารถเปลี่ยนลำโพงได้ขณะกำลังเล่น Playlist</div>
      )}
    </div>
  );
};

export default SpeakerGroupSelector;
