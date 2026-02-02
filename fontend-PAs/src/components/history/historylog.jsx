import React, { useState, useEffect, useCallback } from 'react';
import deleteimage from '../../assets/delete.png';
import { getPlaybackLogs, deletePlaybackLogs } from '../../api/speakerapi';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SpeakerDropdown = ({ speakerCodes, rowId, expandedRow, setExpandedRow }) => {
  const isExpanded = expandedRow === rowId;
  const speakerCount = speakerCodes.length;

  const toggleExpanded = () => {
    setExpandedRow(isExpanded ? null : rowId);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleExpanded}
        className="flex items-center justify-center space-x-1 px-3 py-1 bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] text-white text-xs rounded-full hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        <span>ลำโพง {speakerCount} ตัว</span>
        {isExpanded ? (
          <ChevronUp size={12} />
        ) : (
          <ChevronDown size={12} />
        )}
      </button>

      {isExpanded && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
          <div className="p-3">
            <div className="text-xs font-medium text-gray-600 mb-2 prompt-bold">รายการลำโพง:</div>
            <div className="space-y-1">
              {speakerCodes.map((code, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-700 px-2 py-1 bg-gray-50 rounded prompt-light"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const Historylog = ({ filters, onAnnouncementsLoad }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const itemsPerPage = 10;

  const filterAnnouncements = useCallback((filterOptions, announcementsData) => {
    let filtered = [...announcementsData];
    if (filterOptions.searchTerm) {
      filtered = filtered.filter(item =>
        (item.task_name && item.task_name.toLowerCase().includes(filterOptions.searchTerm.toLowerCase())) ||
        (item.username && item.username.toLowerCase().includes(filterOptions.searchTerm.toLowerCase())) ||
        (item.task_type && item.task_type.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()))
      );
    }
    if (filterOptions.selectedCategory !== 'ทุกวันที่') {
      filtered = filtered.filter(item => item.date === filterOptions.selectedCategory);
    }
    if (filterOptions.selectedStatus !== 'ทุกประเภท') {
      filtered = filtered.filter(item => item.task_type === filterOptions.selectedStatus);
    }
    if (filterOptions.selectedDate !== 'ทุกลำโพง') {
      filtered = filtered.filter(item =>
        item.speaker_code && item.speaker_code.includes(filterOptions.selectedDate)
      );
    }
    return filtered;
  }, []);

  const handleDeleteLog = async (id) => {
    try {
      setDeletingId(id);
      await deletePlaybackLogs([id]);
      setAnnouncements((prev) => prev.filter(log => log.id !== id));
      setFilteredAnnouncements((prev) => prev.filter(log => log.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (dataLoaded) return;

      try {
        setLoading(true);
        const response = await getPlaybackLogs();
        if (response.data && response.data.res) {
          const data = response.data.res;
          setAnnouncements(data);
          setFilteredAnnouncements(data);
          setDataLoaded(true);
          if (onAnnouncementsLoad) {
            onAnnouncementsLoad(data);
          }
        }
      } catch (error) {
        console.error('Error fetching playback logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 0) {
      const filtered = filterAnnouncements(filters, announcements);
      setFilteredAnnouncements(filtered);
      setCurrentPage(1);
    }
  }, [filters, announcements, filterAnnouncements]);

  useEffect(() => {
    setExpandedRow(null);
  }, [currentPage]);

  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredAnnouncements.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    if (currentPage > 1) {
      buttons.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-1 mx-1 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
        >
          ←
        </button>
      );
    }
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 mx-1 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis" className="px-2 py-1 text-gray-500">...</span>);
      }
    }
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-3 py-1 mx-1 border rounded cursor-pointer ${currentPage === page
            ? 'bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] text-white border-transparent'
            : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
            }`}
        >
          {page}
        </button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis" className="px-2 py-1 text-gray-500">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 mx-1 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
        >
          {totalPages}
        </button>
      );
    }
    if (currentPage < totalPages) {
      buttons.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 mx-1 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
        >
          →
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg h-[630px] flex flex-col">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-xl text-left font-bold text-gray-800 prompt-bold">ประวัติการประกาศ</h3>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col custom-scrollbar">
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-10 text-gray-500">ไม่พบข้อมูลที่ตรงกับการค้นหา</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-40">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 prompt-bold w-30">#</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 prompt-bold w-60">วันที่ประกาศ</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 prompt-bold w-60">เวลาเริ่ม-เวลาสิ้นสุด</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 prompt-bold w-60">ประเภท</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 prompt-bold w-60">ชื่อรายการ</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 prompt-bold w-60">รายการลำโพง</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 prompt-bold w-40">เจ้าหน้าที่</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700 prompt-bold w-10"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700 prompt-light text-center">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 prompt-light text-center">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 prompt-light text-center">
                      {item.start_at} - {item.end_at}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 prompt-light text-center">
                      {item.task_type}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-700 prompt-light text-center max-w-[150px] truncate"
                      title={item.task_name || '-'}
                    >
                      {item.task_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <div className="flex justify-center items-center prompt-regular">
                        <SpeakerDropdown
                          speakerCodes={item.speaker_code}
                          rowId={`row-${item.id}`}
                          expandedRow={expandedRow}
                          setExpandedRow={setExpandedRow}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 prompt-light text-center">
                      {item.username || '-'}
                    </td>
                    <td className="py-4 text-left w-12 mr-5">
                      <button
                        onClick={() => handleDeleteLog(item.id)}
                        className="inline-flex items-center justify-center"
                        disabled={deletingId === item.id}
                        title="ลบ log นี้"
                        style={{
                          opacity: deletingId === item.id ? 0.5 : 1,
                          cursor: deletingId === item.id ? "not-allowed" : "pointer",
                          background: "none",
                          border: "none",
                          padding: 0,
                        }}
                      >
                        <img src={deleteimage} alt="ลบ" className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t-0 rounded-2xl border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 prompt-regular">
              แสดง {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAnnouncements.length)} จาก {filteredAnnouncements.length} รายการ
            </div>
            <div className="flex items-center">
              {renderPaginationButtons()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historylog;