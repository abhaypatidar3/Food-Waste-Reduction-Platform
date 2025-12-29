export const removeCookie = (name) => {
  // Remove for current path
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  
  // Remove for root domain
  const domain = window.location.hostname;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
  
  // Remove with Max-Age
  document.cookie = `${name}=; Max-Age=0; path=/;`;
  
  // Try without domain
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  
  console.log('Cookie removed:', name);
};

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};