/**
 * Context-Aware Filtering Examples
 *
 * This file shows how to use the SearchBar component with different filter types
 * across various screens in your app.
 */

import React, { useState } from 'react';
import SearchBar from '@/components/inputs/SearchBar';

// Example 1: Athletes Screen (Current Implementation)
export function AthletesScreenExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onFilterPress={() => setShowBatchModal(true)}
      filterType="batch"
      placeholder="Search athletes..."
    />
  );
}

// Example 2: Games Screen (Future Implementation)
export function GamesScreenExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showGameFilterModal, setShowGameFilterModal] = useState(false);

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onFilterPress={() => setShowGameFilterModal(true)}
      filterType="game"
      placeholder="Search games..."
    />
  );
}

// Example 3: Stats Screen (Future Implementation)
export function StatsScreenExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatsFilterModal, setShowStatsFilterModal] = useState(false);

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onFilterPress={() => setShowStatsFilterModal(true)}
      filterType="stats"
      placeholder="Search stats..."
    />
  );
}

// Example 4: Positions Screen (Future Implementation)
export function PositionsScreenExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPositionFilterModal, setShowPositionFilterModal] = useState(false);

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onFilterPress={() => setShowPositionFilterModal(true)}
      filterType="position"
      placeholder="Search positions..."
    />
  );
}

// Example 5: Custom Filter (Future Implementation)
export function CustomFilterExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onFilterPress={() => setShowCustomModal(true)}
      filterType="custom"
      placeholder="Search with custom filter..."
    />
  );
}

/**
 * Benefits of This Approach:
 *
 * 1. ✅ Single Filter Icon: Consistent UI across all screens
 * 2. ✅ Context-Aware: Different filtering based on current screen
 * 3. ✅ Scalable: Easy to add new filter types
 * 4. ✅ Maintainable: Each screen controls its own filtering logic
 * 5. ✅ Type-Safe: TypeScript support for filter types
 * 6. ✅ Debuggable: Console logs show which filter type is being used
 */
