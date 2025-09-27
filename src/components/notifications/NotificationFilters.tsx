'use client';

import { useState } from 'react';
import SearchBar from '@/components/notifications/searchNotification';

interface NotificationFiltersProps {
  onFilterChange: (filter: string) => void;
  onSearch: (query: string) => void;
}

export default function NotificationFilters({ onFilterChange, onSearch }: NotificationFiltersProps) {
  const [activeFilter, setActiveFilter] = useState('todas');

  const filters = [
    { title: 'Todas', key: 'todas', count: 10 },
    { title: 'Asignaciones', key: 'asignaciones', count: 10 },
    { title: 'Comentarios', key: 'comentarios', count: 0 },
    { title: 'Fechas límites', key: 'fechas-limite', count: 0 },
    { title: 'Menciones', key: 'menciones', count: 0 }
  ];

  const handleFilterClick = (filterKey: string) => {
    setActiveFilter(filterKey);
    onFilterChange(filterKey);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#313131B3] rounded-xl border-2 border-[#3C3C3CB2] mb-6">
      <div className="flex items-center gap-3">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => handleFilterClick(filter.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? 'bg-[#6A5FFF] text-white'
                : 'bg-[#747171] text-white hover:bg-[#6A5FFF] hover:text-white'
            }`}
          >
            <span>{filter.title}</span>
            <span className="bg-gray-500 text-white rounded-full px-2 py-0.5 text-xs min-w-[20px] text-center">
              {filter.count}
            </span>
          </button>
        ))}
      </div>
      <SearchBar onSearch={onSearch} />
    </div>
  );
}