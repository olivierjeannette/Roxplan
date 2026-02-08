'use client';

import { useRef } from 'react';
import { ImagePlus, Grid3X3, Square, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
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

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Format non supporte. Utilisez JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Fichier trop volumineux. Maximum 10MB.');
      return;
    }

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
      <h4 className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
        Fond du plan
      </h4>

      <div className="flex gap-1.5">
        {backgrounds.map(({ type, icon: Icon, label }) => {
          const isActive = backgroundType === type;
          return (
            <motion.button
              key={type}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setBackgroundType(type)}
              className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border text-[11px] font-medium transition-colors"
              style={{
                borderColor: isActive ? 'var(--accent)' : 'var(--border-subtle)',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={15} />
              {label}
            </motion.button>
          );
        })}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border text-[11px] font-medium transition-colors"
          style={{
            borderColor: backgroundType === 'image' ? 'var(--accent)' : 'var(--border-subtle)',
            background: backgroundType === 'image' ? 'var(--accent-light)' : 'transparent',
            color: backgroundType === 'image' ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          <ImagePlus size={15} />
          Image
        </motion.button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageUpload}
        className="hidden"
      />

      {backgroundImageUrl && backgroundType === 'image' && (
        <div className="relative">
          <img
            src={backgroundImageUrl}
            alt="Fond"
            className="w-full h-20 object-cover rounded-xl"
            style={{ border: '1px solid var(--border-subtle)' }}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setBackgroundImage(null);
              setBackgroundType('grid');
            }}
            className="absolute top-1.5 right-1.5 p-1 rounded-full"
            style={{ background: 'var(--danger)', color: 'white' }}
          >
            <Trash2 size={10} />
          </motion.button>
        </div>
      )}

      <div>
        <label className="text-[11px] block mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Opacite: {backgroundOpacity}%
        </label>
        <input
          type="range"
          min={10}
          max={100}
          value={backgroundOpacity}
          onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
