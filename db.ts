
export const saveProfile = (profile: any) => {
  localStorage.setItem('rede_impacto_profile', JSON.stringify(profile));
};

export const getProfile = () => {
  const data = localStorage.getItem('rede_impacto_profile');
  return data ? JSON.parse(data) : null;
};
