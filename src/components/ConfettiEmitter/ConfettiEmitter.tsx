import { useEffect, useState } from "react";
import Confetti from "react-confetti";

export function ConfettiEmitter() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reset = [
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
    ];
    let sequence = [...reset];
    const listener = (e: KeyboardEvent) => {
      if (e.key === sequence[0]) {
        sequence.shift();
        if (sequence.length === 0) {
          setShown(true);
          sequence = [...reset];
        }
      } else {
        sequence = [...reset];
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  return shown ? (
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
      onConfettiComplete={() => setShown(false)}
    />
  ) : null;
}
