"use client"

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

export default function TablePropertiesDialog({ open, onOpenChange, table, onApply }) {
  const [properties, setProperties] = useState({
    width: '100%',
    height: 'auto',
    lockWidth: false,
    lockHeight: false,
    alignment: 'left',
    borderWidth: '1',
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    cellPadding: '8',
    cellSpacing: '0',
    backgroundColor: '',
  });

  const isPixelValue = (value) => /^-?\d+(\.\d+)?px$/.test(value.trim());

  useEffect(() => {
    if (table && open) {
      const style = table.style;
      const computedStyle = window.getComputedStyle(table);
      const width = style.width || computedStyle.width || '100%';
      const height = style.height || 'auto';
      const lockWidth = table.dataset.lockWidth === 'true' && isPixelValue(width);
      const lockHeight = table.dataset.lockHeight === 'true' && isPixelValue(height);
      
      setProperties({
        width,
        height,
        lockWidth,
        lockHeight,
        alignment: style.marginLeft === 'auto' && style.marginRight === 'auto' ? 'center' 
                  : style.marginLeft === 'auto' ? 'right' : 'left',
        borderWidth: style.borderWidth ? parseInt(style.borderWidth) : 1,
        borderStyle: style.borderStyle || 'solid',
        borderColor: style.borderColor || '#d1d5db',
        cellPadding: table.getAttribute('cellpadding') || '8',
        cellSpacing: table.getAttribute('cellspacing') || '0',
        backgroundColor: style.backgroundColor || '',
      });
    }
  }, [table, open]);

  const handleApply = () => {
    if (table) {
      // Apply width and height
      table.style.width = properties.width;
      if (properties.height !== 'auto') {
        table.style.height = properties.height;
      } else {
        table.style.height = '';
      }

      if (properties.lockWidth && isPixelValue(properties.width)) {
        table.dataset.lockWidth = 'true';
        table.style.setProperty('--locked-width', properties.width);
      } else {
        delete table.dataset.lockWidth;
        table.style.removeProperty('--locked-width');
      }

      if (properties.lockHeight && isPixelValue(properties.height)) {
        table.dataset.lockHeight = 'true';
        table.style.setProperty('--locked-height', properties.height);
      } else {
        delete table.dataset.lockHeight;
        table.style.removeProperty('--locked-height');
      }

      // Apply alignment
      if (properties.alignment === 'center') {
        table.style.marginLeft = 'auto';
        table.style.marginRight = 'auto';
      } else if (properties.alignment === 'right') {
        table.style.marginLeft = 'auto';
        table.style.marginRight = '0';
      } else {
        table.style.marginLeft = '0';
        table.style.marginRight = 'auto';
      }

      // Apply border
      const borderValue = `${properties.borderWidth}px ${properties.borderStyle} ${properties.borderColor}`;
      table.style.border = borderValue;
      
      // Apply border to all cells if needed
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        if (properties.borderWidth === '0') {
          cell.style.border = 'none';
        } else {
          cell.style.border = borderValue;
        }
        cell.style.padding = `${properties.cellPadding}px`;
      });

      // Apply cell spacing (through border-collapse)
      if (properties.cellSpacing === '0') {
        table.style.borderCollapse = 'collapse';
      } else {
        table.style.borderCollapse = 'separate';
        table.style.borderSpacing = `${properties.cellSpacing}px`;
      }

      // Apply background color
      if (properties.backgroundColor) {
        table.style.backgroundColor = properties.backgroundColor;
      } else {
        table.style.backgroundColor = '';
      }

      onApply();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Table Properties</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dimensions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dimensions">Size</TabsTrigger>
            <TabsTrigger value="borders">Borders</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="dimensions" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={properties.width}
                  onChange={(e) => {
                    const width = e.target.value;
                    setProperties({
                      ...properties,
                      width,
                      lockWidth: isPixelValue(width) ? properties.lockWidth : false,
                    });
                  }}
                  placeholder="100% or 500px"
                />
                <p className="text-xs text-slate-500">Use px, %, or auto</p>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label htmlFor="lockWidth" className="text-sm text-slate-700">
                    Lock width (px)
                  </Label>
                  <Button
                    id="lockWidth"
                    type="button"
                    size="sm"
                    variant={properties.lockWidth ? "default" : "outline"}
                    onClick={() =>
                      setProperties({ ...properties, lockWidth: !properties.lockWidth })
                    }
                    disabled={!isPixelValue(properties.width)}
                    aria-pressed={properties.lockWidth}
                  >
                    {properties.lockWidth ? "Locked" : "Unlocked"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={properties.height}
                  onChange={(e) => {
                    const height = e.target.value;
                    setProperties({
                      ...properties,
                      height,
                      lockHeight: isPixelValue(height) ? properties.lockHeight : false,
                    });
                  }}
                  placeholder="auto or 300px"
                />
                <p className="text-xs text-slate-500">Use px or auto</p>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <Label htmlFor="lockHeight" className="text-sm text-slate-700">
                    Lock height (px)
                  </Label>
                  <Button
                    id="lockHeight"
                    type="button"
                    size="sm"
                    variant={properties.lockHeight ? "default" : "outline"}
                    onClick={() =>
                      setProperties({ ...properties, lockHeight: !properties.lockHeight })
                    }
                    disabled={!isPixelValue(properties.height)}
                    aria-pressed={properties.lockHeight}
                  >
                    {properties.lockHeight ? "Locked" : "Unlocked"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alignment">Table Alignment</Label>
              <Select
                value={properties.alignment}
                onValueChange={(value) => setProperties({ ...properties, alignment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
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
                  style={{ backgroundColor: properties.borderColor }}
                />
                <Input
                  id="borderColor"
                  value={properties.borderColor}
                  onChange={(e) => setProperties({ ...properties, borderColor: e.target.value })}
                  placeholder="#d1d5db"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cellPadding">Cell Padding (px)</Label>
                <Input
                  id="cellPadding"
                  type="number"
                  min="0"
                  max="50"
                  value={properties.cellPadding}
                  onChange={(e) => setProperties({ ...properties, cellPadding: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cellSpacing">Cell Spacing (px)</Label>
                <Input
                  id="cellSpacing"
                  type="number"
                  min="0"
                  max="20"
                  value={properties.cellSpacing}
                  onChange={(e) => setProperties({ ...properties, cellSpacing: e.target.value })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
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
                  placeholder="#ffffff or leave empty"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-slate-50">
              <p className="text-sm text-slate-600 mb-2">Preview</p>
              <div className="bg-white p-2 rounded border overflow-auto max-h-40">
                <table style={{
                  width: '100%',
                  borderCollapse: properties.cellSpacing === '0' ? 'collapse' : 'separate',
                  border: `${properties.borderWidth}px ${properties.borderStyle} ${properties.borderColor}`,
                  backgroundColor: properties.backgroundColor,
                }}>
                  <tbody>
                    <tr>
                      <td style={{
                        border: `${properties.borderWidth}px ${properties.borderStyle} ${properties.borderColor}`,
                        padding: `${properties.cellPadding}px`,
                      }}>Sample</td>
                      <td style={{
                        border: `${properties.borderWidth}px ${properties.borderStyle} ${properties.borderColor}`,
                        padding: `${properties.cellPadding}px`,
                      }}>Cell</td>
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
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
