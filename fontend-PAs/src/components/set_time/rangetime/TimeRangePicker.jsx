import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, '0'),
  label: i.toString().padStart(2, '0'),
}));
const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
  value: i.toString().padStart(2, '0'),
  label: i.toString().padStart(2, '0'),
}));

const timeSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    borderRadius: '0.5rem',
    borderColor: '#d1d5db',
    fontSize: '0.875rem',
    backgroundColor: '#fff',
    boxShadow: state.isFocused ? '0 0 0 2px #AD7CE1' : undefined,
    outline: 'none',
    '&:hover': { borderColor: '#AD7CE1' }
  }),
  option: (provided, state) => ({
    ...provided,
    color: '#374151',
    backgroundColor: state.isFocused ? '#F3E8FF' : '#fff',
    fontSize: '0.875rem',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    boxShadow: '0 2px 16px 0 rgba(80,80,80,0.12)',
    zIndex: 99,
  }),
  singleValue: (base) => ({ ...base, color: '#374151' }),
  placeholder: (base) => ({ ...base, color: '#9ca3af' }),
  input: (base) => ({ ...base }),
  dropdownIndicator: (base) => ({ ...base, padding: 4 }),
  clearIndicator: (base) => ({ ...base, padding: 4 }),
};

const TimeRangePicker = ({
  initialStartTime,
  initialEndTime,
  onChange,
  onClose
}) => {
  const [timePicker, setTimePicker] = useState({
    startHour: '',
    startMinute: '',
    endHour: '',
    endMinute: ''
  });

  useEffect(() => {
    let sh = '', sm = '', eh = '', em = '';
    if (initialStartTime) {
      const [a, b] = initialStartTime.split(':');
      sh = a;
      sm = b;
    }
    if (initialEndTime) {
      const [a, b] = initialEndTime.split(':');
      eh = a;
      em = b;
    }
    setTimePicker({
      startHour: sh,
      startMinute: sm,
      endHour: eh,
      endMinute: em
    });
  }, [initialStartTime, initialEndTime]);

  const handleTimeClear = () => {
    setTimePicker({
      startHour: '',
      startMinute: '',
      endHour: '',
      endMinute: ''
    });
    onChange({ startTime: '', endTime: '' });
  };

  const handleTimeSet = () => {
    const startTime = timePicker.startHour && timePicker.startMinute
      ? `${timePicker.startHour}:${timePicker.startMinute}` : '';
    const endTime = timePicker.endHour && timePicker.endMinute
      ? `${timePicker.endHour}:${timePicker.endMinute}` : '';
    onChange({ startTime, endTime });
    if (onClose) onClose();
  };

  const filteredEndHourOptions = hourOptions.filter((h) =>
    timePicker.startHour ? Number(h.value) >= Number(timePicker.startHour) : true
  );
  const filteredEndMinuteOptions = minuteOptions.filter((m) =>
    timePicker.startHour && timePicker.endHour && timePicker.startMinute && (timePicker.endHour === timePicker.startHour)
      ? Number(m.value) > Number(timePicker.startMinute)
      : true
  );

  return (
    <div className="p-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 prompt-regular">เวลาเริ่มต้น</label>
          <div className="flex gap-2">
            <div className="w-1/2">
              <Select
                options={hourOptions}
                value={hourOptions.find(opt => opt.value === timePicker.startHour) || null}
                onChange={option => setTimePicker(prev => ({
                  ...prev,
                  startHour: option ? option.value : '',
                  startMinute: ''
                }))}
                placeholder="ชั่วโมง"
                menuPortalTarget={document.body}
                styles={timeSelectStyles}
                menuPosition="fixed"
              />
            </div>
            <div className="w-1/2">
              <Select
                options={minuteOptions}
                value={minuteOptions.find(opt => opt.value === timePicker.startMinute) || null}
                onChange={option => setTimePicker(prev => ({
                  ...prev,
                  startMinute: option ? option.value : ''
                }))}
                placeholder="นาที"
                isDisabled={!timePicker.startHour}
                menuPortalTarget={document.body}
                styles={timeSelectStyles}
                menuPosition="fixed"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 prompt-regular">เวลาสิ้นสุด (ไม่บังคับ)</label>
          <div className="flex gap-2">
            <div className="w-1/2">
              <Select
                options={filteredEndHourOptions}
                value={hourOptions.find(opt => opt.value === timePicker.endHour) || null}
                onChange={option => setTimePicker(prev => ({
                  ...prev,
                  endHour: option ? option.value : '',
                  endMinute: ''
                }))}
                placeholder="ชั่วโมง"
                isDisabled={!timePicker.startHour || !timePicker.startMinute}
                menuPortalTarget={document.body}
                styles={timeSelectStyles}
                menuPosition="fixed"
              />
            </div>
            <div className="w-1/2">
              <Select
                options={filteredEndMinuteOptions}
                value={minuteOptions.find(opt => opt.value === timePicker.endMinute) || null}
                onChange={option => setTimePicker(prev => ({
                  ...prev,
                  endMinute: option ? option.value : ''
                }))}
                placeholder="นาที"
                isDisabled={!timePicker.endHour}
                menuPortalTarget={document.body}
                styles={timeSelectStyles}
                menuPosition="fixed"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
        <button
          type="button"
          onClick={handleTimeClear}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 prompt-regular"
        >
          ล้าง
        </button>
        <button
          type="button"
          onClick={handleTimeSet}
          className="px-4 py-1.5 text-sm bg-gradient-to-r from-[#AD7CE1] to-[#EC77BA] text-white rounded-lg hover:opacity-90 prompt-regular"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
};

export default TimeRangePicker;