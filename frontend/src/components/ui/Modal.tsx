'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog 
      ref={dialogRef}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-surface p-0 rounded-lg shadow-2xl overflow-hidden w-full max-w-md"
      onClose={onClose}
    >
      <div className="flex justify-between items-center p-6 border-b border-border">
        <h3 className="font-sans font-medium text-xl text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md text-gray-500">
          <X size={20} />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </dialog>
  );
}
