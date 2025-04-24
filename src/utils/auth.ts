import { cookies } from 'next/headers';

// Student authentication
export const getStudent = () => {
  const studentCookie = cookies().get('student')?.value;
  if (!studentCookie) return null;
  
  try {
    return JSON.parse(studentCookie);
  } catch (error) {
    return null;
  }
};

// Admin authentication
export const getAdmin = () => {
  const adminCookie = cookies().get('admin')?.value;
  if (!adminCookie) return null;
  
  try {
    return JSON.parse(adminCookie);
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated as student
export const isStudentAuthenticated = () => {
  return !!getStudent();
};

// Check if user is authenticated as admin
export const isAdminAuthenticated = () => {
  return !!getAdmin();
};
