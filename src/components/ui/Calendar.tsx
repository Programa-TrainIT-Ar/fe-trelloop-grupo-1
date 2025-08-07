"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import es from "date-fns/locale/es";
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
          minDate={new Date("2020-01-01")}
          maxDate={new Date("2030-12-31")}
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
          <button onClick={() => setSelecting("start")} >
            Desde: {startDate ? startDate.toLocaleDateString() : ""}
          </button>
          <button onClick={() => setSelecting("end")} >
            Hasta: {endDate ? endDate.toLocaleDateString() : ""}
          </button>
        </div>
        <div className=" text-sm text-left self-start mt-2 ml-3">Crear recordatorio </div>
        <select id="reminder" name="reminder"  className="mt-2 py-2 px-3 pr-8 bg-[#272727] block w-full rounded-xl text-sm font-light text-white focus:outline-none focus:border-purple-500 h-[41px]">
          <option>test</option>
          <option>test2</option>
          <option>test3</option>
        </select>
      </div>
    </div>
  );
};

export default Calendar;