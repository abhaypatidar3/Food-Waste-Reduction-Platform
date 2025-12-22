/**
 * Email Validation Rules:   
 * - Must start with a letter (a-z, A-Z)
 * - Can contain letters, numbers, dots, underscores, hyphens
 * - Must have @ symbol
 * - Must have valid domain
 * - Domain extension must be 2+ characters
 */
export const validateEmail = (email) => {
  if (!email || ! email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();

  // Check if email starts with a number
  if (/^[0-9]/.test(trimmedEmail)) {
    return { isValid: false, error: 'Email cannot start with a number' };
  }

  // Check basic email format
  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error:  'Please enter a valid email address' };
  }

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return { isValid: false, error: 'Email cannot contain consecutive dots' };
  }

  // Check if @ is not at the beginning or end
  if (trimmedEmail.startsWith('@') || trimmedEmail.endsWith('@')) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Split and validate parts
  const [localPart, domain] = trimmedEmail.split('@');
  
  if (!localPart || !domain) {
    return { isValid:  false, error: 'Invalid email format' };
  }

  // Local part validations
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, error:  'Email cannot start or end with a dot' };
  }

  // Domain validations
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return { isValid: false, error: 'Invalid domain format' };
  }

  if (domain.startsWith('-') || domain.endsWith('-')) {
    return { isValid:  false, error: 'Invalid domain format' };
  }

  return { isValid: true, error:  null };
};


export const validatePassword = (password) => {
  if (!password) {
    return { isValid:  false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (! @#$%^&* etc.)' };
  }

  return { isValid: true, error: null };
};

/**
 * Phone Validation
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length !== 10) {
    return { isValid: false, error: 'Phone number must be exactly 10 digits' };
  }

  return { isValid: true, error:  null };
};

/**
 * Organization Name Validation
 */
export const validateOrganizationName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Organization name is required' };
  }

  if (name.trim().length < 3) {
    return { isValid: false, error: 'Organization name must be at least 3 characters' };
  }

  return { isValid: true, error: null };
};