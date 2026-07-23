"use client";
import SidebarCard from "./sidebar/SidebarCard";
import CropControls from "./CropControls";
import PhotoAdjustments from "./PhotoAdjustments";

type Props = {
  zoom: number;
  rotation: number;



  brightness: number;
  contrast: number;
  saturation: number;



  onZoomChange: (value: number) => void;
  onRotationChange: (value: number) => void;

  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
};

export default function LeftSidebar({
  zoom,
  rotation,

  

  brightness,
  contrast,
  saturation,

  onZoomChange,
  onRotationChange,



  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
}: Props) {
 return (
  <div className="space-y-6">

    
    
   
    <SidebarCard title="Editor Controls">

  <CropControls
    zoom={zoom}
    rotation={rotation}
    onZoomChange={onZoomChange}
    onRotationChange={onRotationChange}
  />

  <div className="my-6 border-t border-gray-200" />

  <PhotoAdjustments
    brightness={brightness}
    contrast={contrast}
    saturation={saturation}
    onBrightnessChange={onBrightnessChange}
    onContrastChange={onContrastChange}
    onSaturationChange={onSaturationChange}
  />

</SidebarCard>

  </div>
);
}