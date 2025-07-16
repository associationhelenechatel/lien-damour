"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Heart } from "lucide-react";

interface CoupleLinkNodeData {
  coupleKey: string;
}

function CoupleLinkNode({ data }: NodeProps) {
  return (
    <>
      {/* Connection handles */}
      <Handle
        id="spouse-left"
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
      <Handle
        id="spouse-right"
        type="target"
        position={Position.Right}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />

      {/* Small heart icon as the visual link */}
      <div className="w-8 h-8 bg-red-100 border-2 border-red-300 rounded-full flex items-center justify-center shadow-md">
        <Heart className="h-4 w-4 text-red-600 fill-current" />
      </div>
    </>
  );
}

export default memo(CoupleLinkNode);
