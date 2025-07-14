"use client";

import React, { useState, useEffect } from "react";
import { getTourDaysByPackage } from "@/lib/actions/tourDays";


interface TourPlanDisplayProps {
  packageId: number;
}

export default function TourPlanDisplay({ packageId }: TourPlanDisplayProps) {
  const [tourDays, setTourDays] = useState<Array<{
    id: number;
    dayNumber: number;
    title: string;
    activities: string[];
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTourDays = async () => {
      try {
        setLoading(true);
        const result = await getTourDaysByPackage(packageId);
        if (result.success && result.data) {
          setTourDays(result.data);
        } else {
          setError("Failed to load tour plan");
        }
      } catch {
        setError("Error loading tour plan");
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      loadTourDays();
    }
  }, [packageId]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-pulse">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (tourDays.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tour plan available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tourDays.map((day) => (
        <div key={day.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#ea8f03] text-white rounded-full flex items-center justify-center font-bold">
            {day.dayNumber.toString().padStart(2, '0')}
          </div>
          <div className="flex-1">
            <h4 className="text-base sm:text-lg font-semibold mb-2">
              Day {day.dayNumber.toString().padStart(2, '0')}: {day.title}
            </h4>
            {day.activities && day.activities.length > 0 && (
              <ul className="space-y-1">
                {day.activities.map((activity: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-[#ea8f03] rounded-full"></div>
                    <span className="text-gray-600">
                      {activity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 