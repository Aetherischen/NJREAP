import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = "6LfoxpUqAAAAALbJxfzLGKkGqEi4ddFa7FUFgSUm"; // Replace with your actual site key

export interface RecaptchaRef {
  executeAsync: () => Promise<string | null>;
  reset: () => void;
}

interface RecaptchaProps {
  className?: string;
}

export const Recaptcha = forwardRef<RecaptchaRef, RecaptchaProps>(
  ({ className }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      executeAsync: async () => {
        if (recaptchaRef.current) {
          return await recaptchaRef.current.executeAsync();
        }
        return null;
      },
      reset: () => {
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      },
    }));

    return (
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={RECAPTCHA_SITE_KEY}
        size="invisible"
        className={className}
      />
    );
  }
);

Recaptcha.displayName = "Recaptcha";