import React, { useState, useEffect } from 'react';
import add from '../../assets/add.png';
import { X } from 'lucide-react';
import TimeRangePicker from './rangetime/TimeRangePicker';
import DateTimeRangePicker from './rangetime/DateTimeRangePicker';
import { getPlaylists, getSpeakerGroups, createTaskSchedule, createTaskCalendar } from "../../api/speakerapi";
import { showSuccess, showError} from '../../components/ToastNotifier';

const daysOfWeek = [
  { id: 'monday', label: 'จันทร์', abbr: 'mon' },
  { id: 'tuesday', label: 'อังคาร', abbr: 'tues' },
  { id: 'wednesday', label: 'พุธ', abbr: 'wed' },
  { id: 'thursday', label: 'พฤหัส', abbr: 'thur' },
  { id: 'friday', label: 'ศุกร์', abbr: 'fri' },
  { id: 'saturday', label: 'เสาร์', abbr: 'sat' },
  { id: 'sunday', label: 'อาทิตย์', abbr: 'sun' }
];

const CreateScheduleModal = ({ isOpen, onClose, onSave }) => {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [selectedTab, setSelectedTab] = useState('live');
  const [formData, setFormData] = useState({ startTime: '', endTime: '', date: null, title: '', days: [], audioFile: '', volume: '' });
  const [playlists, setPlaylists] = useState([]);
  const [speakerGroups, setSpeakerGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([getPlaylists(), getSpeakerGroups()])
      .then(([playlistRes, groupRes]) => {
        const playlists =
          playlistRes.data?.playlists ||
          playlistRes.data?.rows ||
          playlistRes.data?.data ||
          [];
        const speakerGroups =
          groupRes.data?.groups ||
          groupRes.data?.rows ||
          groupRes.data?.data ||
          [];

        setPlaylists(playlists);
        setSpeakerGroups(speakerGroups);
        setLoading(false);

        setFormData(prev => ({
          ...prev,
          audioFile:
            prev.audioFile ||
            (playlists[0]?.sourceId ||
              playlists[0]?.id ||
              playlists[0]?.playlist_id ||
              ''),
        }));
      })
      .catch(e => {
        setPlaylists([]);
        setSpeakerGroups([]);
        setLoading(false);
        console.error("api error", e);
      });
  }, [isOpen]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTimeDropdown && !event.target.closest('.relative')) {
        setShowTimeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTimeDropdown]);

  const handleDayToggle = (dayId) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(d => d !== dayId)
        : [...prev.days, dayId]
    }));
  };

const handleSubmit = async () => {
  showError({}); // reset error state

  const newErrors = {};
  if (!formData.title) newErrors.title = 'กรุณากรอกชื่อรายการ';
  if (!formData.startTime || !formData.endTime) newErrors.time = 'กรุณาเลือกเวลาเริ่ม-สิ้นสุด';
  if (!formData.audioFile) newErrors.audioFile = 'กรุณาเลือกไฟล์เสียง';
  if (!formData.volume) newErrors.volume = 'กรุณาเลือกกลุ่มลำโพง';
  if (selectedTab !== 'live' && !formData.date) newErrors.date = 'กรุณาเลือกวันที่';

  if (Object.keys(newErrors).length > 0) {
    showError('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  setLoading(true);

  try {
    const weekDays = formData.days.map(dayId =>
      daysOfWeek.find(x => x.id === dayId)?.abbr || dayId
    );

    const playlistId = formData.audioFile;
    const group = speakerGroups.find(g => g.id === parseInt(formData.volume, 10));
    const extensions = group?.speakers?.map(s => s.extension_number) || [];

    let payload = {};

    if (selectedTab === 'live') {
      payload = {
        name: formData.title,
        playlistId,
        extensions,
        groupName: group?.group_name,
        timeRange: [formData.startTime, formData.endTime],
        weekDays
      };
      const result = await createTaskSchedule(payload);
      showSuccess('บันทึกเรียบร้อย');
      if (onSave) onSave(payload, result?.data);
      if (onClose) onClose();
    } else {
      const jsDate = new Date(formData.date);
      const dayIndexMap = [6, 0, 1, 2, 3, 4, 5];
      const weekDayAbbr = daysOfWeek[dayIndexMap[jsDate.getDay()]].abbr;

      payload = {
        name: formData.title,
        playlistId,
        extensions,
        dates: [
          formatShortDate(formData.date),
          formatShortDate(formData.date)
        ],
        timeRange: [formData.startTime, formData.endTime],
        weekDays: [weekDayAbbr]
      };
      const result = await createTaskCalendar(payload);
      showSuccess('บันทึกเรียบร้อย');
      if (onSave) onSave(payload, result?.data);
      if (onClose) onClose();
    }
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? 'เกิดข้อผิดพลาด';
    showError(msg);
  } finally {
    setLoading(false);
  }
};

  function formatShortDate(date) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center mb-1">
            <img src={add} alt="Stop" className="w-5 h-5" />
            <h2 className="text-3xl font-semibold text-gray-700 prompt-bold ml-4">สร้างรายการตั้งเวลา</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500 cursor-pointer" />
          </button>
        </div>
        <div className="mb-5">
          <div className="flex border-b border-gray-200 ml-10 mr-10">
            <button
              onClick={() => setSelectedTab('live')}
              className={`flex-1 py-3 px-1 text-lg font-medium transition-colors relative prompt-regular cursor-pointer ${selectedTab === 'live'
                ? 'bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] bg-clip-text text-transparent'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Schedule
              {selectedTab === 'live' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA]"></div>
              )}
            </button>
            <button
              onClick={() => setSelectedTab('calendar')}
              className={`flex-1 py-3 px-1 text-lg font-medium transition-colors relative prompt-regular cursor-pointer ${selectedTab === 'calendar'
                ? 'bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] bg-clip-text text-transparent'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Calendar
              {selectedTab === 'calendar' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA]"></div>
              )}
            </button>
          </div>
        </div>

        <div className="px-8 pb-6 space-y-5">
          <div className="flex gap-4">
            <div className="w-[300px]">
              <label className="block text-md text-left font-bold text-gray-700 mb-1 prompt-bold">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น เพลงชาติ, เพลงกีฬา"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular text-md"
              />
            </div>

            <div className='w-[300px]'>
              <label className="block text-md text-left font-bold text-gray-700 mb-1 prompt-bold">
                {selectedTab === 'live' ? 'เวลา' : 'วันที่และเวลา'}
              </label>
              <div className="relative">
                {selectedTab === 'live' && (
                  <>
                    <div
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular text-md cursor-pointer flex items-center justify-between"
                    >
                      <span className={formData.startTime ? 'text-gray-700' : 'text-gray-400'}>
                        {formData.startTime && !formData.endTime && formData.startTime}
                        {formData.startTime && formData.endTime && `${formData.startTime} - ${formData.endTime}`}
                        {!formData.startTime && 'เลือกเวลา'}
                      </span>
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                      </svg>
                    </div>
                    {showTimeDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-xl shadow-lg z-50 mt-1">
                        <TimeRangePicker
                          initialStartTime={formData.startTime}
                          initialEndTime={formData.endTime}
                          onChange={({ startTime, endTime }) =>
                            setFormData(prev => ({
                              ...prev,
                              startTime,
                              endTime
                            }))
                          }
                          onClose={() => setShowTimeDropdown(false)}
                        />
                      </div>
                    )}
                  </>
                )}

                {selectedTab === 'calendar' && (
                  <>
                    <div
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular text-md cursor-pointer flex items-center justify-between"
                    >
                      <span className={
                        formData.date && formData.startTime
                          ? 'text-gray-700'
                          : 'text-gray-400'
                      }>
                        {formData.date && formData.startTime && !formData.endTime &&
                          `${formatShortDate(formData.date)} ${formData.startTime}`
                        }
                        {formData.date && formData.startTime && formData.endTime &&
                          `${formatShortDate(formData.date)} ${formData.startTime} - ${formData.endTime}`
                        }
                        {!(formData.date && formData.startTime) && 'เลือกวันที่และเวลา'}
                      </span>
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                    </div>
                    {showTimeDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-xl shadow-lg z-50 mt-1">
                        <DateTimeRangePicker
                          initialDate={formData.date}
                          initialStartTime={formData.startTime}
                          initialEndTime={formData.endTime}
                          onChange={({ date, startTime, endTime }) =>
                            setFormData(prev => ({
                              ...prev,
                              date,
                              startTime,
                              endTime
                            }))
                          }
                          onClose={() => setShowTimeDropdown(false)}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {selectedTab === 'live' && (
            <div>
              <label className="block text-md text-left font-bold text-gray-700 mb-2 prompt-bold">
                วันที่ทำการ
              </label>
              <div className="flex flex-wrap gap-2 ml-5">
                {daysOfWeek.map((day) => (
                  <label
                    key={day.id}
                    className="flex items-center justify-center text-sm font-medium cursor-pointer transition-all prompt-regular"
                    style={{ width: 70 }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.days.includes(day.id)}
                      onChange={() => handleDayToggle(day.id)}
                      className="form-checkbox accent-[#A07EDF] w-4 h-4 mr-2 cursor-pointer"
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* รายการเพลงดึงจาก API */}
          <div>
            <label className="block text-md text-left font-bold text-gray-700 mb-2 prompt-bold">
              เลือกไฟล์เสียง
            </label>
            <div className="relative">
              <select
                value={formData.audioFile}
                onChange={e => setFormData(prev => ({ ...prev, audioFile: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular text-md bg-white"
              >
                <option value="">เลือกไฟล์เสียง...</option>
                {playlists.map(pl => (
                  <option key={pl.sourceId} value={`sourceId-${pl.source_id}`}>{pl.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          {/* กลุ่มลำโพงดึงจาก API */}
          <div>
            <label className="block text-md text-left font-bold text-gray-700 mb-2 prompt-bold">
              กลุ่มลำโพง
            </label>
            <div className="relative">
              <select
                value={formData.volume}
                onChange={e => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#AD7CE1] focus:border-[#AD7CE1] prompt-regular text-md bg-white"
              >
                <option value="">เลือกกลุ่มลำโพง...</option>
                {speakerGroups.map(gr => (
                  <option key={gr.id} value={gr.id}>{gr.group_name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 p-6 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 shadow-xl transition prompt-bold cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#A86DD5] to-[#EC77BA] text-white rounded-xl hover:from-[#9762bf] hover:to-[#d46ba7] transition prompt-bold shadow-xl cursor-pointer"
          >
            {loading ? 'กำลังโหลด...' : 'บันทึกรายการ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateScheduleModal;