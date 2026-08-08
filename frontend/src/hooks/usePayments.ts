import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: api.getPayments,
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.initiatePayment,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(data?.message || 'Payment request sent');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId }: { paymentId: string | number }) =>
      api.confirmPayment(paymentId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      const status = data?.payment?.paymentStatus;
      if (status === 'SUCCESS') {
        toast.success('Payment confirmed successfully');
      } else if (status === 'FAILED' || status === 'CANCELLED') {
        toast.error('Payment was not completed');
      } else {
        toast.success('Payment status updated');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
