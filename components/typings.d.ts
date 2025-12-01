export type MovenetPose = {
  keypoints: posedetection.Keypoint[];
  score: number;
};

declare module "@tensorflow-models/pose-detection" {
  import * as posedetection from "@tensorflow-models/pose-detection/dist/types";
  // export = posedetection;
}
