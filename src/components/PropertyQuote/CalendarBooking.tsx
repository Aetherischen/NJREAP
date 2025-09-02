
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BusySlot {
  start: string;
  end: string;
}

interface CalendarBookingProps {
  selectedDate: Date | null;
  selectedTime: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  validationErrors: any;
}

const CalendarBooking: React.FC<CalendarBookingProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  validationErrors
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<{ [key: string]: BusySlot[] }>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());

  // Fetch calendar availability for a specific date when needed
  const fetchDateAvailability = async (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    
    // Skip if already loading or already have data
    if (loadingDates.has(dateKey) || availabilityData[dateKey]) {
      return;
    }

    setLoadingDates(prev => new Set(prev).add(dateKey));
    
    try {
      console.log('Fetching availability for:', dateKey);
      const { data, error } = await supabase.functions.invoke('get-calendar-availability', {
        body: { date: date.toISOString() }
      });

      if (error) {
        console.error('Error fetching calendar availability for', dateKey, ':', error);
        // Set empty array for failed requests to avoid infinite loading
        setAvailabilityData(prev => ({
          ...prev,
          [dateKey]: []
        }));
      } else {
        console.log('Calendar availability response for', dateKey, ':', data);
        setAvailabilityData(prev => ({
          ...prev,
          [dateKey]: data?.busySlots || []
        }));
      }
    } catch (error) {
      console.error('Error fetching calendar availability for', dateKey, ':', error);
      // Set empty array for failed requests to avoid infinite loading
      setAvailabilityData(prev => ({
        ...prev,
        [dateKey]: []
      }));
    } finally {
      setLoadingDates(prev => {
        const newSet = new Set(prev);
        newSet.delete(dateKey);
        return newSet;
      });
    }
  };

  // Generate time slots (9 AM to 6 PM in 15-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 18 && minute > 0) break; // Stop at 6:00 PM
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        const timeString = time.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Check if a time slot conflicts with busy periods (including 2-hour buffer)
  const isTimeSlotBlocked = (timeString: string): boolean => {
    if (!selectedDate) return false;

    const dateKey = selectedDate.toISOString().split('T')[0];
    const busySlots = availabilityData[dateKey] || [];

    if (busySlots.length === 0) return false;

    // Parse the time string to get hours and minutes
    const timeParts = timeString.match(/(\d{1,2}):(\d{2}) (AM|PM)/i);
    if (!timeParts) return false;

    let [_, hours, minutes, period] = timeParts;
    let hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);
    
    if (period.toUpperCase() === 'PM' && hoursNum !== 12) hoursNum += 12;
    if (period.toUpperCase() === 'AM' && hoursNum === 12) hoursNum = 0;

    // Create the proposed appointment time
    const proposedStart = new Date(selectedDate);
    proposedStart.setHours(hoursNum, minutesNum, 0, 0);
    
    // Proposed appointment duration (30 minutes)
    const proposedEnd = new Date(proposedStart.getTime() + 30 * 60000);

    // Check against each busy slot with 2-hour buffer
    for (const busySlot of busySlots) {
      const busyStart = new Date(busySlot.start);
      const busyEnd = new Date(busySlot.end);
      
      // Add 2-hour buffer (120 minutes) before and after busy period
      const bufferStart = new Date(busyStart.getTime() - 120 * 60000);
      const bufferEnd = new Date(busyEnd.getTime() + 120 * 60000);
      
      // Check if proposed appointment overlaps with buffered busy period
      if (proposedStart < bufferEnd && proposedEnd > bufferStart) {
        return true;
      }
    }

    return false;
  };

  const timeSlots = generateTimeSlots();

  // Calendar functionality
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // Only disable if: past date or more than 1 month in future
    // Removed weekend restriction to allow weekend appointments
    return (
      date < today ||
      date > oneMonthFromNow
    );
  };

  const selectDate = (day: number) => {
    if (!isDateDisabled(day)) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day,
      );
      onDateSelect(date);
      // Fetch availability for the selected date
      fetchDateAvailability(date);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <button
          key={`empty-${i}`}
          disabled
          className="p-2 text-center text-sm rounded cursor-not-allowed text-gray-300"
        >
          {new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              0,
            ).getDate() -
              firstDay +
              i +
              1,
          ).getDate()}
        </button>,
      );
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isDisabled = isDateDisabled(day);
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();

      days.push(
        <button
          key={day}
          disabled={isDisabled}
          onClick={() => selectDate(day)}
          className={`p-2 text-center text-sm rounded transition-colors ${
            isDisabled
              ? "cursor-not-allowed text-gray-300"
              : isSelected
                ? "bg-purple-600 text-white"
                : "text-gray-700 hover:bg-gray-100 cursor-pointer"
          }`}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold leading-7 mb-3">
        Select Inspection Date & Time *
      </h3>
      <div
        className={`bg-white border rounded-lg p-4 ${validationErrors.date || validationErrors.time ? "border-red-500" : "border-gray-200"}`}
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="flex items-center gap-2 h-9 px-3"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h4 className="font-medium">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="flex items-center gap-2 h-9 px-3"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {renderCalendarDays()}
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium">Select Time</h5>
              {loadingDates.has(selectedDate.toISOString().split('T')[0]) && (
                <span className="text-sm text-blue-600">Loading availability...</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {timeSlots.map((time) => {
                const isBlocked = isTimeSlotBlocked(time);
                const isLoading = loadingDates.has(selectedDate.toISOString().split('T')[0]);
                return (
                  <button
                    key={time}
                    onClick={() => !isBlocked && !isLoading && onTimeSelect(time)}
                    disabled={isBlocked || isLoading}
                    className={`p-2 text-sm rounded border ${
                      isLoading
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-wait"
                        : isBlocked
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : selectedTime === time
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                    title={isBlocked ? "Time not available (conflict with existing appointment)" : ""}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            {selectedDate && availabilityData[selectedDate.toISOString().split('T')[0]]?.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Times with conflicts (including 2-hour buffer) are disabled
              </p>
            )}
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">
              <strong>Selected:</strong>{" "}
              {selectedDate.toLocaleDateString()} at {selectedTime}
            </p>
          </div>
        )}
      </div>
      {(validationErrors.date || validationErrors.time) && (
        <div className="mt-2 space-y-1">
          {validationErrors.date && (
            <p className="text-red-500 text-sm">{validationErrors.date}</p>
          )}
          {validationErrors.time && (
            <p className="text-red-500 text-sm">{validationErrors.time}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarBooking;
