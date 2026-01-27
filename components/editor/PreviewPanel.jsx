"use client"

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Toolbar from './Toolbar';
import TableDialog from './TableDialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import TablePropertiesDialog from './TablePropertiesDialog';
import CellPropertiesDialog from './CellPropertiesDialog';
import RowPropertiesDialog from './RowPropertiesDialog';
import ButtonPropertiesDialog from './components/editor/ButtonPropertiesDialog';
import { Button } from "@/components/ui/button";

export default function PreviewPanel({
  html,
  onHtmlChange,
  onUndo,
  onRedo,
  onCursorChange,
  codeCursorIndex,
}) {
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const codeCursorElementRef = useRef(null);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tablePropertiesOpen, setTablePropertiesOpen] = useState(false);
  const [cellPropertiesOpen, setCellPropertiesOpen] = useState(false);
  const [rowPropertiesOpen, setRowPropertiesOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentTable, setCurrentTable] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);
  const [buttonPropertiesOpen, setButtonPropertiesOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

    const normalizeTableImages = () => {
    if (!editorRef.current) return;
    const cells = editorRef.current.querySelectorAll('td, th');
    cells.forEach(cell => {
      const images = Array.from(cell.querySelectorAll('img'));
      images.forEach(img => {
        img.style.display = 'block';
        img.style.margin = '0';
      });

      const trimmedContent = cell.textContent?.trim() || '';
      if (images.length === 1 && trimmedContent === '') {
        cell.style.padding = '0';
      }
    });
  };

    const getNodePath = (node, root) => {
    const path = [];
    let current = node;
    while (current && current !== root) {
      const parent = current.parentNode;
      if (!parent) break;
      const index = Array.from(parent.childNodes).indexOf(current);
      path.unshift(index);
      current = parent;
    }
    return path;
  };

  const getNodeFromPath = (root, path) => {
    let current = root;
    for (const index of path) {
      if (!current?.childNodes?.[index]) {
        return null;
      }
      current = current.childNodes[index];
    }
    return current;
  };

  const getLineNumberFromIndex = (source, index) => {
    if (index < 0) return null;
    return source.slice(0, index).split('\n').length;
  };

  const getLineNumberForElement = (source, element) => {
    if (!element) return null;
    const outerHTML = element.outerHTML || '';
    if (!outerHTML) return null;
    let index = source.indexOf(outerHTML);
    if (index === -1) {
      const tagName = element.tagName?.toLowerCase();
      if (!tagName) return null;
      index = source.toLowerCase().indexOf(`<${tagName}`);
    }
    if (index === -1) return null;
    return getLineNumberFromIndex(source, index);
  };

  // Update editor content when html prop changes (from code editor)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
      makeTablesResizable();
      makeButtonsResizable();
    }
  }, [html]);

    useEffect(() => {
    if (!editorRef.current) return;
    if (codeCursorElementRef.current) {
      codeCursorElementRef.current.removeAttribute('data-code-cursor');
      codeCursorElementRef.current = null;
    }
    if (codeCursorIndex == null) return;
    const marker = 'CODE_CURSOR_MARKER';
    const htmlWithMarker = `${html.slice(0, codeCursorIndex)}<!--${marker}-->${html.slice(
      codeCursorIndex,
    )}`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlWithMarker, 'text/html');
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_COMMENT);
    let markerNode = null;
    while (walker.nextNode()) {
      if (walker.currentNode.data === marker) {
        markerNode = walker.currentNode;
        break;
      }
    }
    if (!markerNode) return;
    let target = markerNode.parentElement || doc.body;
    if (target === doc.body && doc.body.firstChild) {
      target = doc.body.firstChild;
    }
    const path = getNodePath(target, doc.body);
    const actualNode = getNodeFromPath(editorRef.current, path);
    const actualElement =
      actualNode?.nodeType === Node.ELEMENT_NODE ? actualNode : actualNode?.parentElement;
    if (actualElement) {
      actualElement.setAttribute('data-code-cursor', 'true');
      codeCursorElementRef.current = actualElement;
    }
  }, [codeCursorIndex, html]);
  
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      normalizeTableImages();
      makeButtonsResizable();
      onHtmlChange(editorRef.current.innerHTML);
    }
  }, [normalizeTableImages, onHtmlChange]);

    const getSelectionTextColor = () => {
    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;
    if (!anchorNode) return null;
    const element = anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentElement;
    if (!element) return null;
    return window.getComputedStyle(element).color;
  };

  const getSelectedListItems = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return [];

    const range = selection.getRangeAt(0);
    const listItems = Array.from(editorRef.current.querySelectorAll('li')).filter((li) =>
      range.intersectsNode(li),
    );

    if (listItems.length > 0) {
      return listItems;
    }

    const anchorNode = selection.anchorNode;
    const anchorElement = anchorNode?.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode?.parentElement;
    const closestListItem = anchorElement?.closest('li');
    if (closestListItem && editorRef.current.contains(closestListItem)) {
      return [closestListItem];
    }

    return [];
  };

  const applyListMarkerColor = (color, { onlyIfUnset = false } = {}) => {
    if (!color) return;
    const listItems = getSelectedListItems();
    if (listItems.length === 0) return;
    listItems.forEach((item) => {
      if (onlyIfUnset && item.style.getPropertyValue('--list-marker-color')) {
        return;
      }
      item.style.setProperty('--list-marker-color', color);
    });
  };

  const getClosestLink = (node) => {
    if (!node) return null;
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return element?.closest('a') ?? null;
  };

  const updateActiveLink = useCallback(
    ({ explicitButton } = {}) => {
      const selection = window.getSelection();
      if (!selection?.rangeCount || !editorRef.current) {
        setActiveLink(null);
        return;
      }
      const range = selection.getRangeAt(0);
      if (!editorRef.current.contains(range.commonAncestorContainer)) {
        setActiveLink(null);
        return;
      }
      const linkFromSelection = getClosestLink(selection.anchorNode);
      const buttonLink = (explicitButton ?? selectedButton)?.closest('a');
      setActiveLink(buttonLink || linkFromSelection || null);
    },
    [selectedButton],
  );

const updateCursorFromSelection = useCallback(() => {
    if (!onCursorChange || !editorRef.current) return;
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    const anchorNode = selection.anchorNode;
    const element =
      anchorNode?.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode?.parentElement;
    if (!element) return;
    const line = getLineNumberForElement(html, element);
    if (!line) return;
    onCursorChange({ line, source: 'preview' });
  }, [getLineNumberForElement, html, onCursorChange]);

  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveLink();
      updateCursorFromSelection();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveLink, updateCursorFromSelection]);

  const applyLinkStyles = (link, { isButton = false } = {}) => {
    if (!link) return;
    link.style.color = 'inherit';
    link.style.textDecoration = isButton ? 'none' : 'inherit';
    if (isButton) {
      link.style.display = 'inline-block';
    }
  };

  const unwrapLink = (link) => {
    if (!link?.parentNode) return;
    const parent = link.parentNode;
    while (link.firstChild) {
      parent.insertBefore(link.firstChild, link);
    }
    parent.removeChild(link);
  };

  const createOrUpdateLink = (url) => {
    if (!url) return;
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return;
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;

    const existingLink = getClosestLink(selection.anchorNode);
    if (existingLink) {
      existingLink.setAttribute('href', url);
      applyLinkStyles(existingLink, {
        isButton: !!existingLink.querySelector('button[data-editor-button="true"]'),
      });
      setActiveLink(existingLink);
      handleInput();
      return;
    }

    const targetButton =
      selectedButton ||
      getClosestLink(range.commonAncestorContainer)?.querySelector('button[data-editor-button="true"]') ||
      (range.commonAncestorContainer?.nodeType === Node.ELEMENT_NODE
        ? range.commonAncestorContainer
        : range.commonAncestorContainer?.parentElement
      )?.closest('button[data-editor-button="true"]');

    if (targetButton) {
      const existingButtonLink = targetButton.closest('a');
      if (existingButtonLink) {
        existingButtonLink.setAttribute('href', url);
        applyLinkStyles(existingButtonLink, { isButton: true });
        setActiveLink(existingButtonLink);
      } else {
        const link = document.createElement('a');
        link.setAttribute('href', url);
        applyLinkStyles(link, { isButton: true });
        targetButton.parentNode.insertBefore(link, targetButton);
        link.appendChild(targetButton);
        setActiveLink(link);
      }
      handleInput();
      return;
    }

    if (selection.isCollapsed) return;

    const link = document.createElement('a');
    link.setAttribute('href', url);
    applyLinkStyles(link);
    const contents = range.extractContents();
    link.appendChild(contents);
    range.insertNode(link);
    selection.removeAllRanges();
    const updatedRange = document.createRange();
    updatedRange.selectNodeContents(link);
    selection.addRange(updatedRange);
    setActiveLink(link);
    handleInput();
  };

  const handleCreateLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      createOrUpdateLink(url);
    }
  };

  const handleEditLink = () => {
    if (!activeLink) return;
    const current = activeLink.getAttribute('href') || '';
    const url = prompt('Edit URL:', current);
    if (url) {
      activeLink.setAttribute('href', url);
      applyLinkStyles(activeLink, {
        isButton: !!activeLink.querySelector('button[data-editor-button="true"]'),
      });
      handleInput();
    }
  };

  const handleRemoveLink = () => {
    if (!activeLink) return;
    const linkToRemove = activeLink;
    unwrapLink(linkToRemove);
    setActiveLink(null);
    handleInput();
  };

  const execCommand = (command, value = null) => {
    editorRef.current?.focus();
    
    if (command === 'createLink') {
      handleCreateLink();
    } else if (command === 'insertImage') {
      const url = prompt('Enter image URL:');
      if (url) {
        document.execCommand(command, false, url);
              normalizeTableImages();
      }
    } else if (command === 'formatBlock') {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false, value);
    }
    
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      applyListMarkerColor(getSelectionTextColor(), { onlyIfUnset: true });
    }

    handleInput();
    };

  const wrapSelectionWithSpan = (styleUpdater) => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    if (!editorRef.current?.contains(range.commonAncestorContainer)) return;

    const span = document.createElement('span');
    styleUpdater(span);
    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);
    selection.removeAllRanges();
    const updatedRange = document.createRange();
    updatedRange.selectNodeContents(span);
    selection.addRange(updatedRange);
    handleInput();
  };

  const handleFontSize = (size) => {
    wrapSelectionWithSpan((span) => {
      span.style.fontSize = `${size}px`;
    });
  };

  const handleFontFamily = (font) => {
    wrapSelectionWithSpan((span) => {
      span.style.fontFamily = font;
    });
  };

  const handleTextColor = (color) => {
    execCommand('foreColor', color);
  };

    const handleListMarkerColor = (color) => {
    applyListMarkerColor(color);
    handleInput();
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

  const handleDocumentBgColor = (color) => {
    if (!editorRef.current) return;
    editorRef.current.style.backgroundColor = color;
    handleInput();
  };

  const insertTable = (tableHtml) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
    
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
            makeButtonsResizable();
      handleInput();
    }, 10);
    savedSelectionRef.current = null;
  };

  const insertButton = () => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }

    const buttonHtml = `
      <button
        type="button"
        data-editor-button="true"
        style="background-color: #d7490c; color: #ffffff; padding: 8px 16px; border-radius: 6px; border: 1px solid transparent; display: inline-block; cursor: pointer;"
      >
        Button
      </button>
    `;

    const success = document.execCommand('insertHTML', false, buttonHtml);
    if (!success) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        const container = document.createElement('div');
        container.innerHTML = buttonHtml.trim();
        const button = container.firstChild;
        range.deleteContents();
        range.insertNode(button);
        range.setStartAfter(button);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    setTimeout(() => {
      makeButtonsResizable();
      handleInput();
    }, 10);
    savedSelectionRef.current = null;
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
        const lockWidth = table.dataset.lockWidth === 'true';
        const lockHeight = table.dataset.lockHeight === 'true';
        const cursorStyle = lockWidth && lockHeight
          ? 'not-allowed'
          : lockWidth
          ? 'ns-resize'
          : lockHeight
          ? 'ew-resize'
          : 'nwse-resize';

        handle.style.cssText = `
          position: absolute;
          right: 0;
          bottom: 0;
          width: 10px;
          height: 10px;
          cursor: ${cursorStyle};
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

          if (lockWidth && lockHeight) {
            return;
          }
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = cell.offsetWidth;
          const startHeight = cell.offsetHeight;
          
          const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            
            if (!lockWidth) {
              const nextWidth = Math.max(30, startWidth + deltaX);
              cell.style.width = `${nextWidth}px`;
              cell.style.minWidth = `${nextWidth}px`;
            }
            if (!lockHeight) {
              cell.style.height = `${Math.max(20, startHeight + deltaY)}px`;
            }
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

  const makeButtonsResizable = () => {
    if (!editorRef.current) return;

    const buttons = editorRef.current.querySelectorAll('button[data-editor-button="true"]');
    buttons.forEach(button => {
      button.style.position = 'relative';

      const existingHandles = button.querySelectorAll('.button-resize-handle');
      existingHandles.forEach(handle => handle.remove());

      const handle = document.createElement('div');
      handle.className = 'button-resize-handle';
      handle.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        width: 10px;
        height: 10px;
        cursor: nwse-resize;
        background: linear-gradient(135deg, transparent 50%, #0ea5e9 50%);
        opacity: 0;
        transition: opacity 0.2s;
      `;

      button.addEventListener('mouseenter', () => {
        handle.style.opacity = '1';
      });

      button.addEventListener('mouseleave', () => {
        if (!resizing) {
          handle.style.opacity = '0';
        }
      });

      handle.addEventListener('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setResizing(true);

        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = button.offsetWidth;
        const startHeight = button.offsetHeight;

        const onMouseMove = (moveEvent) => {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;

          button.style.width = `${Math.max(60, startWidth + deltaX)}px`;
          button.style.height = `${Math.max(24, startHeight + deltaY)}px`;
        };

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          setResizing(false);
          handleInput();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });

      button.appendChild(handle);
    });
  };

  // Handle click on table cells for cell-specific actions
  const handleCellClick = (e) => {
    const button = e.target.closest('button[data-editor-button="true"]');
    if (button) {
      setSelectedButton(button);
      updateActiveLink({ explicitButton: button });
    } else {
      setSelectedButton(null);
      updateActiveLink();
    }

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
      
    } else {
      // Clicked outside table
      selectedCells.forEach(c => c.classList.remove('table-cell-selected'));
      setSelectedCells([]);
      setSelectedCell(null);
      setCurrentTable(null);
    }
  };

  const handleCellContextMenu = (e) => {
        const button = e.target.closest('button[data-editor-button="true"]');
    if (button) {
      setSelectedButton(button);
      updateActiveLink({ explicitButton: button });
    } else {
      setSelectedButton(null);
      updateActiveLink();
    }
    
    const cell = e.target.closest('td, th');
    if (cell) {
      const isAlreadySelected = selectedCells.includes(cell);
      if (!isAlreadySelected || selectedCells.length <= 1) {
        selectedCells.forEach(c => c.classList.remove('table-cell-selected'));
        cell.classList.add('table-cell-selected');
        setSelectedCells([cell]);
      }
      setSelectedCell(cell);
      const table = cell.closest('table');
      setCurrentTable(table);
    } else {
      selectedCells.forEach(c => c.classList.remove('table-cell-selected'));
      setSelectedCells([]);
      setSelectedCell(null);
      setCurrentTable(null);
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
    handleInput();
  };

  const mergeSpecificCells = (cellsToMerge) => {
    if (cellsToMerge.length < 2) return;

    const firstCell = cellsToMerge[0];
    const table = firstCell.closest('table');
    const rows = Array.from(table.querySelectorAll('tr'));
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    cellsToMerge.forEach(cell => {
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
    
    let mergedContent = cellsToMerge
      .map(cell => cell.innerHTML)
      .filter(content => content.trim() && content !== '&nbsp;')
      .join(' ');
    
    if (!mergedContent) mergedContent = '&nbsp;';
    
    firstCell.rowSpan = rowSpan;
    firstCell.colSpan = colSpan;
    firstCell.innerHTML = mergedContent;
    
    cellsToMerge.slice(1).forEach(cell => {
      if (cell !== firstCell) {
        cell.remove();
      }
    });
    
    selectedCells.forEach(c => c.classList.remove('table-cell-selected'));
    setSelectedCells([firstCell]);
    firstCell.classList.add('table-cell-selected');
    
    handleInput();
  };

    const getAdjacentCell = (cell, direction) => {
    if (!cell) return null;
    const { rowIndex, cellIndex, table } = getCellPosition(cell);
    const rows = Array.from(table.querySelectorAll('tr'));
    const row = rows[rowIndex];

    if (direction === 'left') {
      return row?.children[cellIndex - 1] || null;
    }
    if (direction === 'right') {
      return row?.children[cellIndex + 1] || null;
    }
    if (direction === 'up') {
      const targetRow = rows[rowIndex - 1];
      return targetRow?.children[cellIndex] || null;
    }
    if (direction === 'down') {
      const targetRow = rows[rowIndex + 1];
      return targetRow?.children[cellIndex] || null;
    }
    return null;
  };

  const mergeCells = () => {
    if (selectedCells.length < 2) {
      alert('Please select at least 2 cells to merge');
      return;
    }

    mergeSpecificCells(selectedCells);
  };

  const mergeCellsInDirection = (direction) => {
    if (!selectedCell) return;
    const adjacentCell = getAdjacentCell(selectedCell, direction);
    if (!adjacentCell) {
      alert('No adjacent cell to merge in that direction');
      return;
    }
    mergeSpecificCells([selectedCell, adjacentCell]);
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

    const splitCellInDirection = (direction) => {
    if (!selectedCell) return;

    const rowSpan = parseInt(selectedCell.rowSpan) || 1;
    const colSpan = parseInt(selectedCell.colSpan) || 1;

    if ((direction === 'left' || direction === 'right') && colSpan <= 1) {
      alert('This cell cannot be split left or right');
      return;
    }

    if ((direction === 'up' || direction === 'down') && rowSpan <= 1) {
      alert('This cell cannot be split up or down');
      return;
    }

    const { rowIndex, cellIndex, table } = getCellPosition(selectedCell);
    const rows = Array.from(table.querySelectorAll('tr'));
    const createCell = () => {
      const newCell = document.createElement('td');
      newCell.style.cssText = selectedCell.style.cssText;
      newCell.innerHTML = '&nbsp;';
      return newCell;
    };

    if (direction === 'left' || direction === 'right') {
      const insertIndex = direction === 'left' ? cellIndex : cellIndex + 1;
      for (let r = 0; r < rowSpan; r++) {
        const targetRow = rows[rowIndex + r];
        if (!targetRow) continue;
        const cells = Array.from(targetRow.children);
        const newCell = createCell();
        if (cells[insertIndex]) {
          targetRow.insertBefore(newCell, cells[insertIndex]);
        } else {
          targetRow.appendChild(newCell);
        }
      }
      selectedCell.colSpan = colSpan - 1;
    } else {
      const targetRowIndex = direction === 'up' ? rowIndex : rowIndex + 1;
      const targetRow = rows[targetRowIndex];
      if (!targetRow) return;
      const cells = Array.from(targetRow.children);
      for (let c = 0; c < colSpan; c++) {
        const newCell = createCell();
        const insertAt = cellIndex + c;
        if (cells[insertAt]) {
          targetRow.insertBefore(newCell, cells[insertAt]);
        } else {
          targetRow.appendChild(newCell);
        }
      }
      selectedCell.rowSpan = rowSpan - 1;
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

    const openTableDialog = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
    setTableDialogOpen(true);
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

    const openButtonProperties = () => {
    if (selectedButton) {
      setButtonPropertiesOpen(true);
    }
  };

  const canMerge = selectedCells.length >= 2;
  const canDirectionalMerge = !!selectedCell;
  const canSplit = selectedCell && ((parseInt(selectedCell.rowSpan) || 1) > 1 || (parseInt(selectedCell.colSpan) || 1) > 1);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm border">
      <style>{`
        .table-cell-selected {
          outline: 2px solid #3b82f6 !important;
          outline-offset: -2px;
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
        [data-code-cursor="true"] {
          outline: 2px dashed #6366f1;
          outline-offset: 2px;
          background-color: rgba(99, 102, 241, 0.08);
        }
          .prose table {
          background-color: #ffffff;
        }
        .prose table img {
          display: block;
          margin: 0;
        }
          .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .prose ol {
          list-style-type: decimal;
          padding-left: 1.75rem;
          margin: 0.5rem 0;
        }
        .prose li {
          margin: 0.25rem 0;
        }
                .prose li::marker {
          color: var(--list-marker-color, currentColor);
        }
      `}</style>
      
      <Toolbar
        onFormat={execCommand}
        onInsertTable={openTableDialog}
        onInsertButton={insertButton}
        onUndo={onUndo ?? (() => execCommand('undo'))}
        onRedo={onRedo ?? (() => execCommand('redo'))}
        onFontSize={handleFontSize}
        onFontFamily={handleFontFamily}
        onTextColor={handleTextColor}
        onBgColor={handleBgColor}
        onDocumentBgColor={handleDocumentBgColor}
        onListMarkerColor={handleListMarkerColor}
      />
      {activeLink && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Link options:</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleEditLink}
          >
            Edit Link
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleRemoveLink}
          >
            Remove Link
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onClick={handleCellClick}
              onContextMenu={handleCellContextMenu}
              className="min-h-full bg-white p-8 shadow-sm border rounded-lg outline-none prose prose-sm max-w-none"
              style={{
                minHeight: '400px',
                lineHeight: '1.6',
              }}
            />
          </ContextMenuTrigger>
            <ContextMenuContent className="w-56 bg-white text-slate-900 shadow-xl z-[70]">
            <ContextMenuLabel>Editing Options</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={insertButton}>
              Insert Button
            </ContextMenuItem>
            <ContextMenuItem disabled={!selectedButton} onSelect={openButtonProperties}>
              Button Properties
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem disabled={!selectedCell} onSelect={() => insertRow('above')}>
              Insert Row Above
            </ContextMenuItem>
            <ContextMenuItem disabled={!selectedCell} onSelect={() => insertRow('below')}>
              Insert Row Below
            </ContextMenuItem>
            <ContextMenuItem disabled={!selectedCell} onSelect={() => insertColumn('left')}>
              Insert Column Left
            </ContextMenuItem>
            <ContextMenuItem disabled={!selectedCell} onSelect={() => insertColumn('right')}>
              Insert Column Right
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem disabled={!selectedCell} onSelect={deleteRow}>
              Delete Row
            </ContextMenuItem>
            <ContextMenuItem disabled={!selectedCell} onSelect={deleteColumn}>
              Delete Column
            </ContextMenuItem>
            <ContextMenuSeparator />
              <ContextMenuSub>
              <ContextMenuSubTrigger disabled={!canDirectionalMerge}>
                Merge Cells
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="bg-white text-slate-900 shadow-xl z-[70]">
                <ContextMenuItem inset onSelect={() => mergeCellsInDirection('left')}>
                  Merge Left
                </ContextMenuItem>
                <ContextMenuItem inset onSelect={() => mergeCellsInDirection('right')}>
                  Merge Right
                </ContextMenuItem>
                <ContextMenuItem inset onSelect={() => mergeCellsInDirection('up')}>
                  Merge Up
                </ContextMenuItem>
                <ContextMenuItem inset onSelect={() => mergeCellsInDirection('down')}>
                  Merge Down
                </ContextMenuItem>
                {canMerge && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem inset onSelect={mergeCells}>
                      Merge Selected
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
              <ContextMenuSubTrigger disabled={!canSplit}>
                Split Cell
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="bg-white text-slate-900 shadow-xl z-[70]">
                <ContextMenuItem inset onSelect={() => splitCellInDirection('left')}>
                  Split Left
                </ContextMenuItem>
                <ContextMenuItem inset onSelect={() => splitCellInDirection('right')}>
                  Split Right
                </ContextMenuItem>
                <ContextMenuItem inset onSelect={() => splitCellInDirection('up')}>
                  Split Up
                </ContextMenuItem>
                <ContextMenuItem inset onSelect={() => splitCellInDirection('down')}>
                  Split Down
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem inset onSelect={splitCell}>
                  Split Fully
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem disabled={!selectedCells.length} onSelect={openCellProperties}>
              Cell Properties
            </ContextMenuItem>
            <ContextMenuItem disabled={!selectedCell} onSelect={openRowProperties}>
              Row Properties
            </ContextMenuItem>
            <ContextMenuItem disabled={!currentTable} onSelect={openTableProperties}>
              Table Properties
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem disabled={!currentTable} onSelect={deleteTable}>
              Delete Table
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
      
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-100 border-t text-xs text-slate-500">
        <span>Visual Editor</span>
        <span>
          {selectedCells.length > 1 
            ? `${selectedCells.length} cells selected` 
            : selectedCell 
            ? 'Cell selected - Right click for table options'  
            : 'Click to edit'}
        </span>
      </div>
      
      <TableDialog
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        onInsert={insertTable}
      />

      <TablePropertiesDialog
        open={tablePropertiesOpen}
        onOpenChange={setTablePropertiesOpen}
        table={currentTable}
        onApply={() => {
          makeTablesResizable();
          handleInput();
        }}
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
      
      <ButtonPropertiesDialog
        open={buttonPropertiesOpen}
        onOpenChange={setButtonPropertiesOpen}
        button={selectedButton}
        onApply={handleInput}
      />
    </div>
  );
}
