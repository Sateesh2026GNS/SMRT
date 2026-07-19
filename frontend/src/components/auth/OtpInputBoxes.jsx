import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Six individual OTP digit boxes with auto-focus, paste, and backspace navigation.
 */
export default function OtpInputBoxes({
  length = 6,
  value = "",
  onChange,
  disabled = false,
  autoFocus = true,
  error = false,
}) {
  const inputsRef = useRef([]);
  const [digits, setDigits] = useState(() => {
    const arr = Array(length).fill("");
    String(value)
      .replace(/\D/g, "")
      .slice(0, length)
      .split("")
      .forEach((d, i) => {
        arr[i] = d;
      });
    return arr;
  });

  useEffect(() => {
    const next = Array(length).fill("");
    String(value)
      .replace(/\D/g, "")
      .slice(0, length)
      .split("")
      .forEach((d, i) => {
        next[i] = d;
      });
    setDigits(next);
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const emit = useCallback(
    (next) => {
      setDigits(next);
      onChange?.(next.join(""));
    },
    [onChange]
  );

  const focusIndex = (idx) => {
    const el = inputsRef.current[Math.max(0, Math.min(length - 1, idx))];
    if (el) el.focus();
  };

  const handleChange = (index, raw) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      emit(next);
      return;
    }

    // Paste / multi-digit into this box
    if (cleaned.length > 1) {
      const next = [...digits];
      cleaned
        .slice(0, length - index)
        .split("")
        .forEach((d, offset) => {
          next[index + offset] = d;
        });
      emit(next);
      focusIndex(Math.min(length - 1, index + cleaned.length));
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    emit(next);
    if (index < length - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        emit(next);
      } else if (index > 0) {
        focusIndex(index - 1);
        const next = [...digits];
        next[index - 1] = "";
        emit(next);
      }
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      focusIndex(index - 1);
      e.preventDefault();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      focusIndex(index + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill("");
    pasted.split("").forEach((d, i) => {
      next[i] = d;
    });
    emit(next);
    focusIndex(Math.min(length - 1, pasted.length));
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          className={`h-12 w-10 rounded-xl border text-center text-xl font-semibold tabular-nums outline-none transition sm:h-14 sm:w-12 ${
            error
              ? "border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-200 bg-slate-50 text-slate-900 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
          } disabled:opacity-50`}
        />
      ))}
    </div>
  );
}
