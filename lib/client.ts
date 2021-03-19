import aspida from '@aspida/fetch';
import api from '../types/client/$api';

export const fetchConfig = (() => {
  const getApiKey = process.env.GET_API_KEY || '';
  if (getApiKey === '' && process.env.NODE_ENV !== 'test') {
    console.error('$GET_API_KEY is not defined.');
  }
  const headers: { [key: string]: string } = { 'X-API-KEY': getApiKey };
  if (process.env.GLOBAL_DRAFT_KEY) {
    headers['X-GLOBAL-DRAFT-KEY'] = process.env.GLOBAL_DRAFT_KEY;
  }
  return { headers };
})();

const clientV1 = api(aspida(fetch)).api.v1;

export default clientV1;
