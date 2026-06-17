// Utility for handling post-login redirects
export const setRedirectAfterLogin = (url) => {
  localStorage.setItem('redirectAfterLogin', url);
};

export const getRedirectAfterLogin = () => {
  const url = localStorage.getItem('redirectAfterLogin');
  localStorage.removeItem('redirectAfterLogin');
  return url;
};

export const hasRedirectAfterLogin = () => {
  return !!localStorage.getItem('redirectAfterLogin');
};
