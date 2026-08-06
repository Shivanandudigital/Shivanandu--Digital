export interface AutoCropResult {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom?: number;
  rotation?: number;
}

export function detectAutomaticPassportCrop(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number = 35 / 45
) {
  if (!imageWidth || !imageHeight) {
    return {
      cropX: 0,
      cropY: 0,
      cropWidth: 100,
      cropHeight: 100,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zoom: 1,
      scale: 1,
      rotation: 0,
    };
  }

  // পাসপোর্ট ছবির অফিসিয়াল অনুপাত (৭০-৮০% ফেস কভারেজ)
  // ক্রপ বক্স ছোট করে (৪৮%) রাখা হলো যাতে শুধু মাথা ও কাঁধের অংশ সুন্দরভাবে ফিট হয়
  let cropWidth = imageWidth * 0.48;
  let cropHeight = cropWidth / aspectRatio;

  if (cropHeight > imageHeight * 0.75) {
    cropHeight = imageHeight * 0.75;
    cropWidth = cropHeight * aspectRatio;
  }

  // মুখ মাঝখানে এবং মাথার ওপর ৫% মার্জিন
  const cropX = Math.max(0, (imageWidth - cropWidth) / 2);
  const cropY = Math.max(0, imageHeight * 0.05);

  return {
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight,
    zoom: 1.0,
    scale: 1.0,
    rotation: 0,
  };
}

export const calculateAutoPassportCrop = detectAutomaticPassportCrop;