
import { useState } from "react";

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface FormField {
  value: string;
  error: string;
  touched: boolean;
}

interface UseFormValidationProps {
  initialValues: Record<string, string>;
  validationRules: Record<string, ValidationRules>;
}

export const useFormValidation = ({ initialValues, validationRules }: UseFormValidationProps) => {
  const [fields, setFields] = useState<Record<string, FormField>>(() => {
    const initial: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      initial[key] = {
        value: initialValues[key],
        error: "",
        touched: false
      };
    });
    return initial;
  });

  const validateField = (name: string, value: string): string => {
    const rules = validationRules[name];
    if (!rules) return "";

    if (rules.required && !value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be less than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      if (name === "email") {
        return "Please enter a valid email address";
      }
      if (name === "phone") {
        return "Please enter a valid phone number";
      }
      return `${name.charAt(0).toUpperCase() + name.slice(1)} format is invalid`;
    }

    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) return customError;
    }

    return "";
  };

  const updateField = (name: string, value: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        value,
        error: prev[name].touched ? validateField(name, value) : "",
        touched: prev[name].touched
      }
    }));
  };

  const touchField = (name: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        error: validateField(name, prev[name].value)
      }
    }));
  };

  const validateAll = (): boolean => {
    const newFields = { ...fields };
    let isValid = true;

    Object.keys(fields).forEach(name => {
      const error = validateField(name, fields[name].value);
      newFields[name] = {
        ...fields[name],
        touched: true,
        error
      };
      if (error) isValid = false;
    });

    setFields(newFields);
    return isValid;
  };

  const resetForm = () => {
    const resetFields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      resetFields[key] = {
        value: initialValues[key],
        error: "",
        touched: false
      };
    });
    setFields(resetFields);
  };

  const getFieldProps = (name: string) => ({
    value: fields[name]?.value || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      updateField(name, e.target.value),
    onBlur: () => touchField(name),
    error: fields[name]?.error || "",
    hasError: !!(fields[name]?.touched && fields[name]?.error)
  });

  return {
    fields,
    updateField,
    touchField,
    validateAll,
    resetForm,
    getFieldProps,
    isValid: Object.values(fields).every(field => !field.error),
    hasErrors: Object.values(fields).some(field => field.touched && field.error)
  };
};
