// Authentication utility functions
export const login = (credentials) => {
  // Simulate login process
  const userData = {
    id: '1',
    name: credentials.name || 'User',
    email: credentials.email,
    plan: 'Free',
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('noteflow_token', 'demo_jwt_token_' + Date.now());
  localStorage.setItem('noteflow_user', JSON.stringify(userData));
  
  return { success: true, user: userData };
};

export const signup = (credentials) => {
  // Simulate signup process
  const userData = {
    id: Date.now().toString(),
    name: credentials.name,
    email: credentials.email,
    plan: 'Free',
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('noteflow_token', 'demo_jwt_token_' + Date.now());
  localStorage.setItem('noteflow_user', JSON.stringify(userData));
  
  return { success: true, user: userData };
};

export const logout = () => {
  localStorage.removeItem('noteflow_token');
  localStorage.removeItem('noteflow_user');
};

export const isAuthenticated = () => {
  return localStorage.getItem('noteflow_token') !== null;
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('noteflow_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const updateUserProfile = (updates) => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('noteflow_user', JSON.stringify(updatedUser));
    return updatedUser;
  }
  return null;
};

// LocalStorage helper functions for journals and notes
export const saveJournal = (id, data) => {
  const journals = getJournals();
  journals[id] = { 
    ...data, 
    id,
    updatedAt: new Date().toISOString(),
    createdAt: journals[id]?.createdAt || new Date().toISOString()
  };
  localStorage.setItem('noteflow_journals', JSON.stringify(journals));
  return journals[id];
};

export const getJournals = () => {
  const journals = localStorage.getItem('noteflow_journals');
  return journals ? JSON.parse(journals) : {};
};

export const getJournal = (id) => {
  const journals = getJournals();
  return journals[id] || null;
};

export const deleteJournal = (id) => {
  const journals = getJournals();
  delete journals[id];
  localStorage.setItem('noteflow_journals', JSON.stringify(journals));
  return true;
};

export const searchJournals = (query) => {
  const journals = getJournals();
  const searchTerm = query.toLowerCase();
  
  return Object.values(journals).filter(journal => 
    journal.title?.toLowerCase().includes(searchTerm) ||
    journal.content?.toLowerCase().includes(searchTerm)
  );
};