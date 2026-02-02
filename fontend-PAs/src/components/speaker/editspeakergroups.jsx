import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import editpurple from "../../assets/edit-purple.png";
import megaphonewhite from "../../assets/megaphone-gray.png";
import { getAllSpeakers, updateSpeakerGroup } from "../../api/speakerapi";

const EditspeakerModal = ({ isOpen, onClose, group, onSave }) => {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpeakers, setSelectedSpeakers] = useState({});
  const [allSpeakers, setAllSpeakers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getAllSpeakers()
      .then((res) => { if (res.data?.data) setAllSpeakers(res.data.data) })
      .catch(() => setAllSpeakers([]));
  }, [isOpen]);

  useEffect(() => {
    if (!group) return;
    setGroupName(group.group_name || "");
    const selected = {};
    if (group.speakers && Array.isArray(group.speakers)) {
      group.speakers.forEach((sp) => {
        selected[sp.id] = true;
      });
    }
    setSelectedSpeakers(selected);
  }, [group]);

  const handleSpeakerToggle = (speakerId) => {
    setSelectedSpeakers((prev) => ({ ...prev, [speakerId]: !prev[speakerId] }));
  };

  const filteredSpeakers = allSpeakers.filter((speaker) =>
    speaker.speaker_name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

 const handleSave = async () => {
  const selectedSpeakerIds = allSpeakers
    .filter(sp => selectedSpeakers[sp.id])
    .map(sp => sp.id);
  const payload = { id: group.id, group_name: groupName, speaker_id: selectedSpeakerIds };
  try {
    await updateSpeakerGroup(payload);
    onSave({
      ...group,
      group_name: groupName,
      speakers: allSpeakers.filter(sp => selectedSpeakers[sp.id]),
      speaker_count: selectedSpeakerIds.length
    });
    onClose();
  } catch (err) {
    console.error("❌ Update group error:", err);
    alert("เกิดข้อผิดพลาดในการอัปเดตกลุ่มลำโพง");
  }
};
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center mb-1">
            <img src={editpurple} alt="Stop" className="w-5 h-5" />
            <h2 className="text-2xl font-semibold text-gray-800 prompt-bold ml-4">
              แก้ไขกลุ่มลำโพง
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500 cursor-pointer" />
          </button>
        </div>

        {/* Body */}
        <div className="p-10 pt-1 pb-1 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Group Name */}
          <div className="mb-6">
            <label className="block text-md text-left font-medium text-gray-700 mb-1 prompt-bold">
              ชื่อกลุ่ม <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="เช่น Blue Room"
              required
              className="w-full px-4 py-2.5 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] text-sm prompt-regular"
            />
          </div>

          {/* เลือกลำโพง */}
          <div className="mb-6">
            <div className="flex items-center justify-between pb-5">
              <h3 className="text-md font-bold text-gray-800 prompt-bold">
                เลือกลำโพง
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาลำโพง...."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-1.5 bg-white border border-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular"
                />
                <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Speakers Grid */}
            <div className="grid grid-cols-2 bg-[#E6E9EC] gap-3 max-h-88 overflow-y-auto p-5 rounded-xl">
              {filteredSpeakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="flex items-center p-3 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-xl cursor-pointer"
                  onClick={() => handleSpeakerToggle(speaker.id)}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedSpeakers[speaker.id]}
                    onChange={() => handleSpeakerToggle(speaker.id)}
                    className="form-checkbox accent-[#A07EDF] w-5 h-5 mr-4 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg flex items-center justify-center border border-gray-400">
                    <img
                      src={megaphonewhite}
                      alt="music"
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-left ml-2 text-gray-800 prompt-regular text-sm">
                      {speaker.speaker_name}
                    </div>
                    <div
                      className={`text-xs text-left ml-2 prompt-regular ${
                        speaker.is_online ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {speaker.is_online ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 p-6 pt-0 bg-white">
          <button
            onClick={onClose}
            className="px-10 py-3 text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 shadow-xl transition prompt-bold cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-15 py-3 bg-gradient-to-r from-[#A86DD5] to-[#EC77BA] text-white rounded-xl hover:from-[#9762bf] hover:to-[#d46ba7] transition prompt-bold shadow-xl cursor-pointer ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditspeakerModal;
