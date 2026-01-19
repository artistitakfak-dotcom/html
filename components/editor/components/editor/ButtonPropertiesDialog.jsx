"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const getAlignmentFromStyle = (button) => {
  if (!button) return "left";
  const marginLeft = button.style.marginLeft;
  const marginRight = button.style.marginRight;

  if (marginLeft === "auto" && marginRight === "auto") {
    return "center";
  }
  if (marginLeft === "auto" && marginRight === "0px") {
    return "right";
  }
  return "left";
};

export default function ButtonPropertiesDialog({ open, onOpenChange, button, onApply }) {
  const [properties, setProperties] = useState({
    width: "",
    height: "",
    backgroundColor: "",
    outlineEnabled: true,
    outlineColor: "#1f2937",
    align: "left",
  });

  useEffect(() => {
    if (button && open) {
      const computedStyle = window.getComputedStyle(button);
      const borderWidth = parseFloat(computedStyle.borderWidth || "0");
      const outlineEnabled = computedStyle.borderStyle !== "none" && borderWidth > 0;

      setProperties({
        width: button.style.width || "",
        height: button.style.height || "",
        backgroundColor: button.style.backgroundColor || "",
        outlineEnabled,
        outlineColor: button.style.borderColor || computedStyle.borderColor || "#1f2937",
        align: getAlignmentFromStyle(button),
      });
    }
  }, [button, open]);

  const applyAlignment = (targetButton, align) => {
    targetButton.style.display = "block";
    if (align === "center") {
      targetButton.style.marginLeft = "auto";
      targetButton.style.marginRight = "auto";
    } else if (align === "right") {
      targetButton.style.marginLeft = "auto";
      targetButton.style.marginRight = "0px";
    } else {
      targetButton.style.marginLeft = "0px";
      targetButton.style.marginRight = "auto";
    }
  };

  const handleApply = () => {
    if (!button) return;

    if (properties.width) {
      button.style.width = properties.width.includes("px") || properties.width.includes("%")
        ? properties.width
        : `${properties.width}px`;
    }

    if (properties.height) {
      button.style.height = properties.height.includes("px") || properties.height.includes("%")
        ? properties.height
        : `${properties.height}px`;
    }

    if (properties.backgroundColor) {
      button.style.backgroundColor = properties.backgroundColor;
    }

    if (properties.outlineEnabled) {
      button.style.border = `1px solid ${properties.outlineColor || "#1f2937"}`;
    } else {
      button.style.border = "none";
    }

    applyAlignment(button, properties.align);

    onApply?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Button Properties</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buttonWidth">Width</Label>
              <Input
                id="buttonWidth"
                value={properties.width}
                onChange={(event) => setProperties({ ...properties, width: event.target.value })}
                placeholder="120px or 30%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonHeight">Height</Label>
              <Input
                id="buttonHeight"
                value={properties.height}
                onChange={(event) => setProperties({ ...properties, height: event.target.value })}
                placeholder="40px"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonBg">Background Color</Label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded border border-slate-200"
                style={{ backgroundColor: properties.backgroundColor || "#d7490c" }}
              />
              <Input
                id="buttonBg"
                value={properties.backgroundColor}
                onChange={(event) =>
                  setProperties({ ...properties, backgroundColor: event.target.value })
                }
                placeholder="#2563eb"
                className="flex-1 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Outline</Label>
            <div className="flex items-center gap-3">
              <Checkbox
                id="buttonOutline"
                checked={properties.outlineEnabled}
                onCheckedChange={(checked) =>
                  setProperties({ ...properties, outlineEnabled: Boolean(checked) })
                }
              />
              <Label htmlFor="buttonOutline" className="text-sm">
                Show outline
              </Label>
            </div>
            {properties.outlineEnabled && (
              <div className="flex gap-2 mt-2">
                <div
                  className="w-10 h-10 rounded border border-slate-200"
                  style={{ backgroundColor: properties.outlineColor || "#1f2937" }}
                />
                <Input
                  value={properties.outlineColor}
                  onChange={(event) =>
                    setProperties({ ...properties, outlineColor: event.target.value })
                  }
                  placeholder="#1f2937"
                  className="flex-1 font-mono"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonAlign">Alignment</Label>
            <Select
              value={properties.align}
              onValueChange={(value) => setProperties({ ...properties, align: value })}
            >
              <SelectTrigger id="buttonAlign">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
