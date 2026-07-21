import {
  FaceDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

let detector: FaceDetector | null = null;

export async function getFaceDetector() {
  if (detector) return detector;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  detector = await FaceDetector.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
      },
      runningMode: "IMAGE",
    }
  );

  return detector;
}
export async function detectFace(image: HTMLImageElement) {
  const detector = await getFaceDetector();

  const result = detector.detect(image);

  return result.detections;
}