import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Percent, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  DollarSign
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    description: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('discount_codes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts((data as unknown) as Discount[] || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load discount codes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDiscount = async () => {
    try {
      setLoading(true);
      
      // Validate input
      if (!newDiscount.code.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Discount code is required.",
        });
        return;
      }

      if (newDiscount.value <= 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Discount value must be greater than 0.",
        });
        return;
      }

      if (newDiscount.type === 'percentage' && newDiscount.value > 100) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Percentage discount cannot exceed 100%.",
        });
        return;
      }

      const { data, error } = await supabase
        .from('discount_codes' as any)
        .insert([{
          code: newDiscount.code.toUpperCase(),
          type: newDiscount.type,
          value: newDiscount.value,
          description: newDiscount.description || null,
          is_active: newDiscount.is_active
        }])
        .select()
        .single();

      if (error) throw error;

      setDiscounts(prev => [(data as unknown) as Discount, ...prev]);
      setNewDiscount({
        code: '',
        type: 'percentage',
        value: 0,
        description: '',
        is_active: true
      });
      setShowAddDialog(false);

      toast({
        title: "Success",
        description: "Discount code created successfully.",
      });
    } catch (error: any) {
      console.error('Error creating discount:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message?.includes('unique constraint') 
          ? "A discount code with this name already exists."
          : "Failed to create discount code.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDiscountStatus = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('discount_codes' as any)
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setDiscounts(prev => prev.map(discount => 
        discount.id === id ? { ...discount, is_active } : discount
      ));

      toast({
        title: "Success",
        description: `Discount code ${is_active ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error updating discount:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update discount code.",
      });
    }
  };

  const deleteDiscount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('discount_codes' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDiscounts(prev => prev.filter(discount => discount.id !== id));

      toast({
        title: "Success",
        description: "Discount code deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete discount code.",
      });
    }
  };

  const formatDiscountValue = (type: string, value: number) => {
    if (type === 'percentage') {
      return `${value}%`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Discount Codes</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage discount codes for the quote system
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Discount Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Discount Code</DialogTitle>
              <DialogDescription>
                Add a new discount code that customers can use during checkout.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Discount Code</Label>
                <Input
                  id="code"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Enter discount code (e.g., SAVE20)"
                  className="uppercase"
                />
              </div>
              <div>
                <Label htmlFor="type">Discount Type</Label>
                <Select 
                  value={newDiscount.type} 
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setNewDiscount(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">
                  Discount Value {newDiscount.type === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  max={newDiscount.type === 'percentage' ? "100" : undefined}
                  value={newDiscount.value}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  placeholder={newDiscount.type === 'percentage' ? "Enter percentage (0-100)" : "Enter dollar amount"}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newDiscount.description}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the discount"
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={createDiscount} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Create Discount
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Percent className="w-5 h-5" />
            <span>Active Discount Codes</span>
          </CardTitle>
          <CardDescription>
            Manage discount codes that can be applied during the quote process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && discounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading discount codes...</p>
            </div>
          ) : discounts.length === 0 ? (
            <div className="text-center py-8">
              <Percent className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No discount codes created yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first discount code to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">{discount.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {discount.type === 'percentage' ? (
                          <><Percent className="w-3 h-3 mr-1" />Percentage</>
                        ) : (
                          <><DollarSign className="w-3 h-3 mr-1" />Fixed</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDiscountValue(discount.type, discount.value)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {discount.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={discount.is_active ? "default" : "secondary"}>
                        {discount.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(discount.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateDiscountStatus(discount.id, !discount.is_active)}
                        >
                          {discount.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDiscount(discount.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountManagement;