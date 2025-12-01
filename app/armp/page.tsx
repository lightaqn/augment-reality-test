"use client";
import dynamic from "next/dynamic";
import PoseDemo from "@/components/PoseMediaPipeUpdated";
import React from "react";

type Props = {};

// const PoseMediaPipe = dynamic(
//   () => import("../../components/PoseCoachMediaPipe"),
//   { ssr: false }
// );

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">AR Coach — Live</h2>
      </div>

      <div className="bg-black rounded-md overflow-hidden shadow">
        {/* PoseCoachClient handles camera, MediaPipe and voice/text prompts */}
        {/* <PoseDemo /> */}
      </div>

      <div className="text-sm text-gray-600 mt-2">
        If camera doesn't start: ensure site is served over HTTPS and camera
        permission is allowed.
      </div>
    </div>
  );
}
