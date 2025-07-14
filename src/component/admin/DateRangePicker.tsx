"use client";

import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X } from "lucide-react";

interface DateRangePickerProps {
  value: string;
  onChange: (value: string, startDate?: Date, endDate?: Date) => void;
  placeholder?: string;
}

export default function DateRangePicker({ value, onChange, placeholder = "Select date range" }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Parse existing value if it exists
  React.useEffect(() => {
    if (value && value.includes("Days")) {
      // Try to extract days from existing value like "4 Days / 5 Nights"
      const daysMatch = value.match(/(\d+)\s*Days/);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        const today = new Date();
        setStartDate(today);
        const end = new Date(today);
        end.setDate(today.getDate() + days - 1); // -1 because we count the start day
        setEndDate(end);
      }
    }
  }, [value]);

  // Handle click outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const nightsDiff = daysDiff - 1;
      const durationText = `${daysDiff} Days / ${nightsDiff} Nights`;
      onChange(durationText, start, end);
      setIsOpen(false);
    }
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    onChange("");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ka-GE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            readOnly
            onClick={() => setIsOpen(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white"
            placeholder={placeholder}
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        {value && (
          <button
            type="button"
            onClick={clearDates}
            className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear dates"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            minDate={new Date()}
            dateFormat="MMM dd, yyyy"
            placeholderText="Select date range"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            popperClassName="z-50"
            popperPlacement="bottom-start"
          />
        </div>
      )}

      {/* Selected date range display */}
      {startDate && endDate && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Selected:</span> {formatDate(startDate)} - {formatDate(endDate)}
        </div>
      )}
    </div>
  );
} 