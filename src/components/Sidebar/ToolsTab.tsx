import { VscPreview, VscSymbolClass } from "react-icons/vsc";

interface SidebarProps {
  onFileSelect: (path: string, content: string) => void;
}

const ToolsTab: React.FC<SidebarProps> = ({ onFileSelect }) => {
  const toolsOptions = [
    { name: "Scene Viewer", icon: <VscPreview />, type: "preview" },
    { name: "Blueprint Editor", icon: <VscSymbolClass />, type: "blueprint" },
  ];

  return (
    <div className="py-2">
      {toolsOptions.map((tool) => (
        <div
          key={tool.name}
          className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
          onClick={() => onFileSelect(tool.type, "")}
        >
          <div className="flex items-center">
            {tool.icon}
            <span className="ml-2 text-sm">{tool.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToolsTab;
