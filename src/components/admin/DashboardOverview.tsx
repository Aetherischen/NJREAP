
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, DollarSign, TrendingUp, Users, MapPin, Clock } from 'lucide-react';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    avgJobValue: 0,
    avgCompletionTime: 0,
    monthlyJobs: [],
    serviceBreakdown: [],
    recentJobs: [],
    referralSources: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      setLoading(true);

      // Fetch jobs using the same method as other admin components
      const { data: functionResult, error: functionError } = await supabase.functions.invoke('get-admin-jobs', {
        body: {}
      });

      let jobsData = [];

      if (functionError) {
        console.error('Edge function error:', functionError);
        // Fallback to direct query
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Direct query error:', error);
          throw error;
        }
        jobsData = data || [];
      } else {
        jobsData = functionResult?.jobs || [];
      }

      // Process jobs data regardless of length
      processJobsData(jobsData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processJobsData = (jobs) => {
    console.log('Processing jobs data for dashboard overview...');
    
    const totalJobs = jobs.length;
    const pendingJobs = jobs.filter(job => job.status === 'pending').length;
    const completedJobs = jobs.filter(job => job.status === 'completed').length;
    
    // Calculate revenue from completed jobs
    const totalRevenue = jobs
      .filter(job => job.status === 'completed' && job.final_amount)
      .reduce((sum, job) => {
        const amount = typeof job.final_amount === 'string' ? parseFloat(job.final_amount) : Number(job.final_amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    
    const avgJobValue = completedJobs > 0 ? totalRevenue / completedJobs : 0;

    // Calculate average completion time (from scheduled_date to completed_date)
    const completedJobsWithDates = jobs.filter(job => 
      job.status === 'completed' && 
      job.scheduled_date && 
      job.completed_date
    );
    
    let avgCompletionTime = 0;
    if (completedJobsWithDates.length > 0) {
      const totalCompletionTime = completedJobsWithDates.reduce((sum, job) => {
        const scheduledDate = new Date(job.scheduled_date);
        const completedDate = new Date(job.completed_date);
        const diffInDays = Math.ceil((completedDate.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, diffInDays); // Ensure non-negative values
      }, 0);
      avgCompletionTime = totalCompletionTime / completedJobsWithDates.length;
    }

    // Process monthly jobs data
    const monthlyData: Record<string, { month: string; jobs: number }> = {};
    jobs.forEach(job => {
      const date = new Date(job.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthName, jobs: 0 };
      }
      monthlyData[monthKey].jobs += 1;
    });

    const monthlyJobs = Object.values(monthlyData)
      .sort((a, b) => new Date(a.month + ' 01').getTime() - new Date(b.month + ' 01').getTime())
      .slice(-6); // Last 6 months

    // Process service breakdown
    const serviceCount = {};
    jobs.forEach(job => {
      const serviceType = job.service_type || 'unknown';
      serviceCount[serviceType] = (serviceCount[serviceType] || 0) + 1;
    });

    const serviceBreakdown = Object.entries(serviceCount).map(([service, count]) => ({
      service: service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: count as number
    }));

    // Process referral sources using the new referral_source field
    const referralCount = {};
    jobs.forEach(job => {
      const source = job.referral_source || 'Not specified';
      referralCount[source] = (referralCount[source] || 0) + 1;
    });

    const referralSources = Object.entries(referralCount).map(([source, count]) => ({
      source,
      count: count as number,
      percentage: ((count as number / totalJobs) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);

    // Get recent jobs
    const recentJobs = jobs.slice(0, 5).map(job => ({
      id: job.id,
      client: job.client_name,
      service: job.service_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
      status: job.status,
      amount: job.quoted_amount || job.final_amount || 0,
      date: new Date(job.created_at).toLocaleDateString()
    }));

    setStats({
      totalJobs,
      pendingJobs,
      completedJobs,
      totalRevenue,
      avgJobValue,
      avgCompletionTime,
      monthlyJobs,
      serviceBreakdown,
      recentJobs,
      referralSources
    });

    console.log('Dashboard stats processed:', {
      totalJobs,
      referralSources: referralSources.length,
      avgCompletionTime
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4d0a97]"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const COLORS = ['#4d0a97', '#a044e3', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingJobs}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Completed jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Job Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(stats.avgJobValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per completed job</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgCompletionTime)}</div>
            <p className="text-xs text-muted-foreground">Days from inspection</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Job Trends</CardTitle>
            <CardDescription>Jobs created over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.monthlyJobs.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyJobs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="#4d0a97" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Breakdown</CardTitle>
            <CardDescription>Distribution of service types</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.serviceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ service, count }) => `${service}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.serviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No service data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Did Clients Hear About Us</CardTitle>
            <CardDescription>Referral source breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.referralSources.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.referralSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, count }) => `${source}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.referralSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No referral data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Latest job submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentJobs.length > 0 ? (
                stats.recentJobs.map((job, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{job.client}</div>
                      <div className="text-sm text-gray-600">{job.service}</div>
                      <div className="text-xs text-gray-500">{job.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${job.amount.toLocaleString()}</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        job.status === 'completed' ? 'bg-green-100 text-green-800' :
                        job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">No recent jobs</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
