import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

let landmarker: FaceLandmarker | null = null;
let mediaPipeConsoleFilterInstalled = false;

function installMediaPipeConsoleFilter(): void {
  if (mediaPipeConsoleFilterInstalled) {
    return;
  }

  const originalConsoleError = console.error.bind(console);

  console.error = (...args: unknown[]) => {
    const message = args
      .map((value) => String(value))
      .join(" ");

    if (
      message.includes(
        "Created TensorFlow Lite XNNPACK delegate for CPU"
      )
    ) {
      return;
    }

    originalConsoleError(...args);
  };

  mediaPipeConsoleFilterInstalled = true;
}

export async function getFaceLandmarker() {
  if (landmarker) return landmarker;

  installMediaPipeConsoleFilter();

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  landmarker = await FaceLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
      },
      runningMode: "IMAGE",
      numFaces: 1,
    }
  );

  return landmarker;
}

export async function detectFace(image: HTMLImageElement) {
  const landmarker = await getFaceLandmarker();

  return landmarker.detect(image);
}
