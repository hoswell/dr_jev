import { useState, type FormEvent } from 'react';
import { useGame } from '../../hooks/useGame';

export function PatientAnswerForm() {
  const { snapshot, controller } = useGame();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || !snapshot.canTypeAnswer) return;

    void controller.submitPatientAnswer(trimmed);
    setInputValue('');
  };

  return (
    <form className="vn-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="vn-text-input"
        placeholder="Type the patient's answer here..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        autoFocus
      />
      <button
        type="submit"
        className="vn-submit-btn"
        disabled={!inputValue.trim()}
      >
        Send to JEV
      </button>
    </form>
  );
}
