import PoseCoachMediaPipe from "@/components/PoseCoachMediaPipe";
import React from "react";

type Props = {};

const ARMP = (props: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">AR Coach — Live</h2>
      </div>

      <div className="bg-black rounded-md overflow-hidden shadow">
        {/* PoseCoachClient handles camera, MediaPipe and voice/text prompts */}
        <PoseCoachMediaPipe />
      </div>

      <div className="text-sm text-gray-600 mt-2">
        If camera doesn't start: ensure site is served over HTTPS and camera
        permission is allowed.
      </div>
    </div>
  );
};

export default ARMP;
