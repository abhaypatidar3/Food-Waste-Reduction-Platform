import { useContext, createContext, useState } from "react";


export const AdminContext = createContext(null);

export const useAdmin = ()=>{
    const context = useContext(AdminContext);
    if(!context){
        throw  new Error('useAdmin must be used within AdminProvider')
    }
    return context;
}

export const AdminProvider = ({children})=>{
    const [status,setStatus] = useState('all');
    const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });

  const value = {
    status,
    setStatus,
    filters,
    setFilters
  }
  return( 
  <AdminContext.Provider value={value}>
    {children}
  </AdminContext.Provider>
  );
}