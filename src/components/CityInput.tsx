import { useRef, type FC, type KeyboardEvent } from "react";
import "./CityInput.css";

interface CityInputProps {
  onEnter: (input: string, clearInput: () => void) => void;
}

export const CityInput: FC<CityInputProps> = ({ onEnter }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const palceholder =
    window.screen.width >= 600
      ? "ENTER A TWIN CITIES SUBURB"
      : "ENTER A SUBURB";

  return (
    <div className="container">
      <input
        id="city-input"
        ref={inputRef}
        placeholder={palceholder}
        className="brutalist-input smooth-type"
        type="text"
        autoComplete="off"
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter") {
            onEnter((event.target as HTMLInputElement).value, () => {
              if (inputRef?.current) {
                (inputRef.current as unknown as HTMLInputElement).value = "";
              }
            });
          }
        }}
      />
      <label className="brutalist-label">How many can you name?</label>
    </div>
  );
};
