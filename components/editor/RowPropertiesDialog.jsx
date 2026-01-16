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

export default function RowPropertiesDialog({ open, onOpenChange, row, onApply }) {
  const [properties, setProperties] = useState({
    height: '',
    backgroundColor: '',
    textAlign: 'left',
    verticalAlign: 'middle',
  });

  useEffect(() => {
    if (row && open) {
      const style = row.style;
      const computedStyle = window.getComputedStyle(row);
      
      setProperties({
        height: style.height || '',
        backgroundColor: style.backgroundColor || '',
        textAlign: style.textAlign || 'left',
        verticalAlign: style.verticalAlign || 'middle',
      });
    }
  }, [row, open]);

  const handleApply = () => {
    if (row) {
      // Apply to row
      if (properties.height) {
        row.style.height = properties.height.includes('px') ? properties.height : `${properties.height}px`;
      }
      if (properties.backgroundColor) {
        row.style.backgroundColor = properties.backgroundColor;
      }

      // Apply to all cells in row
      const cells = row.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.style.textAlign = properties.textAlign;
        cell.style.verticalAlign = properties.verticalAlign;
        if (properties.backgroundColor) {
          cell.style.backgroundColor = properties.backgroundColor;
        }
      });

      onApply();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Row Properties</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rowHeight">Row Height</Label>
            <Input
              id="rowHeight"
              value={properties.height}
              onChange={(e) => setProperties({ ...properties, height: e.target.value })}
              placeholder="50px"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rowTextAlign">Text Alignment</Label>
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
            <Label htmlFor="rowVerticalAlign">Vertical Alignment</Label>
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
            <Label htmlFor="rowBgColor">Background Color</Label>
            <div className="flex gap-2">
              <div 
                className="w-10 h-10 rounded border border-slate-200"
                style={{ backgroundColor: properties.backgroundColor || '#ffffff' }}
              />
              <Input
                id="rowBgColor"
                value={properties.backgroundColor}
                onChange={(e) => setProperties({ ...properties, backgroundColor: e.target.value })}
                placeholder="#ffffff"
                className="flex-1 font-mono"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply to Row
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
