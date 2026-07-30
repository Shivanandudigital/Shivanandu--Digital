export type FaceLandmarks = {
  leftEye: {
    x: number;
    y: number;
  };

  rightEye: {
    x: number;
    y: number;
  };

  nose: {
    x: number;
    y: number;
  };

  mouth: {
    x: number;
    y: number;
  };

  chin: {
    x: number;
    y: number;
  };

  headWidth: number;
  headHeight: number;

  roll: number;
  yaw: number;
  pitch: number;
};