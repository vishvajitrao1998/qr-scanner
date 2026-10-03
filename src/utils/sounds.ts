export const BEEP_OPTIONS = [
  { id: "beep1", label: "Beep 1", source: require("../../assets/sounds/beep.mp3") },
  { id: "beep2", label: "Beep 2", source: require("../../assets/sounds/beep1.mp3") },
  { id: "beep3", label: "Beep 3", source: require("../../assets/sounds/beep2.mp3") },
];

export function getBeepSource(id: string) {
  return (BEEP_OPTIONS.find((o) => o.id === id) ?? BEEP_OPTIONS[0]).source;
}