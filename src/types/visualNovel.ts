export interface Character {
  characterId: string;
  emotion: string;
  effects?: {
    animation: string;
    duration: number;
  };
}

export interface Dialog {
  characterId: string;
  text: string;
  onFinish?: () => void;
}

export interface Choice {
  text: string;
  nextSceneId: string;
  onSelect?: () => void;
}

export interface Scene {
  id: string;
  sceneBackground?: string;
  playSoundOnStart?: string;
  characters?: Character[];
  dialog: Dialog[];
  choices?: Choice[];
  onSceneFinish?: () => void;
}

export interface Phase {
  id: string;
  title: string;
  backgroundMusic?: string;
  initialSceneId: string;
  scenes: { [key: string]: Scene };
}

// Exemplo de fase para teste
export const samplePhase: Phase = {
  id: "phase1",
  title: "Chapter 1: Morning Journey",
  backgroundMusic: "main_theme",
  initialSceneId: "morning_start",
  scenes: {
    morning_start: {
      id: "morning_start",
      sceneBackground: "street",
      playSoundOnStart: "morning_ambience",
      dialog: [
        {
          characterId: "narrator",
          text: "It's a beautiful morning as you head to school...",
        },
        {
          characterId: "protagonist",
          text: "I hope today will be a good day.",
        },
      ],
    },
    money_scene: {
      id: "money_scene",
      sceneBackground: "street",
      playSoundOnStart: "morning_ambience",
      dialog: [
        {
          characterId: "narrator",
          text: "Something catches your eye on the ground...",
        },
        {
          characterId: "narrator",
          text: "It's a ¥1000 bill! Someone must have dropped it.",
        },
      ],
      choices: [
        {
          text: "Take the money",
          nextSceneId: "take_money_scene",
        },
        {
          text: "Leave it there",
          nextSceneId: "leave_money_scene",
        },
      ],
    },
    // ... (resto das cenas)
  },
};
