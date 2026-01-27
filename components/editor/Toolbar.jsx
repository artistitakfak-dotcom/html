"use client"

import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Table,
  Paintbrush,
  Palette,
  Type,
  Undo,
  Redo,
  Link,
  Image,
  Minus,
  Square,
} from 'lucide-react';
import ColorPicker from './ColorPicker';

const fontSizes = ['8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];
const fontFamilies = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: '"Cormorant", serif', label: 'Cormorant' },
  { value: '"Source Serif 4", serif', label: 'Source Serif 4' },
];

function ToolbarButton({ icon: Icon, tooltip, onClick, active }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={active ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClick}
            onMouseDown={(event) => event.preventDefault()}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function Toolbar({ 
  onFormat, 
  onInsertTable, 
  onUndo, 
  onRedo,
  onFontSize,
  onFontFamily,
  onTextColor,
  onBgColor,
  onDocumentBgColor,
  onListMarkerColor,
  onInsertButton,
}) {
  const handleMenuFormat = (tag) => (event) => {
    event.preventDefault();
    onFormat('formatBlock', tag);
  };

  const handleMenuColor = (color) => (event) => {
    event.preventDefault();
    onTextColor(color);
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-white flex-wrap">
      <Menubar className="h-8 border-slate-200 px-1 shadow-none">
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-xs">Text</MenubarTrigger>
          <MenubarContent className="bg-white">
            <MenubarItem onSelect={handleMenuFormat('<h1>')}>
              Heading 1
            </MenubarItem>
            <MenubarItem onSelect={handleMenuFormat('<h2>')}>
              Heading 2
            </MenubarItem>
            <MenubarItem onSelect={handleMenuFormat('<h3>')}>
              Heading 3
            </MenubarItem>
            <MenubarItem onSelect={handleMenuFormat('<h4>')}>
              Heading 4
            </MenubarItem>
            <MenubarItem onSelect={handleMenuFormat('<p>')}>
              Paragraph
            </MenubarItem>
            <MenubarItem onSelect={handleMenuFormat('<blockquote>')}>
              Block Quote
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="text-red-600" onSelect={handleMenuColor('#dc2626')}>
              Red text
            </MenubarItem>
            <MenubarItem className="text-green-600" onSelect={handleMenuColor('#16a34a')}>
              Green text
            </MenubarItem>
            <MenubarItem className="text-blue-600" onSelect={handleMenuColor('#2563eb')}>
              Blue text
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Undo/Redo */}
      <ToolbarButton icon={Undo} tooltip="Undo (Ctrl+Z)" onClick={onUndo} />
      <ToolbarButton icon={Redo} tooltip="Redo (Ctrl+Y)" onClick={onRedo} />
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Font Family */}
      <Select onValueChange={onFontFamily} defaultValue="Arial, sans-serif">
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {fontFamilies.map((font) => (
            <SelectItem key={font.value} value={font.value} className="text-xs">
              <span style={{ fontFamily: font.value }}>{font.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Font Size */}
      <Select onValueChange={onFontSize} defaultValue="14">
        <SelectTrigger className="h-8 w-16 text-xs">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size} value={size} className="text-xs">
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Text Formatting */}
      <ToolbarButton icon={Bold} tooltip="Bold (Ctrl+B)" onClick={() => onFormat('bold')} />
      <ToolbarButton icon={Italic} tooltip="Italic (Ctrl+I)" onClick={() => onFormat('italic')} />
      <ToolbarButton icon={Underline} tooltip="Underline (Ctrl+U)" onClick={() => onFormat('underline')} />
      <ToolbarButton icon={Strikethrough} tooltip="Strikethrough" onClick={() => onFormat('strikeThrough')} />
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Colors */}
      <ColorPicker
        value="#000000"
        onChange={onTextColor}
        trigger={
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <div className="flex flex-col items-center">
              <Type className="h-3 w-3" />
              <div className="w-4 h-1 bg-current rounded-sm mt-0.5" />
            </div>
          </Button>
        }
      />
      
      <ColorPicker
        value="#ffffff"
        onChange={onBgColor}
        trigger={
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Paintbrush className="h-4 w-4" />
          </Button>
        }
      />

      <ColorPicker
        value="#ffffff"
        onChange={onDocumentBgColor}
        trigger={
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Palette className="h-4 w-4" />
          </Button>
        }
      />
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Alignment */}
      <ToolbarButton icon={AlignLeft} tooltip="Align Left" onClick={() => onFormat('justifyLeft')} />
      <ToolbarButton icon={AlignCenter} tooltip="Align Center" onClick={() => onFormat('justifyCenter')} />
      <ToolbarButton icon={AlignRight} tooltip="Align Right" onClick={() => onFormat('justifyRight')} />
      <ToolbarButton icon={AlignJustify} tooltip="Justify" onClick={() => onFormat('justifyFull')} />
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Lists */}
      <ToolbarButton icon={List} tooltip="Bullet List" onClick={() => onFormat('insertUnorderedList')} />
      <ToolbarButton icon={ListOrdered} tooltip="Numbered List" onClick={() => onFormat('insertOrderedList')} />
      <ColorPicker
        value="#000000"
        onChange={onListMarkerColor}
        trigger={
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <div className="flex flex-col items-center">
              <List className="h-3 w-3" />
              <div className="w-4 h-1 bg-current rounded-sm mt-0.5" />
            </div>
          </Button>
        }
      />
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Table */}
      <ToolbarButton icon={Table} tooltip="Insert Table" onClick={onInsertTable} />
      
      <ToolbarButton icon={Square} tooltip="Insert Button" onClick={onInsertButton} />
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Other */}
      <ToolbarButton icon={Link} tooltip="Insert Link" onClick={() => onFormat('createLink')} />
      <ToolbarButton icon={Image} tooltip="Insert Image" onClick={() => onFormat('insertImage')} />
      <ToolbarButton icon={Minus} tooltip="Horizontal Line" onClick={() => onFormat('insertHorizontalRule')} />
    </div>
  );
}
