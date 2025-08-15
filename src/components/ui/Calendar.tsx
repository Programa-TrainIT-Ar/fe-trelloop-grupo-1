import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FaCheck, FaTimes,  } from "react-icons/fa";

import "react-datepicker/dist/react-datepicker.css";
import "../../styles/calendar.css";

registerLocale('es', es);
setDefaultLocale('es');

type Props = {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
};

const Calendar: React.FC<Props> = ({ startDate, endDate, setStartDate, setEndDate }) => {
  const [selecting, setSelecting] = useState<"start" | "end" | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [reminder, setReminder] = useState<string>("none");
  const [customDays, setCustomDays] = useState<string>("");
  const [isCustomizing, setIsCustomizing] = useState(false);

  const defaultOptions = [
    { value: "none", label: "Sin recordatorio" },
    { value: "1", label: "1 día antes" },
    { value: "2", label: "2 días antes" },
    { value: "3", label: "3 días antes" },
  ];

  const dateRange = useMemo(() => ({
    minDate: new Date("2020-01-01"),
    maxDate: new Date("2030-12-31")
  }), []);

  const getReminderText = () => {
    if (reminder === "none") return "Sin recordatorio";
    if (reminder === "custom") return `${customDays} días antes`;
    return defaultOptions.find(opt => opt.value === reminder)?.label || "Sin recordatorio";
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    
    if (selecting === "start") {
      setStartDate(date);
      setSelecting(null);
    } else if (selecting === "end") {
      setEndDate(date);
      setSelecting(null);
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar">
        <DatePicker
          selected={selecting === "start" ? startDate : selecting === "end" ? endDate : null}
          onChange={handleDateChange}
          inline
          monthsShown={1}
          minDate={dateRange.minDate}
          maxDate={dateRange.maxDate}
          locale="es"
          calendarClassName="custom-datepicker"
          renderCustomHeader={({ date, decreaseMonth, increaseMonth, decreaseYear, increaseYear }) => (
            <div className="custom-header">
              <button className="text-2xl px-2 " onClick={decreaseYear}>‹‹</button>
              <button className="text-2xl px-2 " onClick={decreaseMonth}>‹</button>
              <span className=" px-2">{date.toLocaleDateString('es', { month: 'long', year: 'numeric' })}</span>
              <button className="text-2xl px-2 " onClick={increaseMonth}>›</button>
              <button className="text-2xl px-2 " onClick={increaseYear}>››</button>
            </div>
          )}
        />
        <div className="calendar-buttons">
          <button 
            onClick={() => setSelecting("start")} 
            className={`${
              selecting === "start" ? "selecting" : ""
            } ${startDate ? "has-date" : ""}`}
          >
            Desde: {startDate ? startDate.toLocaleDateString('es-ES') : ""}
          </button>
          <button 
            onClick={() => setSelecting("end")} 
            className={`${
              selecting === "end" ? "selecting" : ""
            } ${endDate ? "has-date" : ""}`}
          >
            Hasta: {endDate ? endDate.toLocaleDateString('es-ES') : ""}
          </button>
        </div>
        <div className=" text-sm text-left self-start mt-6 ml-3">Crear recordatorio </div>
        <div 
          className={`mt-2 py-2 px-3 pr-8 bg-[#272727] block w-full rounded-xl text-sm font-light focus:outline-none focus:border-purple-500 h-[21px] cursor-pointer relative flex items-center justify-between ${
            reminder === "none" ? "text-[#5e5e5e]" : "text-white"
          }`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span>{getReminderText()}</span>
          <FontAwesomeIcon icon={faChevronDown} className="text-[#5e5e5e]" />
        </div>

        {showDropdown && (
          <div className="mt-2 bg-[#272727] rounded-xl shadow-lg overflow-hidden w-full">
            {defaultOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-700 #5e5e5e "
              >
                <input
                  type="radio"
                  name="reminder"
                  value={option.value}
                  checked={reminder === option.value}
                  onChange={(e) => {
                    setReminder(e.target.value);
                    setIsCustomizing(false);
                    setShowDropdown(false);
                  }}
                  className="accent-purple-500"
                />
                {option.label}
              </label>
            ))}

            {/* Personalizar */}
            <div className="px-3 py-2 hover:bg-gray-700">
              {!isCustomizing ? (
                <button
                  className="text-purple-400 text-sm"
                  onClick={() => setIsCustomizing(true)}
                >
                  Personalizar
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-14 bg-gray-900 text-white text-sm p-1 rounded"
                    placeholder="Días"
                  />
                  <button
                    className="text-white-100"
                    onClick={() => {
                      if (customDays) {
                        setReminder("custom");
                        setShowDropdown(false);
                      }
                    }}
                  >
                   <FaCheck />
                  </button>
                  <button
                    className="text-white-100"
                    onClick={() => {
                      setIsCustomizing(false);
                      setCustomDays("");
                    }}
                  >
                    <FaTimes/>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;