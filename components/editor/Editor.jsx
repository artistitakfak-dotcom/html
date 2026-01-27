"use client";

import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  PanelLeftClose, 
  PanelLeftOpen,
  Maximize2,
  FileCode2,
  Eye,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeEditor from '@/components/editor/CodeEditor';
import PreviewPanel from '@/components/editor/PreviewPanel';

const defaultHtml = `<h2>Welcome To The HTML Editor!</h2>

<p style="font-size: 14px;">You can <strong style="background-color: #317399; padding: 0 5px; color: #fff;">type your text</strong> directly in the editor or paste it from a Word Doc, PDF, Excel etc.</p>

<p style="font-size: 14px;">The <strong>visual editor</strong> on the right and the <strong>source editor</strong> on the left are linked together and the changes are reflected in the other one as you type!</p>

<table style="border-collapse: collapse; width: auto; background-color: #ffffff;">
  <tr>
    <td style="border: 1px solid #d1d5db; padding: 8px; min-width: 80px;"><strong>Name</strong></td>
    <td style="border: 1px solid #d1d5db; padding: 8px; min-width: 100px;"><strong>City</strong></td>
    <td style="border: 1px solid #d1d5db; padding: 8px; min-width: 60px;"><strong>Age</strong></td>
  </tr>
  <tr>
    <td style="border: 1px solid #d1d5db; padding: 8px;">John</td>
    <td style="border: 1px solid #d1d5db; padding: 8px;">Chicago</td>
    <td style="border: 1px solid #d1d5db; padding: 8px;">23</td>
  </tr>
  <tr>
    <td style="border: 1px solid #d1d5db; padding: 8px; background-color: #fef3c7;">Lucy</td>
    <td style="border: 1px solid #d1d5db; padding: 8px; background-color: #fef3c7;">Wisconsin</td>
    <td style="border: 1px solid #d1d5db; padding: 8px; background-color: #fef3c7; color: #dc2626;">19</td>
  </tr>
  <tr>
    <td style="border: 1px solid #d1d5db; padding: 8px;">Amanda</td>
    <td style="border: 1px solid #d1d5db; padding: 8px;">Madison</td>
    <td style="border: 1px solid #d1d5db; padding: 8px;">22</td>
  </tr>
</table>

<p>This is a table you can experiment with.</p>`;

export default function Editor() {
  const [htmlCode, setHtmlCode] = useState(defaultHtml);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('split');
    const [cursorState, setCursorState] = useState({
    index: 0,
    line: 1,
    source: 'code',
  });
  const historyRef = useRef({ past: [], future: [] });
  const isHistoryActionRef = useRef(false);

  const recordHistory = useCallback((nextValue) => {
    if (isHistoryActionRef.current) {
      isHistoryActionRef.current = false;
      return;
    }
    if (nextValue === htmlCode) {
      return;
    }
    historyRef.current.past.push(htmlCode);
    historyRef.current.future = [];
  }, [htmlCode]);

  const handleCodeChange = useCallback((newCode) => {
    recordHistory(newCode);
    setHtmlCode(newCode);
  }, [recordHistory]);

  const handlePreviewChange = useCallback((newHtml) => {
    recordHistory(newHtml);
    setHtmlCode(newHtml);
  }, [recordHistory]);

  const handleClear = () => {
    recordHistory('');
    setHtmlCode('');
  };

  const handleUndo = useCallback(() => {
    const { past } = historyRef.current;
    if (!past.length) {
      return;
    }
    const previousValue = past.pop();
    historyRef.current.future.unshift(htmlCode);
    isHistoryActionRef.current = true;
    setHtmlCode(previousValue);
  }, [htmlCode]);

  const handleRedo = useCallback(() => {
    const { future } = historyRef.current;
    if (!future.length) {
      return;
    }
    const nextValue = future.shift();
    historyRef.current.past.push(htmlCode);
    isHistoryActionRef.current = true;
    setHtmlCode(nextValue);
  }, [htmlCode]);

    const handleCursorChange = useCallback((cursor) => {
    if (!cursor) return;
    setCursorState((prev) => ({
      index: cursor.index ?? prev.index,
      line: cursor.line ?? prev.line,
      source: cursor.source ?? prev.source,
    }));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FileCode2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">HTML Editor</h1>
              <p className="text-xs text-slate-500">Real-time WYSIWYG editing</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="code" className="text-xs gap-1.5">
                <FileCode2 className="h-3.5 w-3.5" />
                Code
              </TabsTrigger>
              <TabsTrigger value="split" className="text-xs gap-1.5">
                <Maximize2 className="h-3.5 w-3.5" />
                Split
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="text-slate-500"
          >
            {leftPanelCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Code Editor Panel */}
        {(activeView === 'code' || activeView === 'split') && (
          <motion.div
            initial={false}
            animate={{
              width: activeView === 'code' ? '100%' : leftPanelCollapsed ? '0%' : '45%',
              opacity: leftPanelCollapsed && activeView === 'split' ? 0 : 1,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CodeEditor
              value={htmlCode}
              onChange={handleCodeChange}
              onClear={handleClear}
              onCursorChange={handleCursorChange}
              activeLine={cursorState.line}
              cursorSource={cursorState.source}
            />
          </motion.div>
        )}

        {/* Divider with drag handle */}
        {activeView === 'split' && !leftPanelCollapsed && (
          <div className="w-1 bg-slate-300 rounded-full hover:bg-blue-400 cursor-col-resize transition-colors" />
        )}

        {/* Preview Panel */}
        {(activeView === 'preview' || activeView === 'split') && (
          <motion.div
            initial={false}
            animate={{
              width: activeView === 'preview' ? '100%' : leftPanelCollapsed ? '100%' : '55%',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <PreviewPanel
              html={htmlCode}
              onHtmlChange={handlePreviewChange}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onCursorChange={handleCursorChange}
              codeCursorIndex={cursorState.source === 'code' ? cursorState.index : null}
              />
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-2 bg-white border-t text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Real-time sync enabled
          </span>
        </div>
        <span>Edit HTML on the left, see changes on the right instantly</span>
      </footer>
    </div>
  );
}
