import { useEffect, useId, useState } from 'react';
import type { ChangeEvent } from 'react';
import { validateScreenshotFiles } from '../lib/idb';

interface ScreenshotPickerProps {
  id?: string;
  label: string;
  /** Selected files (controlled). */
  files: File[];
  onChange: (files: File[], message: string | null) => void;
  status: string;
}

/**
 * Shared PNG/JPG/WebP picker with thumbnail previews and validation.
 * Images are kept in memory (or IndexedDB by the caller); nothing is uploaded.
 */
export default function ScreenshotPicker({ label, files, onChange, status }: ScreenshotPickerProps) {
  const inputId = useId();
  const [previews, setPreviews] = useState<Array<{ url: string; name: string }>>([]);

  useEffect(() => {
    const next = files.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    setPreviews(next);
    return () => next.forEach((p) => URL.revokeObjectURL(p.url));
  }, [files]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    const error = validateScreenshotFiles(selected);
    if (error) {
      onChange([], error);
      return;
    }
    onChange(selected, selected.length ? `${selected.length} screenshot(s) attached.` : null);
  };

  return (
    <div>
      <label className="form-grid" style={{ display: 'grid', gap: 7, color: 'var(--muted)', fontSize: 12.5, fontWeight: 500 }}>
        {label}
        <input id={inputId} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleChange} />
      </label>
      <p className="chart-footnote" aria-live="polite" style={{ marginTop: 6 }}>
        {status}
      </p>
      {previews.length > 0 && (
        <div className="screenshot-list">
          {previews.map((preview, i) => (
            <div className="screenshot-preview" key={`${preview.name}-${i}`}>
              <img src={preview.url} alt={`Screenshot attachment: ${preview.name}`} />
              <small title={preview.name}>{preview.name}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
