"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function TableDialog({ open, onOpenChange, onInsert }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [showBorder, setShowBorder] = useState(true);
  const [cellWidth, setCellWidth] = useState(100);
  const [cellHeight, setCellHeight] = useState(30);

  const handleInsert = () => {
    // Validate inputs
    const validRows = Math.max(1, Math.min(50, parseInt(rows) || 3));
    const validCols = Math.max(1, Math.min(50, parseInt(cols) || 3));
    const validWidth = Math.max(20, Math.min(1000, parseInt(cellWidth) || 100));
    const validHeight = Math.max(20, Math.min(500, parseInt(cellHeight) || 30));
    
    const borderStyle = showBorder ? '1px solid #d1d5db' : 'none';
    
    let tableHtml = `<table style="border-collapse: collapse; width: auto;">\n`;
    
    for (let r = 0; r < validRows; r++) {
      tableHtml += '  <tr>\n';
      for (let c = 0; c < validCols; c++) {
        tableHtml += `    <td style="border: ${borderStyle}; padding: 8px; min-width: ${validWidth}px; height: ${validHeight}px; vertical-align: top;">&nbsp;</td>\n`;
      }
      tableHtml += '  </tr>\n';
    }
    tableHtml += '</table>';
    
    onInsert(tableHtml);
    onOpenChange(false);
    
    // Reset to defaults
    setRows(3);
    setCols(3);
    setCellWidth(100);
    setCellHeight(30);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cols">Columns</Label>
              <Input
                id="cols"
                type="number"
                min="1"
                max="20"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Cell Width (px)</Label>
              <Input
                id="width"
                type="number"
                min="20"
                value={cellWidth}
                onChange={(e) => setCellWidth(parseInt(e.target.value) || 100)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Cell Height (px)</Label>
              <Input
                id="height"
                type="number"
                min="20"
                value={cellHeight}
                onChange={(e) => setCellHeight(parseInt(e.target.value) || 30)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="border">Show Borders</Label>
            <Switch
              id="border"
              checked={showBorder}
              onCheckedChange={setShowBorder}
            />
          </div>
          
          {/* Preview */}
          <div className="border rounded-lg p-4 bg-slate-50">
            <Label className="text-xs text-slate-500 mb-2 block">Preview</Label>
            <div className="overflow-auto max-h-32">
              <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  {Array.from({ length: Math.min(rows, 5) }).map((_, r) => (
                    <tr key={r}>
                      {Array.from({ length: Math.min(cols, 5) }).map((_, c) => (
                        <td
                          key={c}
                          style={{
                            border: showBorder ? '1px solid #d1d5db' : '1px dashed #e5e7eb',
                            padding: '4px 8px',
                            minWidth: '40px',
                            height: '20px',
                            fontSize: '10px',
                            color: '#9ca3af'
                          }}
                        >
                          {r === 0 && c === 0 ? 'Cell' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>
            Insert Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
