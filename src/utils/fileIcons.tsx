import { AiOutlinePython } from "react-icons/ai";
import { PiFlowerFill } from "react-icons/pi";
import { SiJavascript, SiTypescript } from "react-icons/si";
import { VscCode, VscFile, VscFileMedia, VscJson } from "react-icons/vsc";
import { TbFileTypeTxt } from "react-icons/tb";

export const getFileIcon = (fileName: string): JSX.Element => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "rpy":
      return <VscCode className="text-blue-400 h-4 w-4" />;
    case "py":
    case "pyc":
    case "renpy":
      return <AiOutlinePython className="text-blue-400 h-4 w-4" />;
    case "json":
      return <VscJson className="text-yellow-400 h-4 w-4" />;
    case "js":
    case "jsx":
      return <SiJavascript className="text-yellow-400 h-4 w-4" />;
    case "ts":
    case "tsx":
      return <SiTypescript className="text-blue-400 h-4 w-4" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <VscFileMedia className="text-purple-400 h-4 w-4" />;
    case "mp3":
    case "wav":
    case "ogg":
      return <VscFileMedia className="text-green-400 h-4 w-4" />;
    case "txt":
      return <TbFileTypeTxt className="text-gray-400 h-4 w-4" />;
    case "sora":
      return <PiFlowerFill className="text-purple-400 h-4 w-4" />;
    default:
      return <VscFile className="text-gray-400 h-4 w-4" />;
  }
};
