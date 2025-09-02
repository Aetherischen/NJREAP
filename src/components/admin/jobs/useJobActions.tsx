
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useJobActions = (fetchJobs: () => void) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const { toast } = useToast();

  const declineJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'cancelled' as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job declined",
        description: "The job has been marked as declined",
      });

      fetchJobs();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error declining job",
        description: error.message,
      });
    }
  };

  const createStripeInvoice = async (jobId, amount, description = '') => {
    setLoadingInvoice(true);
    try {
      const invoiceData = {
        jobId,
        amount: parseFloat(amount),
        description
      };

      const { data, error } = await supabase.functions.invoke('create-stripe-invoice', {
        body: invoiceData
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Invoice sent successfully!",
        description: `Stripe invoice has been sent to the customer.`,
      });

      setIsInvoiceDialogOpen(false);
      setSelectedJob(null);
      await fetchJobs();
      
    } catch (error) {
      console.error('Frontend invoice error:', error);
      toast({
        variant: "destructive",
        title: "Error creating invoice",
        description: error.message,
      });
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleJobRowClick = (job) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  return {
    selectedJob,
    isInvoiceDialogOpen,
    isDetailsModalOpen,
    loadingInvoice,
    declineJob,
    createStripeInvoice,
    handleJobRowClick,
    setSelectedJob,
    setIsInvoiceDialogOpen,
    setIsDetailsModalOpen
  };
};
