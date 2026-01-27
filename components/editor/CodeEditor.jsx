"use client"

import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CodeEditor({
  value,
  onChange,
  onClear,
  onCursorChange,
  activeLine,
  cursorSource,
}) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lineCount = value.split('\n').length;

  const syncScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success('Code copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
            if (onCursorChange) {
          onCursorChange({
            index: start + 2,
            line: newValue.substring(0, start + 2).split('\n').length,
            source: 'code',
          });
        }
      }, 0);
    }
  };

    const updateCursor = useCallback(
    (target) => {
      if (!onCursorChange || !target) return;
      const index = target.selectionStart ?? 0;
      const line = value.substring(0, index).split('\n').length;
      onCursorChange({ index, line, source: 'code' });
    },
    [onCursorChange, value],
  );

  useEffect(() => {
    if (!activeLine || !textareaRef.current || !lineNumbersRef.current) return;
    const lineHeight = 24;
    const targetTop = Math.max(0, (activeLine - 1) * lineHeight);
    const viewTop = textareaRef.current.scrollTop;
    const viewBottom = viewTop + textareaRef.current.clientHeight;
    if (targetTop < viewTop || targetTop + lineHeight > viewBottom) {
      const nextScrollTop = Math.max(0, targetTop - lineHeight * 2);
      textareaRef.current.scrollTop = nextScrollTop;
      lineNumbersRef.current.scrollTop = nextScrollTop;
    }
  }, [activeLine]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-slate-400 text-xs ml-2">HTML Source</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={handleCopy}
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Copy</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Download</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-red-400 hover:bg-slate-700"
            onClick={onClear}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Clear</span>
          </Button>
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="w-12 bg-slate-800 text-slate-500 text-xs font-mono py-3 overflow-hidden select-none text-right pr-3"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
              <div
              key={i}
              className={`leading-6 h-6 ${
                activeLine === i + 1
                  ? cursorSource === 'preview'
                    ? 'bg-blue-500/20 text-blue-200'
                    : 'bg-indigo-500/20 text-indigo-200'
                  : ''
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        
        {/* Code Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          onClick={(e) => updateCursor(e.target)}
          onKeyUp={(e) => updateCursor(e.target)}
          onSelect={(e) => updateCursor(e.target)}
          className="flex-1 bg-slate-900 text-slate-100 font-mono text-sm p-3 resize-none outline-none leading-6 overflow-x-auto overflow-y-auto whitespace-pre"
          wrap="off"
          spellCheck={false}
          placeholder="Enter your HTML code here..."
        />
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800 border-t border-slate-700 text-xs text-slate-500">
        <span>Lines: {lineCount}</span>
        <span>Characters: {value.length}</span>
      </div>
    </div>
  );
}
