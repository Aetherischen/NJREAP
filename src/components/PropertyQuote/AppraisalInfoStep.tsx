import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Plus, Minus } from 'lucide-react';
import { QuoteFormData } from './PropertyQuoteModal';

interface IntendedUser {
  name: string;
  email: string;
}

interface AppraisalInfoStepProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  propertyData?: any;
  selectedDate?: Date | null;
}

const AppraisalInfoStep: React.FC<AppraisalInfoStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
  propertyData,
  selectedDate
}) => {
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [intendedUsers, setIntendedUsers] = useState<IntendedUser[]>([
    {
      name: formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : '',
      email: formData.email || '',
    },
  ]);

  // Initialize with contact info from previous steps
  useEffect(() => {
    const fullName = formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : '';
    setIntendedUsers(prev => {
      const updated = [...prev];
      if (updated.length === 0) {
        updated.push({ name: fullName, email: formData.email || '' });
      } else {
        // Only update if empty to preserve user edits
        if (!updated[0].name && fullName) {
          updated[0].name = fullName;
        }
        if (!updated[0].email && formData.email) {
          updated[0].email = formData.email;
        }
      }
      return updated;
    });
  }, [formData.firstName, formData.lastName, formData.email]);

  const updateField = (field: string, value: any) => {
    updateFormData({ [field]: value });
    // Clear validation error when user updates field
    setValidationErrors((prev: any) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const updateIntendedUser = (index: number, field: keyof IntendedUser, value: string) => {
    const updatedUsers = [...intendedUsers];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setIntendedUsers(updatedUsers);
    // Clear validation error
    setValidationErrors((prev: any) => ({
      ...prev,
      intendedUsers: {
        ...prev.intendedUsers,
        [index]: {
          ...prev.intendedUsers?.[index],
          [field]: undefined,
        },
      },
    }));
  };

  const addIntendedUser = () => {
    if (intendedUsers.length < 5) {
      setIntendedUsers([...intendedUsers, { name: '', email: '' }]);
    }
  };

  const removeIntendedUser = (index: number) => {
    if (index > 0) {
      const updatedUsers = intendedUsers.filter((_, i) => i !== index);
      setIntendedUsers(updatedUsers);
    }
  };

  const getDateOfValueType = () => {
    if (!formData.appraisalEffectiveDate) {
      return 'Please set effective date above';
    }

    const effectiveDate = new Date(formData.appraisalEffectiveDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    effectiveDate.setHours(0, 0, 0, 0);

    // If effective date is before today
    if (effectiveDate < today) {
      return 'Retrospective Date';
    }

    // If we have an inspection date, use it for the range logic
    if (selectedDate) {
      const inspectionDate = new Date(selectedDate);
      inspectionDate.setHours(0, 0, 0, 0);

      // If effective date is from today through inspection date
      if (effectiveDate >= today && effectiveDate <= inspectionDate) {
        return 'Current Date';
      }

      // If effective date is after inspection date
      if (effectiveDate > inspectionDate) {
        return 'Prospective Date';
      }
    }

    // Fallback: if no inspection date set, consider today+ as current
    if (effectiveDate >= today) {
      return 'Current Date';
    }

    return 'Current Date';
  };

  const validateForm = () => {
    const errors: any = {};

    if (!formData.appraisalPropertyType) {
      errors.propertyType = 'Property type is required';
    }

    if (!formData.appraisalIntendedUse) {
      errors.intendedUse = 'Intended use is required';
    }

    // If "Other" is selected, validate the description field
    if (formData.appraisalIntendedUse === 'Other') {
      if (!formData.appraisalOtherDescription || formData.appraisalOtherDescription.trim() === '') {
        errors.otherDescription = 'Please describe the intended use';
      }
    }

    if (!formData.appraisalEffectiveDate) {
      errors.effectiveDate = 'Effective date is required';
    }

    // Fix: Check the actual field value, ensure it's not empty and not just the placeholder
    const reportOption = formData.appraisalReportOption;
    if (!reportOption || reportOption.trim() === '' || reportOption === 'Select report option') {
      errors.reportOption = 'Report option is required';
    }

    // Validate intended users
    const userErrors: any = {};
    intendedUsers.forEach((user, index) => {
      if (index === 0) {
        // First user is required
        if (!user.name) {
          userErrors[index] = { ...userErrors[index], name: 'Name is required' };
        }
        if (!user.email) {
          userErrors[index] = { ...userErrors[index], email: 'Email is required' };
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
          userErrors[index] = { ...userErrors[index], email: 'Please enter a valid email address' };
        }
      } else {
        // Additional users: if name is provided, email is required
        if (user.name && !user.email) {
          userErrors[index] = { ...userErrors[index], email: 'Email is required when name is provided' };
        } else if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
          userErrors[index] = { ...userErrors[index], email: 'Please enter a valid email address' };
        }
      }
    });

    if (Object.keys(userErrors).length > 0) {
      errors.intendedUsers = userErrors;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    // Update form data with intended users before validation
    updateFormData({ appraisalIntendedUsers: JSON.stringify(intendedUsers) });
    
    if (validateForm()) {
      onNext();
    }
  };

  const handleIntendedUseChange = (value: string) => {
    updateField("appraisalIntendedUse", value);
    // Clear the other description if not selecting "Other"
    if (value !== 'Other') {
      updateField("appraisalOtherDescription", "");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Appraisal Information</h2>
        <p className="text-gray-600">
          Please provide additional details for your appraisal request.
        </p>
      </div>

      <TooltipProvider>
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Subject Property */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="subjectProperty">Subject Property *</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>
                    This field identifies the specific property that will be
                    appraised. It includes the address and relevant details
                    about the property that were selected when you requested the
                    appraisal service.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="subjectProperty"
              value={propertyData?.address || "Property address not available"}
              className="bg-gray-50"
              readOnly
            />
          </div>

          {/* Two-column grid for Property Type, Interest Appraised, Intended Use, Type of Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Property Type *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p>
                        <strong>Single-Family Home:</strong> A standalone
                        residential building meant for one family.
                      </p>
                      <p>
                        <strong>Condominium:</strong> An individually owned unit
                        within a larger building or complex.
                      </p>
                      <p>
                        <strong>Townhouse:</strong> A multi-story residential
                        property that shares one or more walls with adjacent
                        properties.
                      </p>
                      <p>
                        <strong>Duplex/Triplex/Fourplex:</strong> Multi-family
                        properties with two, three, or four separate units
                        within one building.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={formData.appraisalPropertyType || ""}
                onValueChange={(value) => updateField("appraisalPropertyType", value)}
              >
                <SelectTrigger
                  className={validationErrors.propertyType ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single-Family Home">Single-Family Home</SelectItem>
                  <SelectItem value="Condominium">Condominium</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Duplex">Duplex</SelectItem>
                  <SelectItem value="Triplex">Triplex</SelectItem>
                  <SelectItem value="Fourplex">Fourplex</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.propertyType && (
                <p className="text-red-500 text-sm">
                  Property type is required
                </p>
              )}
            </div>

            {/* Interest Appraised */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Interest Appraised *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p>
                        <strong>Fee Simple:</strong> Complete ownership of the
                        property, free of any other interests. Typically
                        owner-occupied.
                      </p>
                      <p>
                        <strong>Leased Fee:</strong> Interest held by landlord
                        with right to receive rent under lease agreement.
                      </p>
                      <p>
                        <strong>Leasehold:</strong> Interest held by tenant with
                        right to use property for specified term.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={formData.appraisalInterestAppraised || "Fee Simple – Most Common"}
                onValueChange={(value) => updateField("appraisalInterestAppraised", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fee Simple – Most Common">
                    Fee Simple – Most Common
                  </SelectItem>
                  <SelectItem value="Leased Fee">Leased Fee</SelectItem>
                  <SelectItem value="Leasehold">Leasehold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Intended Use */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Intended Use *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>
                      This field describes the purpose of the appraisal. The
                      intended use determines how the appraisal will be
                      utilized, such as for financing, tax assessment, estate
                      planning, or property sale.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={formData.appraisalIntendedUse || ""}
                onValueChange={handleIntendedUseChange}
              >
                <SelectTrigger
                  className={validationErrors.intendedUse ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select intended use" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Purchase">Purchase</SelectItem>
                  <SelectItem value="Refinance">Refinance</SelectItem>
                  <SelectItem value="Estate">Estate</SelectItem>
                  <SelectItem value="Divorce">Divorce</SelectItem>
                  <SelectItem value="Litigation">Litigation</SelectItem>
                  <SelectItem value="Tax Appeals">Tax Appeals</SelectItem>
                  <SelectItem value="Gift Tax">Gift Tax</SelectItem>
                  <SelectItem value="Pre-Listing">Pre-Listing</SelectItem>
                  <SelectItem value="Relocation">Relocation</SelectItem>
                  <SelectItem value="Bankruptcy">Bankruptcy</SelectItem>
                  <SelectItem value="PMI Removal">PMI Removal</SelectItem>
                  <SelectItem value="Charitable Donation">Charitable Donation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.intendedUse && (
                <p className="text-red-500 text-sm">Intended use is required</p>
              )}
            </div>

            {/* Type of Value */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Type of Value *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p>
                        <strong>Market Value:</strong> The estimated amount for
                        which the property should exchange between a willing
                        buyer and seller.
                      </p>
                      <p>
                        <strong>Investment Value:</strong> The value to a
                        particular investor based on individual requirements.
                      </p>
                      <p>
                        <strong>Insurable Value:</strong> The value for
                        insurance purposes.
                      </p>
                      <p>
                        <strong>Liquidation Value:</strong> The estimated amount
                        in a forced sale situation.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={formData.appraisalTypeOfValue || "Market Value – Most Common"}
                onValueChange={(value) => updateField("appraisalTypeOfValue", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Market Value – Most Common">
                    Market Value – Most Common
                  </SelectItem>
                  <SelectItem value="Investment Value">Investment Value</SelectItem>
                  <SelectItem value="Insurable Value">Insurable Value</SelectItem>
                  <SelectItem value="Liquidation Value">Liquidation Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Other Description Field - Only show if "Other" is selected */}
          {formData.appraisalIntendedUse === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="otherDescription">Please Describe *</Label>
              <Input
                id="otherDescription"
                value={formData.appraisalOtherDescription || ""}
                onChange={(e) => updateField("appraisalOtherDescription", e.target.value)}
                placeholder="Please describe the intended use for this appraisal"
                className={validationErrors.otherDescription ? "border-red-500" : ""}
              />
              {validationErrors.otherDescription && (
                <p className="text-red-500 text-sm">
                  {validationErrors.otherDescription}
                </p>
              )}
            </div>
          )}

          {/* Intended User(s) - Full Width */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label>Intended User(s) *</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>
                    Identify the individuals or entities who will rely on the
                    appraisal report. This could include the client, a lender, a
                    buyer, legal representatives, or any other party involved in
                    the transaction.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="space-y-3">
              {intendedUsers.map((user, index) => (
                <div key={index} className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Input
                        placeholder="Name"
                        value={user.name}
                        onChange={(e) => updateIntendedUser(index, "name", e.target.value)}
                        className={validationErrors.intendedUsers?.[index]?.name ? "border-red-500" : ""}
                      />
                      {validationErrors.intendedUsers?.[index]?.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.intendedUsers[index].name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Email"
                        type="email"
                        value={user.email}
                        onChange={(e) => updateIntendedUser(index, "email", e.target.value)}
                        className={validationErrors.intendedUsers?.[index]?.email ? "border-red-500" : ""}
                      />
                      {/* Remove button (only for additional users, not the first one) */}
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeIntendedUser(index)}
                          className="px-3 flex-shrink-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* First user indicator */}
                  {index === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Primary contact (from Step 1) - cannot be removed
                    </p>
                  )}

                  {validationErrors.intendedUsers?.[index]?.email && (
                    <div className="mt-1">
                      <p className="text-red-500 text-sm">
                        {validationErrors.intendedUsers[index].email}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {intendedUsers.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIntendedUser}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              )}
            </div>
          </div>

          {/* Date Fields - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Effective Date of Value */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Effective Date of Value *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>
                      Specify the date on which the appraisal's value is
                      effective. This can be current, past, or future date
                      depending on the appraisal needs.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="date"
                value={formData.appraisalEffectiveDate || ""}
                onChange={(e) => updateField("appraisalEffectiveDate", e.target.value)}
                className={validationErrors.effectiveDate ? "border-red-500" : ""}
              />
              {validationErrors.effectiveDate && (
                <p className="text-red-500 text-sm">
                  Effective date is required
                </p>
              )}
            </div>

            {/* Date of Value Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Date of Value Type</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p>Auto-calculated based on the effective date:</p>
                      <p>
                        <strong>Retrospective Date:</strong> Before today
                      </p>
                      <p>
                        <strong>Current Date:</strong> Today through inspection date
                      </p>
                      <p>
                        <strong>Prospective Date:</strong> After inspection date
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                value={getDateOfValueType()}
                className="bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Report Option */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Report Option *</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <div className="space-y-2">
                    <p>
                      <strong>Narrative Report:</strong> A comprehensive report
                      with detailed analysis and supporting data.
                    </p>
                    <p>
                      <strong>Restricted Report:</strong> A brief report
                      intended for specific use by the client only.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.appraisalReportOption || ""}
              onValueChange={(value) => updateField("appraisalReportOption", value)}
            >
              <SelectTrigger
                className={`max-w-md ${validationErrors.reportOption ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select report option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Narrative Report – Most Common">
                  Narrative Report – Most Common
                </SelectItem>
                <SelectItem value="Restricted Report">
                  Restricted Report
                </SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.reportOption && (
              <p className="text-red-500 text-sm">Report option is required</p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={formData.appraisalAdditionalNotes || ""}
              onChange={(e) => updateField("appraisalAdditionalNotes", e.target.value)}
              placeholder="Please provide any further details or notes you might have, including any renovations made or other pertinent information."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
      </TooltipProvider>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default AppraisalInfoStep;
