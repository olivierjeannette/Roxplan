'use client';

import { useRef } from 'react';
import { ImagePlus, Grid3X3, Square, Trash2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import type { BackgroundType } from '@/types';

export function BackgroundManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    backgroundType,
    backgroundImageUrl,
    backgroundOpacity,
    setBackgroundType,
    setBackgroundImage,
    setBackgroundOpacity,
  } = useEditorStore();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Format non supporte. Utilisez JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Fichier trop volumineux. Maximum 10MB.');
      return;
    }

    // Pour le MVP, on utilise un data URL (localStorage)
    // TODO: Remplacer par upload vers Vercel Blob
    const reader = new FileReader();
    reader.onload = () => {
      setBackgroundImage(reader.result as string);
      setBackgroundType('image');
    };
    reader.readAsDataURL(file);
  };

  const backgrounds: { type: BackgroundType; icon: typeof Grid3X3; label: string }[] = [
    { type: 'grid', icon: Grid3X3, label: 'Grille' },
    { type: 'blank', icon: Square, label: 'Vide' },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase">Fond du plan</h4>

      {/* Type de fond */}
      <div className="flex gap-1">
        {backgrounds.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setBackgroundType(type)}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-md border text-xs transition-colors ${
              backgroundType === type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-md border text-xs transition-colors ${
            backgroundType === 'image'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ImagePlus size={16} />
          Image
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Preview image */}
      {backgroundImageUrl && backgroundType === 'image' && (
        <div className="relative">
          <img
            src={backgroundImageUrl}
            alt="Fond"
            className="w-full h-20 object-cover rounded-md border border-gray-200"
          />
          <button
            onClick={() => {
              setBackgroundImage(null);
              setBackgroundType('grid');
            }}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}

      {/* Opacite */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">
          Opacite: {backgroundOpacity}%
        </label>
        <input
          type="range"
          min={10}
          max={100}
          value={backgroundOpacity}
          onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
