import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from 'recharts';
import { TrendingUp, DollarSign, Calendar, MapPin, Clock, Target, Users, Award } from 'lucide-react';
import GoogleAnalyticsIntegration from './GoogleAnalyticsIntegration';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    servicePopularity: [],
    revenueAnalysis: [],
    countyData: [],
    cityData: [],
    conversionRates: [],
    monthlyGrowth: [],
    statusDistribution: [],
    averageJobValue: [],
    seasonalTrends: [],
    completionTimes: [],
    topPerformingServices: []
  });
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgJobValue, setAvgJobValue] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      console.log('Fetching analytics data...');
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

      console.log('Jobs data for analytics:', jobsData.length);
      setJobs(jobsData);

      if (jobsData.length > 0) {
        processAnalyticsData(jobsData);
      } else {
        // Set empty state
        setAnalytics({
          servicePopularity: [],
          revenueAnalysis: [],
          countyData: [],
          cityData: [],
          conversionRates: [],
          monthlyGrowth: [],
          statusDistribution: [],
          averageJobValue: [],
          seasonalTrends: [],
          completionTimes: [],
          topPerformingServices: []
        });
      }
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseJobDescription = (description: string) => {
    const lines = description.split('\n');
    const data: any = {};
    let currentSection = '';

    lines.forEach(line => {
      if (line.includes('Services:')) {
        const services = line.replace('Services:', '').trim();
        data.services = services;
      } else if (line.includes('Total Amount:')) {
        const amount = line.replace('Total Amount:', '').trim();
        data.totalAmount = amount;
      } else if (line.includes('Appointment:')) {
        const appointment = line.replace('Appointment:', '').trim();
        data.appointment = appointment;
      } else if (line.includes('Company:')) {
        const company = line.replace('Company:', '').trim();
        data.company = company;
      } else if (line.includes('Referral Source:')) {
        const referralSource = line.replace('Referral Source:', '').trim();
        data.referralSource = referralSource;
      } else if (line.includes('Referral Description:')) {
        const referralDescription = line.replace('Referral Description:', '').trim();
        data.referralDescription = referralDescription;
      } else if (line.includes('Appraisal Details:')) {
        currentSection = 'appraisal';
        data.appraisal = {};
      } else if (line.includes('Property Information:')) {
        currentSection = 'property';
        data.property = {};
      } else if (line.startsWith('- ') && currentSection) {
        const [key, ...valueParts] = line.substring(2).split(': ');
        const value = valueParts.join(': ');
        
        if (currentSection === 'appraisal') {
          data.appraisal[key] = value;
        } else if (currentSection === 'property') {
          data.property[key] = value;
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

  const processAnalyticsData = (jobs) => {
    console.log('Processing analytics data for', jobs.length, 'jobs');
    
    setTotalJobs(jobs.length);
    
    // Calculate total revenue from completed jobs
    const completedJobs = jobs.filter(job => job.status === 'completed' && job.final_amount);
    const revenue = completedJobs.reduce((sum, job) => {
      const amount = typeof job.final_amount === 'string' ? parseFloat(job.final_amount) : Number(job.final_amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    setTotalRevenue(revenue);
    setAvgJobValue(completedJobs.length > 0 ? revenue / completedJobs.length : 0);
    setCompletionRate(parseFloat(((completedJobs.length / jobs.length) * 100).toFixed(1)));

    // Service Popularity Analysis
    const serviceCount = jobs.reduce((acc, job) => {
      const serviceType = job.service_type || 'Unknown';
      acc[serviceType] = (acc[serviceType] || 0) + 1;
      return acc;
    }, {});

    const servicePopularity = Object.entries(serviceCount).map(([service, count]) => ({
      name: service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count as number,
      percentage: (((count as number) / jobs.length) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value);

    // Revenue Analysis by Service
    const revenueByService = jobs.reduce((acc, job) => {
      if (job.final_amount && job.status === 'completed') {
        const amount = typeof job.final_amount === 'string' ? parseFloat(job.final_amount) : Number(job.final_amount);
        const serviceType = job.service_type || 'Unknown';
        
        if (!isNaN(amount)) {
          if (!acc[serviceType]) {
            acc[serviceType] = { total: 0, count: 0 };
          }
          acc[serviceType].total += amount;
          acc[serviceType].count += 1;
        }
      }
      return acc;
    }, {});

    const revenueAnalysis = Object.entries(revenueByService).map(([service, data]: [string, any]) => ({
      service: service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      revenue: Math.round(data.total),
      avgRevenue: Math.round(data.total / data.count),
      jobCount: data.count
    })).sort((a, b) => b.revenue - a.revenue);

    // County Analysis - Use parsed property information
    const countyCount = jobs.reduce((acc, job) => {
      let county = 'Unknown';
      
      // Parse the job description to get property information
      const jobDetails = parseJobDescription(job.description || '');
      
      // Check if we have county information in the property details
      if (jobDetails.property && jobDetails.property.County) {
        county = jobDetails.property.County.trim();
        // Ensure it ends with "County" if it doesn't already
        if (!county.toLowerCase().includes('county')) {
          county = `${county} County`;
        }
      } else {
        // Fallback to address parsing if no structured county data
        const address = (job.property_address || '').toLowerCase();
        
        if (address.includes('hunterdon')) county = 'Hunterdon County';
        else if (address.includes('somerset')) county = 'Somerset County';
        else if (address.includes('mercer')) county = 'Mercer County';
        else if (address.includes('morris')) county = 'Morris County';
        else if (address.includes('bergen')) county = 'Bergen County';
        else if (address.includes('essex')) county = 'Essex County';
        else if (address.includes('hudson')) county = 'Hudson County';
        else if (address.includes('middlesex')) county = 'Middlesex County';
        else if (address.includes('monmouth')) county = 'Monmouth County';
        else if (address.includes('ocean')) county = 'Ocean County';
        else if (address.includes('union')) county = 'Union County';
        else if (address.includes('passaic')) county = 'Passaic County';
        else if (address.includes('warren')) county = 'Warren County';
        else if (address.includes('sussex')) county = 'Sussex County';
        else if (address.includes(' nj ') || address.includes(', nj')) county = 'New Jersey (Other)';
      }
      
      acc[county] = (acc[county] || 0) + 1;
      return acc;
    }, {});

    const countyData = Object.entries(countyCount).map(([county, count]) => ({
      county,
      count: count as number,
      percentage: (((count as number) / jobs.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);

    // City Analysis - Extract from address
    const cityCount = jobs.reduce((acc, job) => {
      const address = job.property_address || '';
      let city = 'Other';
      
      // Extract city from address - usually first part before comma
      const addressParts = address.split(',');
      if (addressParts.length >= 2) {
        const cityPart = addressParts[addressParts.length - 2].trim(); // Second to last part is usually city
        if (cityPart && cityPart.length > 0 && !cityPart.match(/^\d/)) { // Not starting with number
          city = cityPart;
        }
      }
      
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    const cityData = Object.entries(cityCount).map(([city, count]) => ({
      city,
      count: count as number,
      percentage: (((count as number) / jobs.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count).slice(0, 10);

    // Status Distribution
    const statusCount = jobs.reduce((acc, job) => {
      const status = job.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
      status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: count as number,
      percentage: (((count as number) / jobs.length) * 100).toFixed(1)
    }));

    // Conversion Rates (funnel analysis)
    const pending = jobs.filter(job => job.status === 'pending').length;
    const quoted = jobs.filter(job => ['quoted', 'accepted', 'completed'].includes(job.status)).length;
    const accepted = jobs.filter(job => ['accepted', 'completed'].includes(job.status)).length;
    const completed = jobs.filter(job => job.status === 'completed').length;

    const conversionRates = [
      { stage: 'Inquiries', count: jobs.length, rate: 100 },
      { stage: 'Quoted', count: quoted, rate: parseFloat(((quoted / jobs.length) * 100).toFixed(1)) },
      { stage: 'Accepted', count: accepted, rate: parseFloat(((accepted / jobs.length) * 100).toFixed(1)) },
      { stage: 'Completed', count: completed, rate: parseFloat(((completed / jobs.length) * 100).toFixed(1)) }
    ];

    // Monthly Growth Analysis
    const monthlyData = jobs.reduce((acc, job) => {
      const date = new Date(job.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthName, jobs: 0, revenue: 0, completed: 0 };
      }
      
      acc[monthKey].jobs += 1;
      
      if (job.final_amount && job.status === 'completed') {
        const amount = typeof job.final_amount === 'string' ? parseFloat(job.final_amount) : Number(job.final_amount);
        if (!isNaN(amount)) {
          acc[monthKey].revenue += amount;
          acc[monthKey].completed += 1;
        }
      }
      
      return acc;
    }, {});

    const monthlyGrowth = Object.values(monthlyData).sort((a: any, b: any) => {
      const aDate = new Date(a.month + ' 01');
      const bDate = new Date(b.month + ' 01');
      return aDate.getTime() - bDate.getTime();
    });

    // Average Job Value by Service
    const averageJobValue = Object.entries(revenueByService).map(([service, data]: [string, any]) => ({
      service: service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      avgValue: Math.round(data.total / data.count),
      jobCount: data.count
    })).sort((a, b) => b.avgValue - a.avgValue);

    // Seasonal Trends
    const seasonalData = jobs.reduce((acc, job) => {
      const date = new Date(job.created_at);
      const month = date.getMonth();
      let season;
      
      if (month >= 2 && month <= 4) season = 'Spring';
      else if (month >= 5 && month <= 7) season = 'Summer';
      else if (month >= 8 && month <= 10) season = 'Fall';
      else season = 'Winter';
      
      if (!acc[season]) {
        acc[season] = { season, jobs: 0, revenue: 0 };
      }
      
      acc[season].jobs += 1;
      
      if (job.final_amount && job.status === 'completed') {
        const amount = typeof job.final_amount === 'string' ? parseFloat(job.final_amount) : Number(job.final_amount);
        if (!isNaN(amount)) {
          acc[season].revenue += amount;
        }
      }
      
      return acc;
    }, {});

    const seasonalTrends = Object.values(seasonalData);

    // Completion Times - Calculate days from created to completed
    const completionTimes = jobs
      .filter(job => job.status === 'completed' && job.completed_date)
      .map(job => {
        const created = new Date(job.created_at);
        const completed = new Date(job.completed_date);
        const days = Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return {
          service: (job.service_type || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          days: days > 0 ? days : 1
        };
      });

    const avgCompletionByService = completionTimes.reduce((acc, item) => {
      if (!acc[item.service]) {
        acc[item.service] = { total: 0, count: 0 };
      }
      acc[item.service].total += item.days;
      acc[item.service].count += 1;
      return acc;
    }, {});

    const completionTimesData = Object.entries(avgCompletionByService).map(([service, data]: [string, any]) => ({
      service,
      avgDays: Math.round(data.total / data.count)
    }));

    console.log('Analytics processed:', {
      servicePopularity: servicePopularity.length,
      revenueAnalysis: revenueAnalysis.length,
      countyData: countyData.length,
      totalRevenue: revenue
    });

    setAnalytics({
      servicePopularity,
      revenueAnalysis,
      countyData,
      cityData,
      conversionRates,
      monthlyGrowth,
      statusDistribution,
      averageJobValue,
      seasonalTrends,
      completionTimes: completionTimesData,
      topPerformingServices: revenueAnalysis.slice(0, 5)
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4d0a97]"></div>
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    );
  }

  const COLORS = ['#4d0a97', '#a044e3', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business">Business Analytics</TabsTrigger>
          <TabsTrigger value="website">Website Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalJobs}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Completed jobs only</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Job Value</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Math.round(avgJobValue).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Per completed job</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <p className="text-xs text-muted-foreground">Inquiry to completion</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="services" className="space-y-4">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="geographic">Geographic</TabsTrigger>
              <TabsTrigger value="conversion">Conversion</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Popularity</CardTitle>
                    <CardDescription>Distribution of service requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.servicePopularity.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analytics.servicePopularity}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {analytics.servicePopularity.map((entry, index) => (
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
                    <CardTitle>Job Status Distribution</CardTitle>
                    <CardDescription>Current status of all jobs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.statusDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.statusDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#6366f1" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No status data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Service Type</CardTitle>
                    <CardDescription>Total revenue per service</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.revenueAnalysis.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics.revenueAnalysis}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="service" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Revenue']} />
                          <Bar dataKey="revenue" fill="#4d0a97" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-gray-500">
                        No revenue data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Job Value by Service</CardTitle>
                    <CardDescription>Average revenue per job by service type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.averageJobValue.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics.averageJobValue}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="service" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Avg Value']} />
                          <Bar dataKey="avgValue" fill="#a044e3" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-gray-500">
                        No average value data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="geographic" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Jobs by County</CardTitle>
                    <CardDescription>Geographic distribution across NJ counties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.countyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics.countyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="county" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} jobs`, 'Count']} />
                          <Bar dataKey="count" fill="#6366f1" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-gray-500">
                        No county data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Cities</CardTitle>
                    <CardDescription>Jobs by city (top 10)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.cityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics.cityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="city" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} jobs`, 'Count']} />
                          <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-gray-500">
                        No city data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="conversion" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                    <CardDescription>From inquiry to completion</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.conversionRates.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics.conversionRates}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="stage" />
                          <YAxis />
                          <Tooltip formatter={(value, name) => [name === 'count' ? `${value} jobs` : `${value}%`, name === 'count' ? 'Count' : 'Rate']} />
                          <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-gray-500">
                        No conversion data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Completion Time</CardTitle>
                    <CardDescription>Days from inquiry to completion by service</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.completionTimes.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics.completionTimes}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="service" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} days`, 'Avg Completion Time']} />
                          <Bar dataKey="avgDays" fill="#ec4899" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-gray-500">
                        No completion time data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Growth Trends</CardTitle>
                    <CardDescription>Jobs and revenue over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.monthlyGrowth.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={analytics.monthlyGrowth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Bar yAxisId="left" dataKey="jobs" fill="#4d0a97" name="Jobs" />
                          <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#a044e3" strokeWidth={3} name="Revenue ($)" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-gray-500">
                        No monthly trend data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Seasonal Trends</CardTitle>
                    <CardDescription>Jobs and revenue by season</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.seasonalTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics.seasonalTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="season" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Bar yAxisId="left" dataKey="jobs" fill="#10b981" name="Jobs" />
                          <Bar yAxisId="right" dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-gray-500">
                        No seasonal data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Services</CardTitle>
                    <CardDescription>By total revenue generated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.topPerformingServices.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.topPerformingServices.map((service, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">{service.service}</div>
                              <div className="text-sm text-gray-600">{service.jobCount} jobs completed</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">${service.revenue.toLocaleString()}</div>
                              <div className="text-sm text-gray-600">Avg: ${service.avgRevenue.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No performance data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Performance Matrix</CardTitle>
                    <CardDescription>Job count vs average value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics.revenueAnalysis.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={analytics.revenueAnalysis}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="service" angle={-45} textAnchor="end" height={100} />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Area yAxisId="left" type="monotone" dataKey="jobCount" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Job Count" />
                          <Line yAxisId="right" type="monotone" dataKey="avgRevenue" stroke="#dc2626" strokeWidth={3} name="Avg Revenue" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-gray-500">
                        No performance matrix data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="website" className="space-y-4">
          <GoogleAnalyticsIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
