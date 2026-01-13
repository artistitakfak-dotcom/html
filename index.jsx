import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Link, Image, Type, Palette, Code, Eye,
  Download, Copy, RotateCcw, Maximize2
} from 'lucide-react';

export default function HTMLEditor() {
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff;">
                    <tr>
                        <td style="padding: 40px 30px; background-color: #1a5f3a; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome to Our Newsletter</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1a5f3a; font-size: 24px;">Latest Updates</h2>
                            <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #f8f9fa;">
                            <a href="#" style="display: inline-block; padding: 14px 40px; background-color: #1a5f3a; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Read More</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 30px; background-color: #2c2c2c; text-align: center;">
                            <p style="margin: 0; color: #cccccc; font-size: 12px;">
                                © 2024 Your Company. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`);

  const [previewKey, setPreviewKey] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#1a5f3a');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const previewRef = useRef(null);
  const colorPickerRef = useRef(null);

  // Update preview when HTML changes
  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [htmlCode]);

  // Rich text editing commands
  const execCommand = (command, value = null) => {
    const iframe = previewRef.current;
    if (iframe && iframe.contentDocument) {
      iframe.contentDocument.execCommand(command, false, value);
      updateHTMLFromPreview();
    }
  };

  const updateHTMLFromPreview = () => {
    const iframe = previewRef.current;
    if (iframe && iframe.contentDocument) {
      const body = iframe.contentDocument.body;
      if (body) {
        // Get the full HTML including styles
        const fullHTML = iframe.contentDocument.documentElement.outerHTML;
        setHtmlCode(fullHTML);
      }
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const changeFontSize = () => {
    const size = prompt('Enter font size (1-7):', '3');
    if (size) {
      execCommand('fontSize', size);
    }
  };

  const changeColor = (color) => {
    setSelectedColor(color);
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const copyHTML = () => {
    navigator.clipboard.writeText(htmlCode);
    alert('HTML copied to clipboard!');
  };

  const downloadHTML = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-newsletter.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetContent = () => {
    if (confirm('Reset to default template?')) {
      setHtmlCode(htmlCode);
      setPreviewKey(prev => prev + 1);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', tooltip: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', tooltip: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', tooltip: 'Underline (Ctrl+U)' },
    { icon: AlignLeft, command: 'justifyLeft', tooltip: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', tooltip: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', tooltip: 'Align Right' },
    { icon: List, command: 'insertUnorderedList', tooltip: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'Numbered List' },
  ];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#1e1e1e',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#d4d4d4'
    }}>
      {/* Header */}
      <div style={{
        background: '#2d2d30',
        borderBottom: '1px solid #3e3e42',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Code size={24} style={{ color: '#4ec9b0' }} />
          <h1 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#cccccc'
          }}>
            Email HTML Editor
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={copyHTML}
            style={{
              padding: '8px 16px',
              background: '#0e639c',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1177bb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0e639c'}
          >
            <Copy size={16} />
            Copy HTML
          </button>
          <button
            onClick={downloadHTML}
            style={{
              padding: '8px 16px',
              background: '#0e639c',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1177bb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#0e639c'}
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - HTML Code */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #3e3e42'
        }}>
          <div style={{
            background: '#2d2d30',
            padding: '8px 20px',
            borderBottom: '1px solid #3e3e42',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#cccccc'
          }}>
            <Code size={16} />
            HTML Source Code
          </div>
          <textarea
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              padding: '20px',
              background: '#1e1e1e',
              color: '#d4d4d4',
              border: 'none',
              outline: 'none',
              fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
              fontSize: '13px',
              lineHeight: '1.6',
              resize: 'none',
              tabSize: 2
            }}
          />
        </div>

        {/* Right Panel - Live Preview with Editing */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          background: '#252526'
        }}>
          {/* Toolbar */}
          <div style={{
            background: '#2d2d30',
            padding: '8px 12px',
            borderBottom: '1px solid #3e3e42',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginRight: '8px',
              fontSize: '13px',
              color: '#cccccc'
            }}>
              <Eye size={16} />
              Live Preview
            </div>

            {/* Text formatting buttons */}
            {toolbarButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => execCommand(btn.command)}
                title={btn.tooltip}
                style={{
                  padding: '6px 8px',
                  background: '#3e3e42',
                  border: 'none',
                  borderRadius: '3px',
                  color: '#cccccc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#505050'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3e3e42'}
              >
                <btn.icon size={16} />
              </button>
            ))}

            <div style={{ width: '1px', height: '20px', background: '#3e3e42', margin: '0 4px' }} />

            {/* Special buttons */}
            <button
              onClick={insertLink}
              title="Insert Link"
              style={{
                padding: '6px 8px',
                background: '#3e3e42',
                border: 'none',
                borderRadius: '3px',
                color: '#cccccc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#505050'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3e3e42'}
            >
              <Link size={16} />
            </button>

            <button
              onClick={insertImage}
              title="Insert Image"
              style={{
                padding: '6px 8px',
                background: '#3e3e42',
                border: 'none',
                borderRadius: '3px',
                color: '#cccccc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#505050'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3e3e42'}
            >
              <Image size={16} />
            </button>

            <button
              onClick={changeFontSize}
              title="Font Size"
              style={{
                padding: '6px 8px',
                background: '#3e3e42',
                border: 'none',
                borderRadius: '3px',
                color: '#cccccc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#505050'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3e3e42'}
            >
              <Type size={16} />
            </button>

            {/* Color picker */}
            <div style={{ position: 'relative' }} ref={colorPickerRef}>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Text Color"
                style={{
                  padding: '6px 8px',
                  background: '#3e3e42',
                  border: 'none',
                  borderRadius: '3px',
                  color: '#cccccc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#505050'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3e3e42'}
              >
                <Palette size={16} />
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: selectedColor,
                  border: '1px solid #555',
                  borderRadius: '2px'
                }} />
              </button>

              {showColorPicker && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  background: '#2d2d30',
                  border: '1px solid #3e3e42',
                  borderRadius: '4px',
                  padding: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '6px',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                  {[
                    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
                    '#ff0000', '#ff6b00', '#ffcc00', '#00ff00', '#00ccff', '#0066ff', '#9933ff', '#ff00ff',
                    '#8b0000', '#ff8c00', '#ffd700', '#006400', '#008b8b', '#00008b', '#4b0082', '#8b008b',
                    '#1a5f3a', '#2d8a5a', '#e74c3c', '#3498db', '#f39c12', '#9b59b6'
                  ].map(color => (
                    <button
                      key={color}
                      onClick={() => changeColor(color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        background: color,
                        border: selectedColor === color ? '2px solid white' : '1px solid #555',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }} />

            <button
              onClick={resetContent}
              title="Reset"
              style={{
                padding: '6px 8px',
                background: '#3e3e42',
                border: 'none',
                borderRadius: '3px',
                color: '#cccccc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#505050'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3e3e42'}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Preview Area */}
          <div style={{
            flex: 1,
            background: '#f4f4f4',
            overflow: 'auto',
            padding: '20px'
          }}>
            <div style={{
              maxWidth: '650px',
              margin: '0 auto',
              background: 'white',
              minHeight: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <iframe
                key={previewKey}
                ref={previewRef}
                srcDoc={htmlCode}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '600px',
                  border: 'none'
                }}
                onLoad={() => {
                  const iframe = previewRef.current;
                  if (iframe && iframe.contentDocument) {
                    iframe.contentDocument.designMode = 'on';
                    
                    // Add event listener to sync changes
                    iframe.contentDocument.addEventListener('input', updateHTMLFromPreview);
                    
                    // Adjust height dynamically
                    const resizeIframe = () => {
                      const body = iframe.contentDocument.body;
                      const html = iframe.contentDocument.documentElement;
                      const height = Math.max(
                        body.scrollHeight,
                        body.offsetHeight,
                        html.clientHeight,
                        html.scrollHeight,
                        html.offsetHeight
                      );
                      iframe.style.height = height + 'px';
                    };
                    
                    resizeIframe();
                    setTimeout(resizeIframe, 100);
                  }
                }}
              />
            </div>
          </div>

          {/* Info Footer */}
          <div style={{
            background: '#2d2d30',
            borderTop: '1px solid #3e3e42',
            padding: '8px 20px',
            fontSize: '12px',
            color: '#858585',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span>✏️ Click in the preview to edit text directly</span>
            <span>•</span>
            <span>🎨 Use toolbar to format</span>
            <span>•</span>
            <span>⚡ Changes sync in real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
