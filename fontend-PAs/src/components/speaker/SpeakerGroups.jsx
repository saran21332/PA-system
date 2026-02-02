import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import megaphonePurple from '../../assets/megaphone-purple.png';
import deleteimage from '../../assets/delete.png';
import delete2 from '../../assets/delete2.png';
import edit from '../../assets/edit.png';
import EditspeakerModal from './editspeakergroups.jsx';
import { deleteSpeakerGroup, getSpeakerGroups } from "../../api/speakerapi";

const SpeakerGroups = ({ groups, setGroups }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await getSpeakerGroups();
      if (res.data?.data) {
        const hiddenGroupIds = [1, 2, 3, 4];
        const filteredGroups = res.data.data
          .filter(group => !hiddenGroupIds.includes(group.id))
          .map(group => ({
            ...group,
            speaker_count: group.speakers?.length || 0
          }));

        setGroups(filteredGroups);
      }
    } catch (err) {
      console.error("❌ Fetch speaker groups error:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleEditClick = (group) => {
    setGroupToEdit(group);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setGroupToEdit(null);
  };

  const handleUpdateGroup = (updatedGroup) => {
    setGroups(prev =>
      prev.map(group => group.id === updatedGroup.id ? updatedGroup : group)
    );
  };

  const handleDeleteGroup = (id) => setGroupToDelete(id);

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      await deleteSpeakerGroup(groupToDelete);
      setGroups(prev =>
        prev.filter(group => group.id !== groupToDelete)
      );
    } catch (err) {
      console.error("❌ Delete group error:", err);
      alert("เกิดข้อผิดพลาดในการลบกลุ่ม");
    } finally {
      setGroupToDelete(null);
    }
  };

  const cancelDelete = () => setGroupToDelete(null);
  
  const filteredGroups = groups.filter(group =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col custom-scrollbar">
      <div className="p-6 pb-0 flex-shrink-0 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 prompt-bold">กลุ่มลำโพง</h3>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหากลุ่มลำโพง...."
            className="w-full px-4 py-1.5 bg-white border border-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular"
          />
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {loading ? (
          <p className="text-gray-500 text-center">กำลังโหลด...</p>
        ) : filteredGroups.length === 0 ? (
          <p className="text-gray-400 text-center">ไม่พบกลุ่มลำโพง</p>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              className="group flex items-center justify-between p-4 border-2 border-purple-400 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg flex items-center justify-center border border-purple-400">
                  <img src={megaphonePurple} alt="music" className="w-6 h-6" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="font-medium text-left text-gray-800 prompt-bold truncate">
                    {group.group_name}
                  </p>
                  <p className="text-sm text-left text-gray-500 prompt-regular truncate">
                    {group.speaker_count} ลำโพง
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5 flex-shrink-0 ml-2">
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                  onClick={() => handleEditClick(group)}
                >
                  <img src={edit} alt="edit" className="w-5 h-5 cursor-pointer" />
                </button>
                <button
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <img src={deleteimage} alt="remove" className="w-5 h-5 cursor-pointer" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {groupToDelete && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg text-center kanit-regular">
            <div className="flex items-center justify-center mx-auto mb-4 bg-red-100/50 rounded-full w-25 h-25">
              <img src={delete2} className="h-12 w-12 object-contain block" alt="delete" />
            </div>
            <p className="mb-1 text-xl font-semibold text-gray-800 prompt-regular">
              ยืนยันการลบกลุ่ม
            </p>
            <p className="mb-3 text-l font-semibold text-gray-600 prompt-regular">
              คุณแน่ใจหรือไม่ว่าต้องการลบกลุ่มนี้?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-2 rounded-lg border text-red-500 border-red-400 hover:bg-purple-50 transition prompt-regular cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 rounded-lg border bg-red-500 text-white transition prompt-regular cursor-pointer"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <EditspeakerModal
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          group={groupToEdit}
          onSave={handleUpdateGroup}
        />
      )}
    </div>
  );
};

export default SpeakerGroups;
