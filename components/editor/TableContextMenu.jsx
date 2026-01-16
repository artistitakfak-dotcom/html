"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Copy,
  Palette,
} from 'lucide-react';
import ColorPicker from './ColorPicker';

export default function TableContextMenu({ 
  children, 
  onInsertRow, 
  onInsertColumn,
  onDeleteRow,
  onDeleteColumn,
  onMergeCells,
  onSplitCell,
  onTableProperties,
  onDeleteTable,
  onCellBackgroundColor,
  canMerge,
  canSplit,
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="w-4 h-4 mr-2" />
            Insert Row
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => onInsertRow('above')}>
              <ArrowUp className="w-4 h-4 mr-2" />
              Above
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onInsertRow('below')}>
              <ArrowDown className="w-4 h-4 mr-2" />
              Below
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="w-4 h-4 mr-2" />
            Insert Column
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => onInsertColumn('left')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Left
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onInsertColumn('right')}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Right
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Minus className="w-4 h-4 mr-2" />
            Delete
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={onDeleteRow}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Row
            </ContextMenuItem>
            <ContextMenuItem onClick={onDeleteColumn}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Column
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onDeleteTable} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Table
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {canMerge && (
          <ContextMenuItem onClick={onMergeCells}>
            <Merge className="w-4 h-4 mr-2" />
            Merge Cells
          </ContextMenuItem>
        )}

        {canSplit && (
          <ContextMenuItem onClick={onSplitCell}>
            <Split className="w-4 h-4 mr-2" />
            Split Cell
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onTableProperties}>
          <Settings className="w-4 h-4 mr-2" />
          Table Properties
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
