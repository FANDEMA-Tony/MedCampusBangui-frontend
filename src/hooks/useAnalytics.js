import { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import { getUser } from '../utils/auth';

/**
 * 🎣 Hook custom pour récupérer les analytics selon le rôle
 * Usage : const { data, loading, error, refresh } = useAnalytics();
 */
export function useAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = getUser();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;

      // Appel API selon le rôle
      if (user?.role === 'admin') {
        response = await analyticsService.getStatsAdmin();
      } else if (user?.role === 'etudiant') {
        response = await analyticsService.getStatsEtudiant();
      } else if (user?.role === 'enseignant') {
        response = await analyticsService.getStatsEnseignant();
      } else {
        throw new Error('Rôle non reconnu');
      }

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Erreur analytics:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refresh: fetchAnalytics 
  };
}