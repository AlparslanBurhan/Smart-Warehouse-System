import axios from 'axios';

// Backend requires PascalCase for Request Body and returns PascalCase in Response Body.
// Frontend uses camelCase.

export const getCompanyId = () => localStorage.getItem('companyId') || "DemoCompany";
export const setCompanyId = (id: string) => localStorage.setItem('companyId', id);

export const api = axios.create({
  baseURL: 'http://localhost:5051/api', // Güncellenmiş Backend URL'si
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper to convert camelCase to PascalCase recursively
const toPascalCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => toPascalCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      result[pascalKey] = toPascalCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

// Helper to convert PascalCase to camelCase recursively
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

// Add interceptors for the PascalCase converting rules
api.interceptors.request.use(config => {
  if (config.data) {
    config.data = toPascalCase(config.data);
  }
  return config;
});

api.interceptors.response.use(response => {
  if (response.data) {
    response.data = toCamelCase(response.data);
  }
  return response;
});
