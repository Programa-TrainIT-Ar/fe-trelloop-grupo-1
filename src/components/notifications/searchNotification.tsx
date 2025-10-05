'use client';

import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { useState } from "react";

interface SearchNotificationProps {
  onSearch: (query: string) => void;
}

export default function SearchNotification({ onSearch }: SearchNotificationProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="w-full max-w-md relative">
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-white">
          <HiMiniMagnifyingGlass className="size-5" />
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={handleSearchChange}
          className="block w-full py-2 px-3 ps-10 text-sm text-white border border-[--global-color-neutral-700] rounded-full focus:ring-blue-500 focus:border-blue-500 dark:bg-[--global-color-neutral-800] dark:border-[--global-color-neutral-700] dark:placeholder-white dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Buscar notificaciones..."
        />
      </div>
    </div>
  );
}