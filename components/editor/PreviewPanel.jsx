"use client"

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Toolbar from './Toolbar';
import TableDialog from './TableDialog';
import TableFloatingToolbar from './TableFloatingToolbar';
import TablePropertiesDialog from './TablePropertiesDialog';
import CellPropertiesDialog from './CellPropertiesDialog';
import RowPropertiesDialog from './RowPropertiesDialog';

export default function PreviewPanel({ html, onHtmlChange }) {
  const editorRef = useRef(null);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tablePropertiesOpen, setTablePropertiesOpen] = useState(false);
  const [cellPropertiesOpen, setCellPropertiesOpen] = useState(false);
  const [rowPropertiesOpen, setRowPropertiesOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentTable, setCurrentTable] = useState(null);
  const [toolbarPosition, setToolbarPosition] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Update editor content when html prop changes (from code editor)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
      makeTablesResizable();
    }
  }, [html]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onHtmlChange(editorRef.current.innerHTML);
    }
  }, [onHtmlChange]);

  const execCommand = (command, value = null) => {
    editorRef.current?.focus();
    
    if (command === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else if (command === 'insertImage') {
      const url = prompt('Enter image URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else if (command === 'formatBlock') {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false, value);
    }
    
    handleInput();
  };

  const handleFontSize = (size) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      range.surroundContents(span);
      handleInput();
    }
  };

  const handleFontFamily = (font) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontFamily = font;
      range.surroundContents(span);
      handleInput();
    }
  };

  const handleTextColor = (color) => {
    execCommand('foreColor', color);
  };

  const handleBgColor = (color) => {
    // Check if we're in a table cell
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      
      // Find parent TD or TH
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'TD' || node.nodeName === 'TH') {
          node.style.backgroundColor = color;
          handleInput();
          return;
        }
        node = node.parentNode;
      }
    }
    
    // Otherwise apply to selection
    execCommand('hiliteColor', color);
  };

  const insertTable = (tableHtml) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    // Get current selection
    const selection = window.getSelection();
    let range;
    
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      // If no selection, create one at the end of the editor
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Try execCommand first (works in most browsers)
    const success = document.execCommand('insertHTML', false, tableHtml);
    
    // Fallback: manually insert if execCommand fails
    if (!success) {
      const div = document.createElement('div');
      div.innerHTML = tableHtml;
      const table = div.firstChild;
      
      range.deleteContents();
      range.insertNode(table);
      
      // Move cursor after the table
      range.setStartAfter(table);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Ensure changes are saved and tables are made resizable
    setTimeout(() => {
      makeTablesResizable();
      handleInput();
    }, 10);
  };

  const makeTablesResizable = () => {
    if (!editorRef.current) return;
    
    const tables = editorRef.current.querySelectorAll('table');
    tables.forEach(table => {
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.style.position = 'relative';
        cell.style.cursor = 'default';
        
        // Remove existing handles
        const existingHandles = cell.querySelectorAll('.resize-handle');
        existingHandles.forEach(h => h.remove());
        
        // Add resize handle
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.style.cssText = `
          position: absolute;
          right: 0;
          bottom: 0;
          width: 10px;
          height: 10px;
          cursor: nwse-resize;
          background: linear-gradient(135deg, transparent 50%, #3b82f6 50%);
          opacity: 0;
          transition: opacity 0.2s;
        `;
        
        cell.addEventListener('mouseenter', () => {
          handle.style.opacity = '1';
        });
        
        cell.addEventListener('mouseleave', () => {
          if (!resizing) {
            handle.style.opacity = '0';
          }
        });
        
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = cell.offsetWidth;
          const startHeight = cell.offsetHeight;
          
          const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            
            cell.style.width = `${Math.max(30, startWidth + deltaX)}px`;
            cell.style.minWidth = `${Math.max(30, startWidth + deltaX)}px`;
            cell.style.height = `${Math.max(20, startHeight + deltaY)}px`;
          };
          
          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            handleInput();
          };
          
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
        
        cell.appendChild(handle);
      });
    });
  };

  // Handle click on table cells for cell-specific actions
  const handleCellClick = (e) => {
    const cell = e.target.closest('td, th');
    if (cell) {
      // Clear previous selection
      if (!e.shiftKey) {
        selectedCells.forEach(c => c.classList.remove('table-cell-selected'));
        setSelectedCells([cell]);
        cell.classList.add('table-cell-selected');
      } else if (selectedCells.length > 0) {
        // Shift-click for multi-select
        if (!selectedCells.includes(cell)) {
          cell.classList.add('table-cell-selected');
          setSelectedCells([...selectedCells, cell]);
        }
      }
      
      setSelectedCell(cell);
      const table = cell.closest('table');
      setCurrentTable(table);
      
      // Position floating toolbar
      const rect = cell.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();
      setToolbarPosition({
        x: rect.left,
        y: rect.top - 50,
      });
    } else {
      // Clicked outside table
      selectedCells.forEach(c => c.classList.remove('table-cell-selected'));
      setSelectedCells([]);
      setSelectedCell(null);
      setCurrentTable(null);
      setToolbarPosition(null);
    }
  };

  // Table operations
  const getCellPosition = (cell) => {
    const row = cell.parentElement;
    const table = row.parentElement.parentElement;
    const rows = Array.from(table.querySelectorAll('tr'));
    const rowIndex = rows.indexOf(row);
    const cells = Array.from(row.children);
    const cellIndex = cells.indexOf(cell);
    return { rowIndex, cellIndex, row, table };
  };

  const insertRow = (position) => {
    if (!selectedCell) return;
    const { rowIndex, table } = getCellPosition(selectedCell);
    const rows = table.querySelectorAll('tr');
    const columnCount = rows[0].children.length;
    
    const newRow = document.createElement('tr');
    for (let i = 0; i < columnCount; i++) {
      const newCell = document.createElement('td');
      newCell.style.cssText = rows[0].children[0].style.cssText;
      newCell.innerHTML = '&nbsp;';
      newRow.appendChild(newCell);
    }
    
    if (position === 'above') {
      rows[rowIndex].parentElement.insertBefore(newRow, rows[rowIndex]);
    } else {
      if (rows[rowIndex].nextSibling) {
        rows[rowIndex].parentElement.insertBefore(newRow, rows[rowIndex].nextSibling);
      } else {
        rows[rowIndex].parentElement.appendChild(newRow);
      }
    }
    
    makeTablesResizable();
    handleInput();
  };

  const insertColumn = (position) => {
    if (!selectedCell) return;
    const { cellIndex, table } = getCellPosition(selectedCell);
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
      const cells = Array.from(row.children);
      const newCell = document.createElement('td');
      newCell.style.cssText = cells[0].style.cssText;
      newCell.innerHTML = '&nbsp;';
      
      if (position === 'left') {
        row.insertBefore(newCell, cells[cellIndex]);
      } else {
        if (cells[cellIndex].nextSibling) {
          row.insertBefore(newCell, cells[cellIndex].nextSibling);
        } else {
          row.appendChild(newCell);
        }
      }
    });
    
    makeTablesResizable();
    handleInput();
  };

  const deleteRow = () => {
    if (!selectedCell) return;
    const { row, table } = getCellPosition(selectedCell);
    const rows = table.querySelectorAll('tr');
    
    if (rows.length <= 1) {
      alert('Cannot delete the last row');
      return;
    }
    
    row.remove();
    setSelectedCell(null);
    setToolbarPosition(null);
    handleInput();
  };

  const deleteColumn = () => {
    if (!selectedCell) return;
    const { cellIndex, table } = getCellPosition(selectedCell);
    const rows = table.querySelectorAll('tr');
    
    if (rows[0].children.length <= 1) {
      alert('Cannot delete the last column');
      return;
    }
    
    rows.forEach(row => {
      if (row.children[cellIndex]) {
        row.children[cellIndex].remove();
      }
    });
    
    setSelectedCell(null);
    setToolbarPosition(null);
    handleInput();
  };

  const mergeCells = () => {
    if (selectedCells.length < 2) {
      alert('Please select at least 2 cells to merge');
      return;
    }
    
    // Get all selected cells and find bounds
    const firstCell = selectedCells[0];
    const table = firstCell.closest('table');
    const rows = Array.from(table.querySelectorAll('tr'));
    
    let minRow = Infinity, maxRow = -Infinity;
    let minCol = Infinity, maxCol = -Infinity;
    
    selectedCells.forEach(cell => {
      const row = cell.parentElement;
      const rowIndex = rows.indexOf(row);
      const colIndex = Array.from(row.children).indexOf(cell);
      
      minRow = Math.min(minRow, rowIndex);
      maxRow = Math.max(maxRow, rowIndex);
      minCol = Math.min(minCol, colIndex);
      maxCol = Math.max(maxCol, colIndex);
    });
    
    const rowSpan = maxRow - minRow + 1;
    const colSpan = maxCol - minCol + 1;
    
    // Merge content
    let mergedContent = selectedCells
      .map(cell => cell.innerHTML)
      .filter(content => content.trim() && content !== '&nbsp;')
      .join(' ');
    
    if (!mergedContent) mergedContent = '&nbsp;';
    
    // Set spans on first cell
    firstCell.rowSpan = rowSpan;
    firstCell.colSpan = colSpan;
    firstCell.innerHTML = mergedContent;
    
    // Remove other cells
    selectedCells.slice(1).forEach(cell => {
      if (cell !== firstCell) {
        cell.remove();
      }
    });
    
    selectedCells.forEach(c => c.classList.remove('table-cell-selected'));
    setSelectedCells([firstCell]);
    firstCell.classList.add('table-cell-selected');
    
    handleInput();
  };

  const splitCell = () => {
    if (!selectedCell) return;
    
    const rowSpan = parseInt(selectedCell.rowSpan) || 1;
    const colSpan = parseInt(selectedCell.colSpan) || 1;
    
    if (rowSpan === 1 && colSpan === 1) {
      alert('This cell is not merged');
      return;
    }
    
    const { row, table, rowIndex, cellIndex } = getCellPosition(selectedCell);
    const rows = Array.from(table.querySelectorAll('tr'));
    
    // Reset spans
    selectedCell.rowSpan = 1;
    selectedCell.colSpan = 1;
    
    // Add cells for colspan
    for (let c = 1; c < colSpan; c++) {
      const newCell = document.createElement('td');
      newCell.style.cssText = selectedCell.style.cssText;
      newCell.innerHTML = '&nbsp;';
      if (selectedCell.nextSibling) {
        row.insertBefore(newCell, selectedCell.nextSibling);
      } else {
        row.appendChild(newCell);
      }
    }
    
    // Add cells for rowspan
    for (let r = 1; r < rowSpan; r++) {
      const targetRow = rows[rowIndex + r];
      if (targetRow) {
        for (let c = 0; c < colSpan; c++) {
          const newCell = document.createElement('td');
          newCell.style.cssText = selectedCell.style.cssText;
          newCell.innerHTML = '&nbsp;';
          
          // Find correct position to insert
          const cells = Array.from(targetRow.children);
          if (cells[cellIndex + c]) {
            targetRow.insertBefore(newCell, cells[cellIndex + c]);
          } else {
            targetRow.appendChild(newCell);
          }
        }
      }
    }
    
    makeTablesResizable();
    handleInput();
  };

  const deleteTable = () => {
    if (!currentTable) return;
    
    if (confirm('Are you sure you want to delete this table?')) {
      currentTable.remove();
      setSelectedCell(null);
      setCurrentTable(null);
      setToolbarPosition(null);
      selectedCells.forEach(c => c.classList.remove('table-cell-selected'));
      setSelectedCells([]);
      handleInput();
    }
  };

  const setCellBackgroundColor = (color) => {
    selectedCells.forEach(cell => {
      cell.style.backgroundColor = color;
    });
    handleInput();
  };

  const setTextAlign = (align) => {
    selectedCells.forEach(cell => {
      cell.style.textAlign = align;
    });
    handleInput();
  };

  const setVerticalAlign = (align) => {
    selectedCells.forEach(cell => {
      cell.style.verticalAlign = align;
    });
    handleInput();
  };

  const openTableProperties = () => {
    setTablePropertiesOpen(true);
  };

  const openCellProperties = () => {
    setCellPropertiesOpen(true);
  };

  const openRowProperties = () => {
    if (selectedCell) {
      const row = selectedCell.closest('tr');
      setSelectedRow(row);
      setRowPropertiesOpen(true);
    }
  };

  const canMerge = selectedCells.length >= 2;
  const canSplit = selectedCell && ((parseInt(selectedCell.rowSpan) || 1) > 1 || (parseInt(selectedCell.colSpan) || 1) > 1);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm border">
      <style>{`
        .table-cell-selected {
          outline: 2px solid #3b82f6 !important;
          outline-offset: -2px;
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
      
      <Toolbar
        onFormat={execCommand}
        onInsertTable={() => setTableDialogOpen(true)}
        onUndo={() => execCommand('undo')}
        onRedo={() => execCommand('redo')}
        onFontSize={handleFontSize}
        onFontFamily={handleFontFamily}
        onTextColor={handleTextColor}
        onBgColor={handleBgColor}
      />
      
      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onClick={handleCellClick}
          className="min-h-full bg-white p-8 shadow-sm border rounded-lg outline-none prose prose-sm max-w-none"
          style={{
            minHeight: '400px',
            lineHeight: '1.6',
          }}
        />
      </div>
      
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-100 border-t text-xs text-slate-500">
        <span>Visual Editor</span>
        <span>
          {selectedCells.length > 1 
            ? `${selectedCells.length} cells selected` 
            : selectedCell 
            ? 'Cell selected - Use floating toolbar' 
            : 'Click to edit'}
        </span>
      </div>
      
      <TableDialog
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        onInsert={insertTable}
      />

      <TableFloatingToolbar
        position={toolbarPosition}
        onInsertRow={insertRow}
        onInsertColumn={insertColumn}
        onDeleteRow={deleteRow}
        onDeleteColumn={deleteColumn}
        onMergeCells={mergeCells}
        onSplitCell={splitCell}
        onTableProperties={openTableProperties}
        onDeleteTable={deleteTable}
        onCellBackgroundColor={setCellBackgroundColor}
        onCellProperties={openCellProperties}
        onRowProperties={openRowProperties}
        onTextAlign={setTextAlign}
        onVerticalAlign={setVerticalAlign}
        canMerge={canMerge}
        canSplit={canSplit}
      />

      <TablePropertiesDialog
        open={tablePropertiesOpen}
        onOpenChange={setTablePropertiesOpen}
        table={currentTable}
        onApply={handleInput}
      />

      <CellPropertiesDialog
        open={cellPropertiesOpen}
        onOpenChange={setCellPropertiesOpen}
        cells={selectedCells}
        onApply={handleInput}
      />

      <RowPropertiesDialog
        open={rowPropertiesOpen}
        onOpenChange={setRowPropertiesOpen}
        row={selectedRow}
        onApply={handleInput}
      />
    </div>
  );
}
