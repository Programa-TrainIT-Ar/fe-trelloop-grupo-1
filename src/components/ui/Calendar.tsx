"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { registerLocale,setDefaultLocale } from "react-datepicker";
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

  const handleDateChange = (date: Date) => {
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
      <h4>Fecha de tarjeta</h4>
      <div className="calendar">
        <DatePicker
          selected={selecting === "start" ? startDate : selecting === "end" ? endDate : null}
          onChange={handleDateChange}
          inline
          monthsShown={1}
          minDate={new Date("2020-01-01")}
          maxDate={new Date("2030-12-31")}
          calendarClassName="custom-datepicker"
        />
        <div className="calendar-buttons">
          <button onClick={() => setSelecting("start")} >
            Desde: {startDate ? startDate.toLocaleDateString() : "Seleccionar"}
          </button>
          <button onClick={() => setSelecting("end")} >
            Hasta: {endDate ? endDate.toLocaleDateString() : "Seleccionar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;