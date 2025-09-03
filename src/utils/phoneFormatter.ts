export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (###) ###-####
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phone;
};

export const unformatPhoneNumber = (formattedPhone: string): string => {
  return formattedPhone.replace(/\D/g, '');
};