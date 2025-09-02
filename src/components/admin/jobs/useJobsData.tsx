
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useJobsData = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const parseServiceDetails = (job) => {
    const description = job.description || '';
    
    // First check if there's a Services line in the description
    const lines = description.split('\n');
    const servicesLine = lines.find(line => line.includes('Services:'));
    
    if (servicesLine) {
      const services = servicesLine.replace('Services:', '').trim();
      
      // Check if it contains both appraisal and photography
      const hasAppraisal = services.toLowerCase().includes('appraisal');
      const hasPhotography = services.toLowerCase().includes('photography') || services.toLowerCase().includes('photo');
      
      if (hasAppraisal && hasPhotography) {
        return 'Mixed Services';
      } else if (hasAppraisal) {
        return 'Appraisal Report';
      } else if (hasPhotography) {
        return services; // Return the actual photography service details
      } else {
        return services; // Return whatever services are listed
      }
    }
    
    // Fallback to the service_type field from the database
    const serviceTypeMapping = {
      'photography': 'Photography',
      'aerial_photography': 'Aerial Photography',
      'floor_plans': 'Floor Plans',
      'virtual_tour': 'Virtual Tour',
      'appraisal': 'Appraisal Report'
    };
    
    return serviceTypeMapping[job.service_type] || job.service_type.replace('_', ' ').toUpperCase();
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs for admin dashboard...');
      console.log('Loading state set to:', true);
      
      // Try edge function first
      try {
        const { data: functionResult, error: functionError } = await supabase.functions.invoke('get-admin-jobs', {
          body: {}
        });

        if (!functionError && functionResult?.jobs) {
          console.log('Jobs fetched via edge function:', functionResult.jobs.length);
          setJobs(functionResult.jobs);
          return;
        }
        
        console.warn('Edge function failed or returned no data, falling back to direct query');
      } catch (edgeFunctionError) {
        console.warn('Edge function failed, falling back to direct query:', edgeFunctionError);
      }
      
      // Fallback to direct database query
      console.log('Fetching jobs via direct database query...');
      const { data: directJobs, error: directError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (directError) {
        console.error('Direct query error:', directError);
        throw new Error(`Failed to fetch jobs: ${directError.message}`);
      }
      
      console.log('Jobs fetched via direct query:', directJobs?.length || 0);
      setJobs(directJobs || []);
      
    } catch (error) {
      console.error('Fetch jobs error:', error);
      toast({
        variant: "destructive",
        title: "Error fetching jobs",
        description: error.message || 'Failed to load jobs. Please check your admin permissions.',
      });
      
      // Set empty array to show "no jobs" message instead of loading forever
      setJobs([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      console.log('Loading state set to:', false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }

    if (filterService !== 'all') {
      filtered = filtered.filter(job => job.service_type === filterService);
    }

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.property_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, filterStatus, filterService, searchTerm]);

  return {
    jobs,
    filteredJobs,
    filterStatus,
    filterService,
    searchTerm,
    loading,
    parseServiceDetails,
    fetchJobs,
    setFilterStatus,
    setFilterService,
    setSearchTerm
  };
};
