import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, User, Phone, Mail, Building, Calendar, DollarSign, FileText, Home, Info, Edit, Save, X, Database, Tag, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database as DatabaseType } from '@/integrations/supabase/types';

type ServiceType = DatabaseType['public']['Enums']['service_type'];
type JobStatus = 'requested' | 'in_progress' | 'completed';

interface JobDetailsModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, isOpen, onClose }) => {
  const [isEditingServiceType, setIsEditingServiceType] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState<ServiceType>('photography');
  const [isEditingReferralSource, setIsEditingReferralSource] = useState(false);
  const [editingReferralSource, setEditingReferralSource] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editingStatus, setEditingStatus] = useState<JobStatus>('requested');
  const [isEditingStripeInvoiceId, setIsEditingStripeInvoiceId] = useState(false);
  const [editingStripeInvoiceId, setEditingStripeInvoiceId] = useState('');
  const [saving, setSaving] = useState(false);
  const [checkingInvoice, setCheckingInvoice] = useState(false);
  const { toast } = useToast();

  if (!job) return null;

  const parseJobDescription = (description: string) => {
    const lines = description.split('\n');
    const data: any = {};
    let currentSection = '';

    lines.forEach(line => {
      if (line.includes('Services:')) {
        const services = line.replace('Services:', '').trim();
        data.services = services;
      } else if (line.includes('Subtotal:')) {
        const subtotal = line.replace('Subtotal:', '').trim();
        data.subtotal = subtotal;
      } else if (line.includes('Discount (')) {
        const discount = line.replace(/Discount \([^)]+\):/, '').trim();
        data.discount = discount;
        // Extract discount code from the line
        const codeMatch = line.match(/Discount \(([^)]+)\):/);
        if (codeMatch) {
          data.discountCode = codeMatch[1];
        }
      } else if (line.includes('Total Amount:')) {
        const amount = line.replace('Total Amount:', '').trim();
        data.totalAmount = amount;
      } else if (line.includes('Appointment:')) {
        const appointment = line.replace('Appointment:', '').trim();
        data.appointment = appointment;
      } else if (line.includes('Company:')) {
        const company = line.replace('Company:', '').trim();
        data.company = company;
      } else if (line.includes('Discount Information:')) {
        currentSection = 'discountInfo';
        data.discountInfo = {};
      } else if (line.includes('Appraisal Details:')) {
        currentSection = 'appraisal';
        data.appraisal = {};
      } else if (line.includes('Property Information:')) {
        currentSection = 'property';
        data.property = {};
      } else if (line.startsWith('- ') && currentSection) {
        const [key, ...valueParts] = line.substring(2).split(': ');
        const value = valueParts.join(': ');
        
        // Skip unwanted fields
        if (key === 'Purpose' || key === 'Lender Info' || key === 'Client Type' || key === 'Loan Amount') {
          return;
        }
        
        if (currentSection === 'discountInfo') {
          data.discountInfo[key] = value;
        } else if (currentSection === 'appraisal') {
          data.appraisal[key] = value;
        } else if (currentSection === 'property') {
          // Only include the concise property information fields
          const allowedFields = ['Address', 'Living Square Feet', 'Year Built', 'NJPR Property Link', 'APN', 'Acreage', 'County'];
          if (allowedFields.includes(key)) {
            data.property[key] = value;
          }
        }
      } else if (line.includes(': ') && !currentSection) {
        const [key, ...valueParts] = line.split(': ');
        const value = valueParts.join(': ');
        if (!data[key]) {
          data[key] = value;
        }
      }
    });

    return data;
  };

  const jobDetails = parseJobDescription(job.description || '');

  const getServiceTypeDisplay = () => {
    const services = jobDetails.services || '';
    const hasAppraisal = services.toLowerCase().includes('appraisal');
    const hasPhotography = services.toLowerCase().includes('photography') || services.toLowerCase().includes('photo');
    
    if (hasAppraisal && hasPhotography) {
      return 'Mixed Services (Photography + Appraisal)';
    } else if (hasAppraisal) {
      return 'Appraisal';
    } else if (hasPhotography) {
      return 'Photography';
    }
    
    return job.service_type.replace('_', ' ').toUpperCase();
  };

  const parseAppraisalContact = (contactString: string) => {
    try {
      const contacts = JSON.parse(contactString);
      if (Array.isArray(contacts)) {
        return contacts.map(contact => `${contact.name} (${contact.email})`).join(', ');
      }
      return contactString;
    } catch {
      return contactString;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      requested: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      // Legacy statuses for backward compatibility
      pending: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      declined: 'bg-red-100 text-red-800',
      invoice_sent: 'bg-orange-100 text-orange-800',
      invoice_paid: 'bg-emerald-100 text-emerald-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const referralSources = [
    { value: 'google', label: 'Google Search' },
    { value: 'referral', label: 'Friend/Family Referral' },
    { value: 'social-media', label: 'Social Media' },
    { value: 'real-estate-agent', label: 'Real Estate Agent' },
    { value: 'angi', label: 'Angi' },
    { value: 'njpropertyrecords', label: 'NJPropertyRecords' },
    { value: 'other', label: 'Other' }
  ];

  const getReferralSourceLabel = (value: string) => {
    const source = referralSources.find(s => s.value === value);
    return source ? source.label : value;
  };

  const jobStatuses = [
    { value: 'requested', label: 'Requested' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const getJobStatusLabel = (value: string) => {
    const status = jobStatuses.find(s => s.value === value);
    if (status) return status.label;
    
    // Handle legacy statuses
    switch (value) {
      case 'pending':
        return 'Requested';
      case 'quoted':
      case 'accepted':
      case 'in_progress':
      case 'invoice_sent':
        return 'In Progress';
      case 'completed':
      case 'invoice_paid':
        return 'Completed';
      default:
        return value.replace('_', ' ').toUpperCase();
    }
  };

  const handleEditServiceType = () => {
    setEditingServiceType(job.service_type as ServiceType);
    setIsEditingServiceType(true);
  };

  const handleSaveServiceType = async () => {
    setSaving(true);
    try {
      console.log('Updating service type via edge function...');
      
      const { data, error } = await supabase.functions.invoke('update-job', {
        body: {
          jobId: job.id,
          updateData: {
            service_type: editingServiceType
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update the job object in place
      job.service_type = editingServiceType;

      toast({
        title: "Service type updated",
        description: "The service type has been successfully updated.",
      });

      setIsEditingServiceType(false);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: "destructive",
        title: "Error updating service type",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingServiceType(false);
    setEditingServiceType('photography');
  };

  const handleEditReferralSource = () => {
    setEditingReferralSource(job.referral_source || '');
    setIsEditingReferralSource(true);
  };

  const handleSaveReferralSource = async () => {
    setSaving(true);
    try {
      console.log('Updating referral source via edge function...');
      
      const { data, error } = await supabase.functions.invoke('update-job', {
        body: {
          jobId: job.id,
          updateData: {
            referral_source: editingReferralSource
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update the job object in place
      job.referral_source = editingReferralSource;

      toast({
        title: "Referral source updated",
        description: "The referral source has been successfully updated.",
      });

      setIsEditingReferralSource(false);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: "destructive",
        title: "Error updating referral source",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelReferralEdit = () => {
    setIsEditingReferralSource(false);
    setEditingReferralSource('');
  };

  const handleEditStatus = () => {
    // Map legacy status to new status
    let mappedStatus: JobStatus = 'requested';
    switch (job.status) {
      case 'pending':
        mappedStatus = 'requested';
        break;
      case 'quoted':
      case 'accepted':
      case 'in_progress':
      case 'invoice_sent':
        mappedStatus = 'in_progress';
        break;
      case 'completed':
      case 'invoice_paid':
        mappedStatus = 'completed';
        break;
      default:
        mappedStatus = job.status as JobStatus;
    }
    setEditingStatus(mappedStatus);
    setIsEditingStatus(true);
  };

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      console.log('Updating status via edge function...');
      
      const { data, error } = await supabase.functions.invoke('update-job', {
        body: {
          jobId: job.id,
          updateData: {
            status: editingStatus
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update the job object in place
      job.status = editingStatus;

      toast({
        title: "Status updated",
        description: "The job status has been successfully updated.",
      });

      setIsEditingStatus(false);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelStatusEdit = () => {
    setIsEditingStatus(false);
    setEditingStatus('requested');
  };

  const handleEditStripeInvoiceId = () => {
    setEditingStripeInvoiceId(job.stripe_invoice_id || '');
    setIsEditingStripeInvoiceId(true);
  };

  const handleSaveStripeInvoiceId = async () => {
    setSaving(true);
    try {
      console.log('Updating Stripe invoice ID via edge function...');
      
      const { data, error } = await supabase.functions.invoke('update-job', {
        body: {
          jobId: job.id,
          updateData: {
            stripe_invoice_id: editingStripeInvoiceId || null
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update the job object in place
      job.stripe_invoice_id = editingStripeInvoiceId || null;

      toast({
        title: "Stripe invoice ID updated",
        description: "The Stripe invoice ID has been successfully updated.",
      });

      setIsEditingStripeInvoiceId(false);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: "destructive",
        title: "Error updating Stripe invoice ID",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelStripeInvoiceIdEdit = () => {
    setIsEditingStripeInvoiceId(false);
    setEditingStripeInvoiceId('');
  };

  const handleCheckInvoiceStatus = async () => {
    if (!job.stripe_invoice_id) {
      toast({
        variant: "destructive",
        title: "No Stripe invoice ID",
        description: "This job doesn't have a Stripe invoice ID to check.",
      });
      return;
    }

    setCheckingInvoice(true);
    try {
      console.log('Checking invoice status via edge function...');
      
      const { data, error } = await supabase.functions.invoke('check-invoice-status', {
        body: {
          jobId: job.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update the job object with the latest invoice status
      job.invoice_status = data.invoiceStatus;
      if (data.amountPaid) {
        job.invoice_amount = data.amountPaid;
      }
      if (data.paidAt) {
        job.invoice_paid_at = data.paidAt;
      }

      toast({
        title: "Invoice status updated",
        description: `Invoice status: ${data.invoiceStatus}`,
      });

    } catch (error) {
      console.error('Check invoice error:', error);
      toast({
        variant: "destructive",
        title: "Error checking invoice status",
        description: error.message,
      });
    } finally {
      setCheckingInvoice(false);
    }
  };

  // Parse raw NJPR data if available
  const getRawNjprData = () => {
    if (!job.raw_njpr_data) return null;
    try {
      return JSON.parse(job.raw_njpr_data);
    } catch (error) {
      console.error('Error parsing raw NJPR data:', error);
      return null;
    }
  };

  const rawNjprData = getRawNjprData();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Job Details: {job.client_name}
            <div className="flex items-center gap-2">
              {isEditingStatus ? (
                <div className="flex items-center gap-2">
                  <Select value={editingStatus} onValueChange={(value: string) => setEditingStatus(value as JobStatus)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleSaveStatus}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelStatusEdit}
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditStatus}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">{job.client_name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                <span>{job.client_email}</span>
              </div>
              {job.client_phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{job.client_phone}</span>
                </div>
              )}
              {jobDetails.company && jobDetails.company !== 'N/A' && (
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{jobDetails.company}</span>
                </div>
              )}

              {/* Discount Code Usage Display */}
              {(jobDetails.discountCode || jobDetails.discountInfo) && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                  <div className="flex items-center mb-2">
                    <Tag className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium text-green-700">Discount Code Used</span>
                  </div>
                  <div className="text-sm text-green-700">
                    Code: <span className="font-mono font-semibold">{jobDetails.discountCode || jobDetails.discountInfo?.['Code Used'] || 'NJPR'}</span>
                  </div>
                  {jobDetails.discountInfo?.['Discount Amount'] && (
                    <div className="text-sm text-green-700">
                      Amount: {jobDetails.discountInfo['Discount Amount']}
                    </div>
                  )}
                </div>
              )}

              <div>
                <span className="font-medium text-sm text-gray-600">How Did You Hear About Us:</span>
                <div className="flex items-center gap-2 mt-1">
                  {isEditingReferralSource ? (
                    <div className="flex items-center gap-2">
                      <Select value={editingReferralSource} onValueChange={setEditingReferralSource}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select referral source" />
                        </SelectTrigger>
                        <SelectContent>
                          {referralSources.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={handleSaveReferralSource}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelReferralEdit}
                        disabled={saving}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{job.referral_source ? getReferralSourceLabel(job.referral_source) : 'Not specified'}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditReferralSource}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {job.referral_other_description && (
                  <div className="text-sm text-gray-600 mt-1">
                    Description: {job.referral_other_description}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-sm text-gray-600">Service Type:</span>
                <div className="flex items-center gap-2 mt-1">
                  {isEditingServiceType ? (
                    <div className="flex items-center gap-2">
                      <Select value={editingServiceType} onValueChange={(value: string) => setEditingServiceType(value as ServiceType)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="photography">Photography</SelectItem>
                          <SelectItem value="aerial_photography">Aerial Photography</SelectItem>
                          <SelectItem value="floor_plans">Floor Plans</SelectItem>
                          <SelectItem value="virtual_tour">Virtual Tour</SelectItem>
                          <SelectItem value="appraisal">Appraisal</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={handleSaveServiceType}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{job.service_type.replace('_', ' ')}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditServiceType}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {jobDetails.services && (
                <div>
                  <span className="font-medium text-sm text-gray-600">Requested Services:</span>
                  <div className="text-sm bg-gray-50 p-2 rounded mt-1">{jobDetails.services}</div>
                </div>
              )}

              {/* Financial breakdown with discount */}
              <div className="bg-gray-50 rounded p-3 space-y-2">
                {jobDetails.subtotal && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium">{jobDetails.subtotal}</span>
                  </div>
                )}
                
                {jobDetails.discount && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Discount ({jobDetails.discountCode || 'NJPR'}):</span>
                    <span className="text-sm font-medium">{jobDetails.discount}</span>
                  </div>
                )}
                
                {jobDetails.totalAmount && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="font-semibold text-green-600">{jobDetails.totalAmount}</span>
                  </div>
                )}
              </div>

              {jobDetails.appointment && (
                <div>
                  <span className="font-medium text-sm text-gray-600">Preferred Appointment:</span>
                  <div className="mt-1">{jobDetails.appointment}</div>
                </div>
              )}
              <div>
                <span className="font-medium text-sm text-gray-600">Created:</span>
                <div className="mt-1">{new Date(job.created_at).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-sm text-gray-600">Address:</span>
                <div className="text-sm mt-1">{job.property_address}</div>
              </div>
              {jobDetails.property && (
                <>
                  {Object.entries(jobDetails.property).map(([key, value]: [string, any]) => {
                    if (!value || value === 'N/A' || key === 'Address') return null;
                    
                    // Special handling for NJPR Property Link to make it clickable
                    if (key === 'NJPR Property Link') {
                      return (
                        <div key={key}>
                          <span className="font-medium text-sm text-gray-600">{key}:</span>
                          <div className="text-sm mt-1">
                            <a 
                              href={value.includes('<a href=') ? value.match(/href="([^"]*)/)?.[1] : value} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {value.includes('<a href=') ? value.match(/>(.*?)<\/a>/)?.[1] : value}
                            </a>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={key}>
                        <span className="font-medium text-sm text-gray-600">{key}:</span>
                        <div className="text-sm mt-1">{value}</div>
                      </div>
                    );
                  })}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Financial Information
                </div>
                {job.stripe_invoice_id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCheckInvoiceStatus}
                    disabled={checkingInvoice}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${checkingInvoice ? 'animate-spin' : ''}`} />
                    Sync Stripe
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-sm text-gray-600">Status:</span>
                <div className="mt-1">{getStatusBadge(job.status)}</div>
              </div>
              {job.quoted_amount && (
                <div>
                  <span className="font-medium text-sm text-gray-600">Admin Quoted Amount:</span>
                  <div className="font-semibold mt-1">${parseFloat(job.quoted_amount).toLocaleString()}</div>
                </div>
              )}
              {job.invoice_amount && (
                <div>
                  <span className="font-medium text-sm text-gray-600">Invoice Amount:</span>
                  <div className="font-semibold mt-1">${parseFloat(job.invoice_amount).toLocaleString()}</div>
                </div>
              )}
              {job.invoice_status && (
                <div>
                  <span className="font-medium text-sm text-gray-600">Invoice Status:</span>
                  <div className="mt-1">
                    <Badge className={
                      job.invoice_status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      job.invoice_status === 'open' ? 'bg-blue-100 text-blue-800' :
                      job.invoice_status === 'paid' ? 'bg-green-100 text-green-800' :
                      job.invoice_status === 'void' ? 'bg-red-100 text-red-800' :
                      job.invoice_status === 'uncollectible' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {job.invoice_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              )}
              {job.invoice_sent_at && (
                <div>
                  <span className="font-medium text-sm text-gray-600">Invoice Sent:</span>
                  <div className="mt-1">{new Date(job.invoice_sent_at).toLocaleString()}</div>
                </div>
              )}
              {job.invoice_paid_at && (
                <div>
                  <span className="font-medium text-sm text-gray-600">Invoice Paid:</span>
                  <div className="mt-1">{new Date(job.invoice_paid_at).toLocaleString()}</div>
                </div>
              )}
              <div>
                <span className="font-medium text-sm text-gray-600">Stripe Invoice ID:</span>
                <div className="flex items-center gap-2 mt-1">
                  {isEditingStripeInvoiceId ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        value={editingStripeInvoiceId}
                        onChange={(e) => setEditingStripeInvoiceId(e.target.value)}
                        placeholder="Enter Stripe invoice ID"
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveStripeInvoiceId}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelStripeInvoiceIdEdit}
                        disabled={saving}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <div className="font-mono text-xs bg-gray-50 p-2 rounded flex-1 break-all">
                        {job.stripe_invoice_id || 'Not set'}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditStripeInvoiceId}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {jobDetails.appraisal && Object.keys(jobDetails.appraisal).length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Appraisal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(jobDetails.appraisal).map(([key, value]: [string, any]) => {
                  if (!value || value === 'N/A') return null;
                  
                  let displayValue = value;
                  
                  // Special handling for contact information
                  if (key === 'Intended Users' && typeof value === 'string' && value.startsWith('[')) {
                    displayValue = parseAppraisalContact(value);
                  }
                  
                  return (
                    <div key={key} className="bg-gray-50 p-3 rounded">
                      <span className="font-medium text-sm text-gray-600 block">{key}:</span>
                      <div className="text-sm mt-1">{displayValue}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {rawNjprData && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Raw NJPR Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60 w-full rounded border">
                <pre className="text-xs p-4 whitespace-pre-wrap font-mono">
                  {JSON.stringify(rawNjprData, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {job.description && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Full Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto whitespace-pre-wrap">
                {job.description}
              </pre>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
