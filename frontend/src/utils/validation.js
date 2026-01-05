
import * as Yup from 'yup';


export const registerSchema = Yup.object().shape({
    organizationName: Yup.string().required('Organization Name is required').min(3, 'Organization Name must be at least 3 characters').max(100, 'Organization Name must be at most 100 characters'),
    email: Yup.string().required('email is required').email('Invalid email format'),
    password: Yup.string().required('Password is required').matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=[\\]{};\'":\\\\|,.<>/?]).{6,}$', 'Password must be at least 6 characters and include uppercase, lowercase, and special character'),
    phone: Yup.string().required('Phone Number is required').matches('^\\d{10}$', 'Phone number must be exactly 10 digits'),
    address: Yup.string().required('Address is required'),
    agreeToTerms: Yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'),null],'Passwords should match')
});

export const LoginSchema = Yup.object().shape({
    email: Yup.string().email('email is invalid').matches(/^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Email must start with a letter').required('Email is required'),
    password: Yup.string().required('Password is required').min(6,'Password must be at least 6 characters')
})



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

  const digitsOnly = phone.replace(/\D/g,'');
  
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