import { DoctorPlaceholder } from './DoctorPlaceholder';
import { PatientPlaceholder } from './PatientPlaceholder';

export function CharacterStage() {
  return (
    <main className="character-stage">
      <DoctorPlaceholder />
      <PatientPlaceholder />
    </main>
  );
}

