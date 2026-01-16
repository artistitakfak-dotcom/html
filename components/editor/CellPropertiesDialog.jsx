import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CellPropertiesDialog({ open, onOpenChange, cells, onApply }) {
  const [properties, setProperties] = useState({
    width: '',
    height: '',
    textAlign: 'left',
    verticalAlign: 'top',
    backgroundColor: '',
    borderColor: '',
    borderWidth: '1',
    borderStyle: 'solid',
    padding: '8',
  });

  useEffect(() => {
    if (cells && cells.length > 0 && open) {
      const firstCell = cells[0];
      const style = firstCell.style;
      const computedStyle = window.getComputedStyle(firstCell);
      
      setProperties({
        width: style.width || '',
        height: style.height || '',
        textAlign: style.textAlign || computedStyle.textAlign || 'left',
        verticalAlign: style.verticalAlign || computedStyle.verticalAlign || 'top',
        backgroundColor: style.backgroundColor || '',
        borderColor: style.borderColor || '',
        borderWidth: style.borderWidth ? parseInt(style.borderWidth) : 1,
        borderStyle: style.borderStyle || 'solid',
        padding: style.padding ? parseInt(style.padding) : 8,
      });
    }
  }, [cells, open]);

  const handleApply = () => {
    if (cells && cells.length > 0) {
      cells.forEach(cell => {
        // Apply dimensions
        if (properties.width) {
          cell.style.width = properties.width.includes('px') || properties.width.includes('%') 
            ? properties.width 
            : `${properties.width}px`;
          cell.style.minWidth = cell.style.width;
        }
        if (properties.height) {
          cell.style.height = properties.height.includes('px') || properties.height.includes('%')
            ? properties.height
            : `${properties.height}px`;
        }

        // Apply alignment
        cell.style.textAlign = properties.textAlign;
        cell.style.verticalAlign = properties.verticalAlign;

        // Apply colors
        if (properties.backgroundColor) {
          cell.style.backgroundColor = properties.backgroundColor;
        }

        // Apply borders
        if (properties.borderColor) {
          const borderValue = `${properties.borderWidth}px ${properties.borderStyle} ${properties.borderColor}`;
          cell.style.border = borderValue;
        }

        // Apply padding
        cell.style.padding = `${properties.padding}px`;
      });

      onApply();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Cell Properties {cells && cells.length > 1 && `(${cells.length} cells)`}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="borders">Borders</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cellWidth">Width</Label>
                <Input
                  id="cellWidth"
                  value={properties.width}
                  onChange={(e) => setProperties({ ...properties, width: e.target.value })}
                  placeholder="100px or 20%"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cellHeight">Height</Label>
                <Input
                  id="cellHeight"
                  value={properties.height}
                  onChange={(e) => setProperties({ ...properties, height: e.target.value })}
                  placeholder="50px"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textAlign">Text Alignment</Label>
              <Select
                value={properties.textAlign}
                onValueChange={(value) => setProperties({ ...properties, textAlign: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verticalAlign">Vertical Alignment</Label>
              <Select
                value={properties.verticalAlign}
                onValueChange={(value) => setProperties({ ...properties, verticalAlign: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="padding">Cell Padding (px)</Label>
              <Input
                id="padding"
                type="number"
                min="0"
                max="50"
                value={properties.padding}
                onChange={(e) => setProperties({ ...properties, padding: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="borders" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="borderWidth">Border Width (px)</Label>
                <Input
                  id="borderWidth"
                  type="number"
                  min="0"
                  max="20"
                  value={properties.borderWidth}
                  onChange={(e) => setProperties({ ...properties, borderWidth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="borderStyle">Border Style</Label>
                <Select
                  value={properties.borderStyle}
                  onValueChange={(value) => setProperties({ ...properties, borderStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="borderColor">Border Color</Label>
              <div className="flex gap-2">
                <div 
                  className="w-10 h-10 rounded border border-slate-200"
                  style={{ backgroundColor: properties.borderColor || '#d1d5db' }}
                />
                <Input
                  id="borderColor"
                  value={properties.borderColor}
                  onChange={(e) => setProperties({ ...properties, borderColor: e.target.value })}
                  placeholder="#d1d5db"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="bgColor">Background Color</Label>
              <div className="flex gap-2">
                <div 
                  className="w-10 h-10 rounded border border-slate-200"
                  style={{ backgroundColor: properties.backgroundColor || '#ffffff' }}
                />
                <Input
                  id="bgColor"
                  value={properties.backgroundColor}
                  onChange={(e) => setProperties({ ...properties, backgroundColor: e.target.value })}
                  placeholder="#ffffff"
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-slate-50">
              <p className="text-sm text-slate-600 mb-2">Preview</p>
              <div className="bg-white p-2 rounded border">
                <table style={{ borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{
                        border: `${properties.borderWidth}px ${properties.borderStyle} ${properties.borderColor || '#d1d5db'}`,
                        padding: `${properties.padding}px`,
                        backgroundColor: properties.backgroundColor,
                        textAlign: properties.textAlign,
                        verticalAlign: properties.verticalAlign,
                        width: properties.width || '100px',
                        height: properties.height || '50px',
                      }}>
                        Sample Cell
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply to {cells && cells.length > 1 ? `${cells.length} Cells` : 'Cell'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
