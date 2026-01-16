import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Minus,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Merge,
  Split,
  Settings,
  Trash2,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignVerticalSpaceAround,
  ListTree,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ColorPicker from './ColorPicker';

export default function TableFloatingToolbar({
  position,
  onInsertRow,
  onInsertColumn,
  onDeleteRow,
  onDeleteColumn,
  onMergeCells,
  onSplitCell,
  onTableProperties,
  onDeleteTable,
  onCellBackgroundColor,
  onCellProperties,
  onRowProperties,
  onTextAlign,
  onVerticalAlign,
  canMerge,
  canSplit,
}) {
  if (!position) return null;

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-slate-200 p-1.5 flex items-center gap-1 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <TooltipProvider delayDuration={300}>
        {/* Insert Row */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onInsertRow('above')}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert Row Above</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onInsertRow('below')}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert Row Below</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Insert Column */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onInsertColumn('left')}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert Column Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onInsertColumn('right')}
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert Column Right</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
              onClick={onDeleteRow}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Row</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
              onClick={onDeleteColumn}
            >
              <Minus className="h-3.5 w-3.5 rotate-90" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Column</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Merge/Split */}
        {canMerge && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onMergeCells}
              >
                <Merge className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Merge Selected Cells</TooltipContent>
          </Tooltip>
        )}

        {canSplit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onSplitCell}
              >
                <Split className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Split Cell</TooltipContent>
        </Tooltip>
        )}

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Text Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onTextAlign('left')}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onTextAlign('center')}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onTextAlign('right')}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Vertical Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onVerticalAlign('top')}
            >
              <div className="flex flex-col items-center justify-start h-3.5 w-3.5">
                <div className="w-full h-0.5 bg-current" />
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Top</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onVerticalAlign('middle')}
            >
              <div className="flex flex-col items-center justify-center h-3.5 w-3.5">
                <div className="w-full h-0.5 bg-current" />
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Middle</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onVerticalAlign('bottom')}
            >
              <div className="flex flex-col items-center justify-end h-3.5 w-3.5">
                <div className="w-full h-0.5 bg-current" />
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Align Bottom</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Cell Background Color */}
        <ColorPicker
          value="#ffffff"
          onChange={onCellBackgroundColor}
          trigger={
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Palette className="h-3.5 w-3.5" />
            </Button>
          }
        />

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Cell Properties */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={onCellProperties}
            >
              <Settings className="h-3.5 w-3.5" />
              Cell
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cell Properties</TooltipContent>
        </Tooltip>

        {/* Row Properties */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={onRowProperties}
            >
              <ListTree className="h-3.5 w-3.5" />
              Row
            </Button>
          </TooltipTrigger>
          <TooltipContent>Row Properties</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Table Properties */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onTableProperties}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Table Properties</TooltipContent>
        </Tooltip>

        {/* Delete Table */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
              onClick={onDeleteTable}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Table</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
