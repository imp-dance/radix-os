import { useState } from "react";
import Confetti from "react-confetti";
import { useKeySequence } from "../../hooks/useKeyboard";

const useKonamiSequence = (cb: () => void) =>
  useKeySequence(
    [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ],
    cb
  );

export function ConfettiEmitter() {
  const [isAnimating, setAnimating] = useState(false);
  useKonamiSequence(() => setAnimating(true));

  return !isAnimating ? null : (
    <Confetti
      width={document.body.clientWidth}
      height={document.body.clientHeight}
      numberOfPieces={50}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
      colors={[
        "#435db2",
        "#f76a15",
        "#1ed8a4",
        "#ff80ca",
        "#b658c4",
      ]}
      recycle={false}
      onConfettiComplete={() => setAnimating(false)}
    />
  );
}
