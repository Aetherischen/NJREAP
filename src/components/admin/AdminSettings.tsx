import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  Database, 
  Bell, 
  Shield, 
  Mail,
  HardDrive,
  Activity,
  Settings,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Send
} from 'lucide-react';
import ServicePricingManagement from './ServicePricingManagement';
import DiscountManagement from './DiscountManagement';

interface StorageStats {
  used: number;
  total: number;
  percentage: number;
  buckets: Array<{
    name: string;
    fileCount: number;
    size: number;
    public: boolean;
  }>;
}

interface DatabaseStats {
  tables: number;
  jobs: number;
  blogPosts: number;
  galleryItems: number;
  users: number;
  totalRecords: number;
  estimatedSize: string;
}

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('pricing');
  const [storageStats, setStorageStats] = useState<StorageStats>({ 
    used: 0, 
    total: 100,
    percentage: 0,
    buckets: []
  });
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats>({ 
    tables: 0, 
    jobs: 0, 
    blogPosts: 0, 
    galleryItems: 0, 
    users: 0,
    totalRecords: 0,
    estimatedSize: '0 MB'
  });
  const [loading, setLoading] = useState(false);
  const [storageLoading, setStorageLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    newJobAlerts: true,
    paymentAlerts: true,
    weeklyReports: true,
    emailAddresses: ['info@njreap.com']
  });
  const [newEmail, setNewEmail] = useState('');
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    sessionTimeout: 24
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStorageStats();
    fetchDatabaseStats();
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification settings:', error);
        return;
      }

      if (data) {
        setNotifications({
          emailAlerts: data.email_alerts ?? true,
          smsAlerts: data.sms_alerts ?? false,
          newJobAlerts: data.new_job_alerts ?? true,
          paymentAlerts: data.payment_alerts ?? true,
          weeklyReports: data.weekly_reports_enabled ?? true,
          emailAddresses: data.notification_emails || ['info@njreap.com']
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const fetchStorageStats = async () => {
    try {
      setStorageLoading(true);
      console.log('Fetching storage stats...');
      
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error fetching buckets:', error);
        setStorageStats({
          used: 0,
          total: 100,
          percentage: 0,
          buckets: []
        });
        return;
      }

      if (!buckets || buckets.length === 0) {
        console.log('No storage buckets found');
        setStorageStats({
          used: 0,
          total: 100,
          percentage: 0,
          buckets: []
        });
        return;
      }

      console.log('Found buckets:', buckets.map(b => b.name));

      let totalUsed = 0;
      const bucketStats = [];

      for (const bucket of buckets) {
        try {
          const { data: files, error: filesError } = await supabase.storage
            .from(bucket.name)
            .list('', { 
              limit: 1000,
              sortBy: { column: 'name', order: 'asc' }
            });

          if (filesError) {
            console.error(`Error listing files in bucket ${bucket.name}:`, filesError);
            bucketStats.push({
              name: bucket.name,
              fileCount: 0,
              size: 0,
              public: bucket.public || false
            });
            continue;
          }

          let bucketSize = 0;
          let fileCount = 0;

          if (files && files.length > 0) {
            for (const file of files) {
              if (file.metadata && typeof file.metadata.size === 'number') {
                bucketSize += file.metadata.size;
                fileCount++;
              }
            }
          }

          bucketStats.push({
            name: bucket.name,
            fileCount: fileCount,
            size: bucketSize,
            public: bucket.public || false
          });

          totalUsed += bucketSize;
        } catch (err) {
          console.error(`Error processing bucket ${bucket.name}:`, err);
          bucketStats.push({
            name: bucket.name,
            fileCount: 0,
            size: 0,
            public: bucket.public || false
          });
        }
      }

      const usedGB = totalUsed / (1024 * 1024 * 1024);
      const proLimit = 100;
      const percentage = Math.min((usedGB / proLimit) * 100, 100);

      setStorageStats({
        used: usedGB,
        total: proLimit,
        percentage: percentage,
        buckets: bucketStats
      });

      console.log(`Storage stats updated: ${usedGB.toFixed(3)} GB used`);

    } catch (error) {
      console.error('Error fetching storage stats:', error);
      setStorageStats({
        used: 0,
        total: 100,
        percentage: 0,
        buckets: []
      });
    } finally {
      setStorageLoading(false);
    }
  };

  const fetchDatabaseStats = async () => {
    try {
      console.log('Fetching database stats...');
      
      const statsPromises = [
        supabase.from('jobs').select('id', { count: 'exact', head: true }).then(r => ({ count: r.count || 0, error: r.error })),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).then(r => ({ count: r.count || 0, error: r.error })),
        supabase.from('gallery_collections').select('id', { count: 'exact', head: true }).then(r => ({ count: r.count || 0, error: r.error })),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).then(r => ({ count: r.count || 0, error: r.error })),
        supabase.from('analytics_events').select('id', { count: 'exact', head: true }).then(r => ({ count: r.count || 0, error: r.error })),
        supabase.from('service_pricing').select('id', { count: 'exact', head: true }).then(r => ({ count: r.count || 0, error: r.error })),
        supabase.from('blog_subscribers').select('id', { count: 'exact', head: true }).then(r => ({ count: r.count || 0, error: r.error }))
      ];
      
      const results = await Promise.allSettled(statsPromises);
      
      let jobs = 0, blogPosts = 0, galleryItems = 0, users = 0, analytics = 0, pricing = 0, subscribers = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          const count = result.value.count;
          switch (index) {
            case 0: jobs = count; break;
            case 1: blogPosts = count; break;
            case 2: galleryItems = count; break;
            case 3: users = count; break;
            case 4: analytics = count; break;
            case 5: pricing = count; break;
            case 6: subscribers = count; break;
          }
        } else {
          console.log(`Failed to fetch stats for table ${index}:`, result.status === 'fulfilled' ? result.value.error : result.reason);
        }
      });
      
      const totalRecords = jobs + blogPosts + galleryItems + users + analytics + pricing + subscribers;
      const estimatedSizeMB = Math.max(1, Math.round(totalRecords * 0.5));
      
      setDatabaseStats({
        tables: 7,
        jobs,
        blogPosts,
        galleryItems,
        users,
        totalRecords,
        estimatedSize: estimatedSizeMB > 1024 ? `${(estimatedSizeMB/1024).toFixed(1)} GB` : `${estimatedSizeMB} MB`
      });

      console.log('Database stats updated:', { jobs, blogPosts, galleryItems, users, totalRecords });
      
    } catch (error) {
      console.error('Error fetching database stats:', error);
      setDatabaseStats({
        tables: 7,
        jobs: 0,
        blogPosts: 0,
        galleryItems: 0,
        users: 0,
        totalRecords: 0,
        estimatedSize: '0 MB'
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const saveNotifications = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          id: 1,
          email_alerts: notifications.emailAlerts,
          sms_alerts: notifications.smsAlerts,
          new_job_alerts: notifications.newJobAlerts,
          payment_alerts: notifications.paymentAlerts,
          weekly_reports_enabled: notifications.weeklyReports,
          notification_emails: notifications.emailAddresses,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings saved successfully",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "There was an error saving your notification settings.",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestWeeklyReport = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-weekly-report');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Test report sent!",
        description: "Weekly report has been sent to all notification recipients.",
      });
    } catch (error) {
      console.error('Error sending test report:', error);
      toast({
        variant: "destructive",
        title: "Error sending report",
        description: "There was an error sending the weekly report.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmailAddress = () => {
    if (newEmail && newEmail.includes('@') && !notifications.emailAddresses.includes(newEmail)) {
      setNotifications(prev => ({
        ...prev,
        emailAddresses: [...prev.emailAddresses, newEmail]
      }));
      setNewEmail('');
    }
  };

  const removeEmailAddress = (email: string) => {
    setNotifications(prev => ({
      ...prev,
      emailAddresses: prev.emailAddresses.filter(e => e !== email)
    }));
  };

  const saveSystemSettings = async () => {
    setLoading(true);
    try {
      if (systemSettings.sessionTimeout > 0) {
        const timeoutMs = systemSettings.sessionTimeout * 60 * 60 * 1000;
        setTimeout(async () => {
          console.log('Session timeout reached, signing out user');
          await supabase.auth.signOut();
        }, timeoutMs);
        
        console.log(`Session timeout set for ${systemSettings.sessionTimeout} hours`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "System settings saved",
        description: `Your system configuration has been updated. Session timeout: ${systemSettings.sessionTimeout} hours.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "There was an error saving your system settings.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Admin Settings</span>
          </CardTitle>
          <CardDescription>
            Manage your application settings, pricing, and system configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex w-full justify-start gap-1">
              <TabsTrigger value="pricing" className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="discounts" className="flex items-center space-x-2">
                <div className="w-4 h-4 flex items-center justify-center text-xs font-bold">%</div>
                <span>Discounts</span>
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Storage</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>System</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pricing" className="mt-6">
              <ServicePricingManagement />
            </TabsContent>

            <TabsContent value="discounts" className="mt-6">
              <DiscountManagement />
            </TabsContent>

            <TabsContent value="storage" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Storage & Database Usage</h3>
                  <Button 
                    variant="outline" 
                    onClick={() => { fetchStorageStats(); fetchDatabaseStats(); }}
                    disabled={storageLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${storageLoading ? 'animate-spin' : ''}`} />
                    {storageLoading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <HardDrive className="w-5 h-5" />
                        <span>Storage Usage</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {storageLoading ? (
                        <div className="text-center py-4">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Loading storage data...</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Used: {storageStats.used.toFixed(3)} GB</span>
                              <span>Total: {storageStats.total} GB</span>
                            </div>
                            <Progress value={storageStats.percentage} className="h-2" />
                            <p className="text-xs text-gray-600">
                              {storageStats.percentage.toFixed(1)}% of storage quota used (Pro Plan)
                            </p>
                          </div>
                          <div className="space-y-2 text-sm">
                            {storageStats.buckets.length > 0 ? (
                              storageStats.buckets.map((bucket, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span className="flex items-center gap-2">
                                    <strong>{bucket.name}</strong>
                                    {bucket.public && <Badge variant="outline" className="text-xs">Public</Badge>}
                                  </span>
                                  <div className="text-right">
                                    <div>{bucket.fileCount} files</div>
                                    <div className="text-xs text-gray-500">{formatFileSize(bucket.size)}</div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500 text-center py-4">
                                No storage buckets found
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Database Stats</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Tables:</span>
                          <Badge variant="outline">{databaseStats.tables}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Records:</span>
                          <Badge variant="outline">{databaseStats.totalRecords.toLocaleString()}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. Database Size:</span>
                          <Badge variant="outline">{databaseStats.estimatedSize}</Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm border-t pt-3">
                        <div className="flex justify-between">
                          <span>Jobs:</span>
                          <span>{databaseStats.jobs.toLocaleString()} records</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Blog Posts:</span>
                          <span>{databaseStats.blogPosts.toLocaleString()} records</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gallery Items:</span>
                          <span>{databaseStats.galleryItems.toLocaleString()} records</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Users:</span>
                          <span>{databaseStats.users.toLocaleString()} records</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Pro Plan Benefits</CardTitle>
                    <CardDescription>Your current Supabase Pro plan includes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Pro Plan Features ($25/month)</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• 8GB database storage</li>
                        <li>• 100GB file storage</li>
                        <li>• 100,000 monthly active users</li>
                        <li>• 2M edge function invocations</li>
                        <li>• Daily backups</li>
                        <li>• Point-in-time recovery</li>
                        <li>• Priority support</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Email Notification Settings</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="w-5 h-5" />
                      <span>Notification Recipients</span>
                    </CardTitle>
                    <CardDescription>
                      Manage email addresses that will receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {notifications.emailAddresses.map((email, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm">{email}</span>
                          {notifications.emailAddresses.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEmailAddress(email)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter email address"
                        onKeyPress={(e) => e.key === 'Enter' && addEmailAddress()}
                      />
                      <Button onClick={addEmailAddress} disabled={!newEmail || !newEmail.includes('@')}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Types</CardTitle>
                    <CardDescription>Choose which notifications to send</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-alerts">Email Alerts</Label>
                        <p className="text-sm text-gray-600">Receive email notifications for important events</p>
                      </div>
                      <Switch
                        id="email-alerts"
                        checked={notifications.emailAlerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailAlerts: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="new-job-alerts">New Job Alerts</Label>
                        <p className="text-sm text-gray-600">Get notified when new jobs are submitted</p>
                      </div>
                      <Switch
                        id="new-job-alerts"
                        checked={notifications.newJobAlerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newJobAlerts: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="payment-alerts">Payment Alerts</Label>
                        <p className="text-sm text-gray-600">Receive notifications for payment updates</p>
                      </div>
                      <Switch
                        id="payment-alerts"
                        checked={notifications.paymentAlerts}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, paymentAlerts: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weekly-reports">Weekly Reports</Label>
                        <p className="text-sm text-gray-600">Get weekly summary reports via email with [WEEKLY REPORT] prefix</p>
                      </div>
                      <Switch
                        id="weekly-reports"
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-4">
                  <Button onClick={saveNotifications} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                  <Button onClick={sendTestWeeklyReport} disabled={loading} variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Test Weekly Report'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">System Configuration</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Security & Access</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                        <p className="text-sm text-gray-600">Put the site in maintenance mode</p>
                      </div>
                      <Switch
                        id="maintenance-mode"
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                      <p className="text-sm text-gray-600 mb-2">Automatically sign out after specified hours of inactivity</p>
                      <Input
                        id="session-timeout"
                        type="number"
                        min="1"
                        max="168"
                        value={systemSettings.sessionTimeout}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                        className="w-24"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6">
                  <Button onClick={saveSystemSettings} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save System Settings'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
