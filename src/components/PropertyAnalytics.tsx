import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, Users, Clock, MapPin, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';

interface PropertyAnalyticsProps {
  propertyId: string;
  propertyAddress: string;
  onBack: () => void;
}

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  averageTimeSpent: number;
  topReferrers: Array<{ source: string; count: number }>;
  dailyViews: Array<{ date: string; views: number }>;
  deviceTypes: Array<{ device: string; count: number }>;
  geographicData: Array<{ location: string; count: number }>;
}

const PropertyAnalytics = ({ propertyId, propertyAddress, onBack }: PropertyAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['property-analytics', propertyId, timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Fetch showcase page views
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'showcase_page_view')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .or(`event_data->>property_id.eq.${propertyId},page_path.like.%/showcase/%`);

      if (error) throw error;

      // Process the data
      const propertyEvents = events.filter(event => 
        (event.event_data as any)?.property_id === propertyId ||
        event.page_path?.includes(propertyId)
      );

      // Calculate metrics
      const totalViews = propertyEvents.length;
      const uniqueVisitors = new Set(propertyEvents.map(e => e.session_id)).size;
      
      // Daily views
      const dailyViewsMap = new Map<string, number>();
      propertyEvents.forEach(event => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        dailyViewsMap.set(date, (dailyViewsMap.get(date) || 0) + 1);
      });

      const dailyViews = Array.from(dailyViewsMap.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top referrers (mock data for now)
      const topReferrers = [
        { source: 'Direct', count: Math.floor(totalViews * 0.4) },
        { source: 'Google', count: Math.floor(totalViews * 0.3) },
        { source: 'Social Media', count: Math.floor(totalViews * 0.2) },
        { source: 'Email', count: Math.floor(totalViews * 0.1) }
      ];

      // Device types (mock data)
      const deviceTypes = [
        { device: 'Desktop', count: Math.floor(totalViews * 0.6) },
        { device: 'Mobile', count: Math.floor(totalViews * 0.35) },
        { device: 'Tablet', count: Math.floor(totalViews * 0.05) }
      ];

      const analytics: AnalyticsData = {
        totalViews,
        uniqueVisitors,
        averageTimeSpent: 145, // seconds, mock data
        topReferrers,
        dailyViews,
        deviceTypes,
        geographicData: [] // Could implement with IP geolocation
      };

      return analytics;
    },
  });

  const COLORS = ['#4d0a97', '#a044e3', '#8b5fbf', '#b87dd1'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>
          <div>
            <h2 className="text-2xl font-semibold">Property Analytics</h2>
            <p className="text-muted-foreground">{propertyAddress}</p>
          </div>
        </div>
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Property Analytics</h2>
          <p className="text-muted-foreground">{propertyAddress}</p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        <Button 
          variant={timeRange === '7d' ? 'default' : 'outline'}
          onClick={() => setTimeRange('7d')}
        >
          Last 7 Days
        </Button>
        <Button 
          variant={timeRange === '30d' ? 'default' : 'outline'}
          onClick={() => setTimeRange('30d')}
        >
          Last 30 Days
        </Button>
        <Button 
          variant={timeRange === '90d' ? 'default' : 'outline'}
          onClick={() => setTimeRange('90d')}
        >
          Last 90 Days
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalViews || 0}</div>
            <Badge variant="outline" className="mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Showcase page visits
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.uniqueVisitors || 0}</div>
            <Badge variant="outline" className="mt-1">
              Individual people
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((analyticsData?.averageTimeSpent || 0) / 60)}m {(analyticsData?.averageTimeSpent || 0) % 60}s
            </div>
            <Badge variant="outline" className="mt-1">
              Per session
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.totalViews ? Math.round((analyticsData.uniqueVisitors / analyticsData.totalViews) * 100) : 0}%
            </div>
            <Badge variant="outline" className="mt-1">
              Unique/Total views
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="views" className="space-y-4">
        <TabsList>
          <TabsTrigger value="views">View Trends</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="devices">Device Types</TabsTrigger>
        </TabsList>

        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData?.dailyViews || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="#4d0a97" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData?.topReferrers || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4d0a97" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData?.deviceTypes || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percent }) => `${device} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(analyticsData?.deviceTypes || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyAnalytics;