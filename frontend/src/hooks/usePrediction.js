import { useMutation, useQuery } from '@tanstack/react-query'
import { predictToxicity, fetchExamples } from '../api/toxicity'

export function usePrediction() {
    const mutation = useMutation({
        mutationFn: predictToxicity,
        onError: (error) => {
            console.error('Prediction failed:', error)
        }
    })

    return {
        predict: mutation.mutate,
        data: mutation.data,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        reset: mutation.reset,
    }
}

export function useExamples() {
    return useQuery({
        queryKey: ['examples'],
        queryFn: fetchExamples,
        staleTime: Infinity,
    })
}
