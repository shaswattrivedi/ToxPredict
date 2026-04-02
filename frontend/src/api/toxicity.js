import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_BASE,
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' }
})

export const predictToxicity = async (smiles) => {
    const response = await api.post('/api/predict', { smiles })
    return response.data
}

export const fetchExamples = async () => {
    const response = await api.get('/api/examples')
    return response.data.examples
}

export const checkHealth = async () => {
    const response = await api.get('/api/health')
    return response.data
}
