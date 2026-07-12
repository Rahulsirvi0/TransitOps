import { useState, useCallback } from 'react';
import api from '../services/api';

export function useApi(method, url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (payload, params) => {
    setLoading(true);
    setError(null);
    try {
      const config = { ...options };
      if (params) config.params = params;
      let response;
      switch (method.toLowerCase()) {
        case 'get': response = await api.get(url, config); break;
        case 'post': response = await api.post(url, payload, config); break;
        case 'put': response = await api.put(url, payload, config); break;
        case 'patch': response = await api.patch(url, payload, config); break;
        case 'delete': response = await api.delete(url, config); break;
        default: throw new Error('Invalid method');
      }
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [method, url, options]);

  return { data, loading, error, execute };
}