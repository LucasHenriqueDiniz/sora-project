import React from "react";
import type { ScenePreviewProps } from "../types/editor";
import { samplePhase } from "../types/visualNovel";

const ScenePreview: React.FC<ScenePreviewProps> = ({ className = "" }) => {
  return (
    <div className="w-full h-full flex flex-col bg-editor-bg">
      {/* Scene View */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-black/50">
          {/* Background Image */}
          <div className="absolute inset-0 bg-center bg-cover" />

          {/* Characters */}
          <div className="absolute inset-x-0 bottom-32 flex justify-center space-x-8">
            {samplePhase.scenes.morning_start.characters?.map((char) => (
              <div
                key={char.characterId}
                className="character-sprite"
              >
                {char.characterId} - {char.emotion}
              </div>
            ))}
          </div>

          {/* Dialog Box */}
          <div className="absolute bottom-0 inset-x-0 p-4">
            <div className="bg-black/80 text-white p-4 rounded-lg">
              <div className="font-bold mb-2">{samplePhase.scenes.morning_start.dialog[0].characterId}</div>
              <div>{samplePhase.scenes.morning_start.dialog[0].text}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-center space-x-4 p-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Previous</button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Auto</button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Next</button>
      </div>
    </div>
  );
};

export default ScenePreview;
