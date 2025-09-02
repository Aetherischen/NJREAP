import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AppraisalJob {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  property_address: string;
  service_type: string;
  status: string;
  created_at: string;
  scheduled_date: string | null;
  quoted_amount: number | null;
  final_amount: number | null;
  description: string | null;
  raw_njpr_data: string | null;
}

const AppraisalsManagement = () => {
  const [appraisals, setAppraisals] = useState<AppraisalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs for appraisals management...');
      
      // Use the same edge function as JobsManagement to bypass RLS issues
      const { data: functionResult, error: functionError } = await supabase.functions.invoke('get-admin-jobs', {
        body: {}
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        // Fallback to direct query
        console.log('Falling back to direct query for appraisals...');
        
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Direct query error:', error);
          throw error;
        }
        
        // Filter for appraisal-related jobs
        const appraisalJobs = (data || []).filter(job => isAppraisalJob(job));
        setAppraisals(appraisalJobs);
      } else {
        console.log('Jobs fetched via edge function for appraisals:', functionResult?.jobs?.length || 0);
        // Filter for appraisal-related jobs
        const appraisalJobs = (functionResult.jobs || []).filter(job => isAppraisalJob(job));
        setAppraisals(appraisalJobs);
      }
      
    } catch (error) {
      console.error('Error fetching appraisals:', error);
      toast({
        variant: "destructive",
        title: "Error fetching appraisals",
        description: "Could not load appraisal data. Please refresh the page.",
      });
      
      // Set empty array to show "no appraisals" message instead of loading forever
      setAppraisals([]);
    } finally {
      setLoading(false);
    }
  };

  const isAppraisalJob = (job: AppraisalJob) => {
    const description = job.description?.toLowerCase() || '';
    const serviceType = job.service_type?.toLowerCase() || '';
    
    return description.includes('appraisal') || 
           serviceType.includes('appraisal') ||
           serviceType === 'appraisal' ||
           description.includes('appraisal report') ||
           description.includes('property appraisal');
  };

  const parsePropertyAddress = (address: string) => {
    // Try to parse NJPR data first for more detailed address info
    const parts = address.split(',');
    if (parts.length >= 3) {
      const streetAddress = parts[0].trim();
      const cityStateZip = parts.slice(1).join(',').trim();
      return {
        line1: streetAddress,
        line2: cityStateZip
      };
    }
    
    // Fallback to simple split
    return {
      line1: address,
      line2: ''
    };
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredAppraisals = appraisals.filter(appraisal => {
    const matchesSearch = 
      appraisal.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraisal.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraisal.client_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appraisal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Appraisals Management</h2>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4d0a97] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appraisals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appraisals Management</h2>
          <p className="text-gray-600">Manage all appraisal-related jobs and requests</p>
        </div>
        <Button onClick={fetchAppraisals}>
          <FileText className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appraisals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAppraisals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Badge className="bg-green-100 text-green-800">✓</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredAppraisals.filter(a => a.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredAppraisals.filter(a => a.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                filteredAppraisals
                  .filter(a => a.status === 'completed' && a.final_amount)
                  .reduce((sum, a) => sum + (a.final_amount || 0), 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by client name, address, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4d0a97]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appraisals List */}
      {filteredAppraisals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {appraisals.length === 0 ? 'No appraisals found' : 'No matching appraisals'}
            </h3>
            <p className="text-gray-600">
              {appraisals.length === 0 
                ? 'Appraisal jobs will appear here when submitted through the website.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppraisals.map((appraisal) => {
            const addressParts = parsePropertyAddress(appraisal.property_address);
            
            return (
              <Card key={appraisal.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-lg">{appraisal.client_name}</h3>
                          <p className="text-sm text-gray-600">{appraisal.client_email}</p>
                          {appraisal.client_phone && (
                            <p className="text-sm text-gray-600">{appraisal.client_phone}</p>
                          )}
                        </div>
                        <Badge className={getStatusColor(appraisal.status)}>
                          {formatStatus(appraisal.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium">{addressParts.line1}</div>
                            {addressParts.line2 && (
                              <div className="text-gray-600">{addressParts.line2}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Appraisal Service</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            Created: {formatDate(appraisal.created_at)}
                          </span>
                        </div>
                        {appraisal.scheduled_date && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              Scheduled: {formatDate(appraisal.scheduled_date)}
                            </span>
                          </div>
                        )}
                      </div>

                      {appraisal.description && (
                        <div className="pt-2">
                          <p className="text-sm text-gray-700">{appraisal.description}</p>
                        </div>
                      )}

                      <div className="flex items-center space-x-6 pt-2">
                        {appraisal.quoted_amount && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              Quote: {formatCurrency(appraisal.quoted_amount)}
                            </span>
                          </div>
                        )}
                        {appraisal.final_amount && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">
                              Final: {formatCurrency(appraisal.final_amount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppraisalsManagement;
