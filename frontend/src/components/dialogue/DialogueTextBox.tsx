import { useGame } from '../../hooks/useGame';
import { useTypewriter } from '../../hooks/useTypewriter';

export function DialogueTextBox() {
  const { snapshot } = useGame();
  const { displayedText, isTyping } = useTypewriter(snapshot.dialogueText, 14);

  return (
    <div className="vn-dialogue-box">
      <p className="vn-dialogue-text">
        {displayedText}
        {isTyping && <span className="vn-cursor">▋</span>}
      </p>
    </div>
  );
}
