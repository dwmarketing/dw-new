// Função para testar criação de admin
export const createAdminUser = async () => {
  try {
    const response = await fetch('https://cnhjnfwkjakvxamefzzg.supabase.co/functions/v1/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaGpuZndramFrdnhhbWVmenpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTUwODYsImV4cCI6MjA2NDE5MTA4Nn0.x6JzKCrOiVnd_MEoppN5e-EqSnkZQNJSMcjW9pbTjXw`
      },
      body: JSON.stringify({
        email: 'guedesgeovanny@gmail.com',
        password: 'Digital2021',
        fullName: 'Geovanny Guedes'
      })
    });

    const result = await response.json();
    console.log('Admin creation result:', result);
    return result;
  } catch (error) {
    console.error('Error creating admin:', error);
    return { error: error.message };
  }
};