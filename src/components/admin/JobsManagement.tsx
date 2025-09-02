
import { Card, CardContent } from '@/components/ui/card';
import JobDetailsModal from './JobDetailsModal';
import JobsHeader from './jobs/JobsHeader';
import JobsFilters from './jobs/JobsFilters';
import JobsTable from './jobs/JobsTable';
import { useJobsData } from './jobs/useJobsData';
import { useJobActions } from './jobs/useJobActions';

const JobsManagement = () => {
  const {
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
  } = useJobsData();

  const {
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
  } = useJobActions(fetchJobs);

  const handleRefresh = () => {
    console.log('Refresh triggered from JobsManagement');
    fetchJobs();
  };

  return (
    <div className="space-y-6">
      <Card>
        <JobsHeader totalJobs={jobs.length} onRefresh={handleRefresh} />
        <CardContent className="space-y-4">
          <JobsFilters
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            filterService={filterService}
            onSearchChange={setSearchTerm}
            onStatusChange={setFilterStatus}
            onServiceChange={setFilterService}
          />

          <JobsTable
            jobs={filteredJobs}
            loading={loading}
            isInvoiceDialogOpen={isInvoiceDialogOpen}
            selectedJob={selectedJob}
            loadingInvoice={loadingInvoice}
            onJobRowClick={handleJobRowClick}
            onDeclineJob={declineJob}
            onCreateInvoice={createStripeInvoice}
            onSetSelectedJob={setSelectedJob}
            onSetInvoiceDialogOpen={setIsInvoiceDialogOpen}
            parseServiceDetails={parseServiceDetails}
          />
        </CardContent>
      </Card>

      <JobDetailsModal
        job={selectedJob}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default JobsManagement;
