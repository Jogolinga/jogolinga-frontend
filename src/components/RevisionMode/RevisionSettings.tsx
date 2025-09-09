import React from 'react';

interface RevisionSettingsProps {
  wordsPerSession: number;
  onWordsPerSessionChange: (value: number) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  availableCategories: string[];
}

const RevisionSettings: React.FC<RevisionSettingsProps> = ({
  wordsPerSession,
  onWordsPerSessionChange,
  selectedCategories,
  onCategoriesChange,
  availableCategories
}) => {
  return (
    <div className="revision-settings">
      <div>
        <label htmlFor="wordsPerSession">Nombre de mots par session:</label>
        <input
          type="number"
          id="wordsPerSession"
          value={wordsPerSession}
          onChange={(e) => onWordsPerSessionChange(Number(e.target.value))}
          min={1}
          max={50}
        />
      </div>
      <div>
        <label>Catégories à réviser:</label>
        {availableCategories.map((category) => (
          <label key={category}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={(e) => {
                if (e.target.checked) {
                  onCategoriesChange([...selectedCategories, category]);
                } else {
                  onCategoriesChange(selectedCategories.filter(c => c !== category));
                }
              }}
            />
            {category}
          </label>
        ))}
      </div>
    </div>
  );
};

export default RevisionSettings;

export {};