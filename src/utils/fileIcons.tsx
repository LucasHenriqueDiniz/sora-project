import React from "react";
import { VscCode, VscJson, VscFileMedia, VscFile } from "react-icons/vsc";

export const getFileIcon = (fileName: string): JSX.Element => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "rpy":
      return <VscCode className="text-blue-400" />;
    case "json":
      return <VscJson className="text-yellow-400" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <VscFileMedia className="text-purple-400" />;
    case "mp3":
    case "wav":
    case "ogg":
      return <VscFileMedia className="text-green-400" />;
    default:
      return <VscFile className="text-gray-400" />;
  }
};
