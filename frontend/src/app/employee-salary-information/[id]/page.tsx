'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { employeeSalaryInformationService } from '@/services/employee-salary-information.service';
import { BankInfo, EmployeeSalaryInformation, SalaryBreakdown } from '@/types/employee-salary-information';

export default function EditEmployeeSalaryInformationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [empCode, setEmpCode] = useState('');
  const [empId, setEmpId] = useState('');
  const [empName, setEmpName] = useState('');
  const [category, setCategory] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [division, setDivision] = useState('');
  const [department, setDepartment] = useState('');
  const [section, setSection] = useState('');
  const [subsection, setSubsection] = useState('');
  const [designation, setDesignation] = useState('');

  const [sGrade, setSGrade] = useState('');
  const [stSalary, setStSalary] = useState('');
  const [grossSalary, setGrossSalary] = useState('');
  const [bGross, setBGross] = useState('');
  const [cashDisbursement, setCashDisbursement] = useState('No');
  const [policy, setPolicy] = useState('');
  const [mode, setMode] = useState('Actual');

  // Optional Salary Additions
  const [attendanceBonus, setAttendanceBonus] = useState({ enabled: false, amount: '' });
  const [incentive, setIncentive] = useState({ enabled: false, amount: '' });
  const [otherAddition, setOtherAddition] = useState({ enabled: false, label: '', amount: '' });

  // Optional Deductions
  const [providentFund, setProvidentFund] = useState({ enabled: false, amount: '' });
  const [advance, setAdvance] = useState({ enabled: false, amount: '' });
  const [stampDeduction, setStampDeduction] = useState({ enabled: false, amount: '' });
  const [transportDeduction, setTransportDeduction] = useState({ enabled: false, amount: '' });
  const [lunchContribution, setLunchContribution] = useState({ enabled: false, amount: '' });
  const [ait, setAit] = useState({ enabled: false, amount: '' });
  const [punishmentAmount, setPunishmentAmount] = useState({ enabled: false, amount: '' });
  const [otherDeduction, setOtherDeduction] = useState({ enabled: false, label: '', amount: '' });

  const [salaryBreakdown, setSalaryBreakdown] = useState<SalaryBreakdown[]>([]);
  const [basicMode, setBasicMode] = useState<'formula' | 'percentage'>('formula');

  const [bankInfos, setBankInfos] = useState<BankInfo[]>([
    {
      id: 1,
      salaryBank: '',
      branchName: '',
      accountNo: '',
      salaryAmount: '',
      salaryPeriod: '',
      showTax: 'Yes',
      sequence: '1',
    },
  ]);

  useEffect(() => {
    if (id) {
      loadRecord();
    }
  }, [id]);

  async function loadRecord() {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeSalaryInformationService.getById(Number(id));
      populateForm(data);
    } catch (err: any) {
      console.error('Failed to load record:', err);
      setError(err.message || 'Failed to load record');
    } finally {
      setLoading(false);
    }
  }

  function populateForm(data: EmployeeSalaryInformation) {
    setEmpCode(data.empCode || '');
    setEmpId(data.empId || '');
    setEmpName(data.empName || '');
    setCategory(data.category || '');
    setCompany(data.company || '');
    setLocation(data.location || '');
    setDivision(data.division || '');
    setDepartment(data.department || '');
    setSection(data.section || '');
    setSubsection(data.subsection || '');
    setDesignation(data.designation || '');
    setSGrade(data.sGrade || '');
    setStSalary(data.stSalary || '');
    setGrossSalary(data.grossSalary || '');
    setBGross(data.bGross || '');
    setCashDisbursement(data.cashDisbursement || 'No');
    setPolicy(data.policy || '');
    setMode(data.mode || 'Actual');
    
    // Load optional additions if available
    if (data.salaryBreakdown) {
      const attendanceRow = data.salaryBreakdown.find(row => row.payrollHead === 'Attendance Bonus');
      if (attendanceRow) {
        setAttendanceBonus({ enabled: true, amount: attendanceRow.amount || '' });
      } else {
        setAttendanceBonus({ enabled: false, amount: '' });
      }
      
      const incentiveRow = data.salaryBreakdown.find(row => row.payrollHead === 'Incentive');
      if (incentiveRow) {
        setIncentive({ enabled: true, amount: incentiveRow.amount || '' });
      } else {
        setIncentive({ enabled: false, amount: '' });
      }
      
      const otherRow = data.salaryBreakdown.find(row => row.payrollHead.startsWith('Other') || 
        (!['Attendance Bonus', 'Incentive', 'Provident Fund', 'Advance', 'Stamp', 'Transport Deduction', 
           'Lunch Contribution', 'AIT', 'Punishment Amount'].includes(row.payrollHead) && 
         parseFloat(row.amount || '0') > 0));
      if (otherRow) {
        setOtherAddition({ enabled: true, label: otherRow.payrollHead, amount: otherRow.amount || '' });
      } else {
        setOtherAddition({ enabled: false, label: '', amount: '' });
      }

      // Load optional deductions if available (stored as negative amounts or specific payroll heads)
      const pfRow = data.salaryBreakdown.find(row => row.payrollHead === 'Provident Fund');
      if (pfRow) {
        setProvidentFund({ enabled: true, amount: Math.abs(parseFloat(pfRow.amount || '0')).toString() });
      } else {
        setProvidentFund({ enabled: false, amount: '' });
      }

      const advanceRow = data.salaryBreakdown.find(row => row.payrollHead === 'Advance');
      if (advanceRow) {
        setAdvance({ enabled: true, amount: Math.abs(parseFloat(advanceRow.amount || '0')).toString() });
      } else {
        setAdvance({ enabled: false, amount: '' });
      }

      const stampRow = data.salaryBreakdown.find(row => row.payrollHead === 'Stamp');
      if (stampRow) {
        setStampDeduction({ enabled: true, amount: Math.abs(parseFloat(stampRow.amount || '0')).toString() });
      } else {
        setStampDeduction({ enabled: false, amount: '' });
      }

      const transportDedRow = data.salaryBreakdown.find(row => row.payrollHead === 'Transport Deduction');
      if (transportDedRow) {
        setTransportDeduction({ enabled: true, amount: Math.abs(parseFloat(transportDedRow.amount || '0')).toString() });
      } else {
        setTransportDeduction({ enabled: false, amount: '' });
      }

      const lunchRow = data.salaryBreakdown.find(row => row.payrollHead === 'Lunch Contribution');
      if (lunchRow) {
        setLunchContribution({ enabled: true, amount: Math.abs(parseFloat(lunchRow.amount || '0')).toString() });
      } else {
        setLunchContribution({ enabled: false, amount: '' });
      }

      const aitRow = data.salaryBreakdown.find(row => row.payrollHead === 'AIT');
      if (aitRow) {
        setAit({ enabled: true, amount: Math.abs(parseFloat(aitRow.amount || '0')).toString() });
      } else {
        setAit({ enabled: false, amount: '' });
      }

      const punishmentRow = data.salaryBreakdown.find(row => row.payrollHead === 'Punishment Amount');
      if (punishmentRow) {
        setPunishmentAmount({ enabled: true, amount: Math.abs(parseFloat(punishmentRow.amount || '0')).toString() });
      } else {
        setPunishmentAmount({ enabled: false, amount: '' });
      }

      // Find other deduction (negative amount or specific label)
      const otherDedRow = data.salaryBreakdown.find(row => 
        parseFloat(row.amount || '0') < 0 && 
        !['Provident Fund', 'Advance', 'Stamp', 'Transport Deduction', 
          'Lunch Contribution', 'AIT', 'Punishment Amount'].includes(row.payrollHead)
      );
      if (otherDedRow) {
        setOtherDeduction({ enabled: true, label: otherDedRow.payrollHead, amount: Math.abs(parseFloat(otherDedRow.amount || '0')).toString() });
      } else {
        setOtherDeduction({ enabled: false, label: '', amount: '' });
      }
    }
    
    if (data.bankInfos && data.bankInfos.length > 0) {
      setBankInfos(data.bankInfos.map((b, i) => ({
        ...b,
        id: b.id || i + 1,
        sequence: String(b.sequence || (i + 1)),
      })));
    }
    
    if (data.salaryBreakdown && data.salaryBreakdown.length > 0) {
      // Filter out optional additions and deductions from main breakdown
      const coreBreakdown = data.salaryBreakdown.filter(row => 
        !['Attendance Bonus', 'Incentive'].includes(row.payrollHead) &&
        !row.payrollHead.startsWith('Other') &&
        !['Provident Fund', 'Advance', 'Stamp', 'Transport Deduction', 
          'Lunch Contribution', 'AIT', 'Punishment Amount'].includes(row.payrollHead) &&
        parseFloat(row.amount || '0') >= 0
      );
      setSalaryBreakdown(coreBreakdown.map((b, i) => ({
        ...b,
        id: b.id || i + 1,
        sequence: String(b.sequence || (i + 1)),
      })));
    } else {
      setSalaryBreakdown([]);
    }
  }

  const handleBankInfoChange = (id: number, field: keyof BankInfo, value: string) => {
    setBankInfos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addBankInfoRow = () => {
    const newId = bankInfos.length > 0 ? Math.max(...bankInfos.map((b) => b.id || 0)) + 1 : 1;
    const newSequence = (bankInfos.length + 1).toString();
    setBankInfos((prev) => [
      ...prev,
      {
        id: newId,
        salaryBank: '',
        branchName: '',
        accountNo: '',
        salaryAmount: '',
        salaryPeriod: '',
        showTax: 'Yes',
        sequence: newSequence,
      },
    ]);
  };

  const removeBankInfoRow = (id: number) => {
    if (bankInfos.length > 1) {
      setBankInfos((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleUpdate = async () => {
    if (!empCode.trim()) {
      alert('Emp Code is required');
      return;
    }

    setSaving(true);
    try {
      await employeeSalaryInformationService.update(Number(id), {
        empCode,
        empId,
        empName,
        category,
        company,
        location,
        division,
        department,
        section,
        subsection,
        designation,
        sGrade,
        stSalary,
        grossSalary,
        bGross,
        cashDisbursement,
        policy,
        mode,
        bankInfos,
        salaryBreakdown,
      });
      router.push('/employee-salary-information');
    } catch (err: any) {
      console.error('Failed to update:', err);
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    setSaving(true);
    try {
      await employeeSalaryInformationService.delete(Number(id));
      router.push('/employee-salary-information');
    } catch (err: any) {
      console.error('Failed to delete:', err);
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Salary Breakdown Functions
  const handleBreakdownChange = (id: number, field: keyof SalaryBreakdown, value: string) => {
    setSalaryBreakdown((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addBreakdownRow = () => {
    const newId = salaryBreakdown.length > 0 ? Math.max(...salaryBreakdown.map((b) => b.id || 0)) + 1 : 1;
    const newSequence = (salaryBreakdown.length + 1).toString();
    setSalaryBreakdown((prev) => [
      ...prev,
      {
        id: newId,
        payrollHead: '',
        type: 'Fixed',
        percentageFormula: '',
        baseHead: 'Gross Salary',
        amount: '',
        sequence: newSequence,
      },
    ]);
  };

  const removeBreakdownRow = (id: number) => {
    setSalaryBreakdown((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateSalaryWithAdditions = () => {
    const gross = parseFloat(grossSalary || '0');
    if (isNaN(gross) || gross <= 0) {
      alert('Please enter a valid Gross Salary first');
      return;
    }

    // If user has existing breakdown, enforce fixed values and recalculate
    if (salaryBreakdown.length > 0) {
      // Fixed values for Medical, Transport, Food
      const FIXED_MEDICAL = 450;
      const FIXED_TRANSPORT = 1250;
      const FIXED_FOOD = 750;
      const totalFixed = FIXED_MEDICAL + FIXED_TRANSPORT + FIXED_FOOD;

      // Calculate based on mode
      let basicAmount: number;
      let houseRentAmount: number;
      let basicType: string;
      let houseRentType: string;

      if (basicMode === 'percentage') {
        // Percentage mode: Basic = 50% of Gross, House Rent = balance
        basicAmount = gross * 0.50;
        houseRentAmount = gross - basicAmount - totalFixed;
        basicType = 'Percentage';
        houseRentType = 'Calculated';

        if (houseRentAmount < 0) {
          alert(`Warning: Gross salary (${gross}) is too low for 50% Basic + Fixed allowances (${totalFixed}). House Rent would be negative.`);
        }
      } else {
        // Formula mode: Auto-balanced
        const remaining = gross - totalFixed;
        basicAmount = remaining / 1.5;
        houseRentAmount = remaining / 3;
        basicType = 'Formula';
        houseRentType = 'Formula';
      }

      // Calculate percentages based on gross
      const basicPct = ((basicAmount / gross) * 100).toFixed(2);
      const houseRentPct = ((houseRentAmount / gross) * 100).toFixed(2);
      const medicalPct = ((FIXED_MEDICAL / gross) * 100).toFixed(2);
      const transportPct = ((FIXED_TRANSPORT / gross) * 100).toFixed(2);
      const foodPct = ((FIXED_FOOD / gross) * 100).toFixed(2);

      const updatedBreakdown = salaryBreakdown.map((row) => {
        // Enforce fixed values for Medical, Transport, Food
        if (row.payrollHead === 'Medical') {
          return { ...row, type: 'Fixed', amount: FIXED_MEDICAL.toFixed(2), percentageFormula: medicalPct };
        }
        if (row.payrollHead === 'Transport') {
          return { ...row, type: 'Fixed', amount: FIXED_TRANSPORT.toFixed(2), percentageFormula: transportPct };
        }
        if (row.payrollHead === 'Food') {
          return { ...row, type: 'Fixed', amount: FIXED_FOOD.toFixed(2), percentageFormula: foodPct };
        }

        // Recalculate Basic based on mode
        if (row.payrollHead === 'Basic') {
          const pctValue = basicMode === 'percentage' ? '50' : `${basicPct}%`;
          return { ...row, type: basicType, amount: basicAmount.toFixed(2), percentageFormula: pctValue };
        }
        if (row.payrollHead === 'House Rent') {
          const pctValue = basicMode === 'percentage' ? houseRentPct : `${houseRentPct}%`;
          return { ...row, type: houseRentType, amount: houseRentAmount.toFixed(2), percentageFormula: pctValue };
        }

        // For other rows, keep as-is
        return row;
      });
      setSalaryBreakdown(updatedBreakdown);
    } else {
      // Fixed values for Medical, Transport, Food
      const FIXED_MEDICAL = 450;
      const FIXED_TRANSPORT = 1250;
      const FIXED_FOOD = 750;
      const totalFixed = FIXED_MEDICAL + FIXED_TRANSPORT + FIXED_FOOD;

      // Calculate based on mode
      let basicAmount: number;
      let houseRentAmount: number;
      let basicType: string;
      let houseRentType: string;
      let basicPct: string;
      let houseRentPct: string;

      if (basicMode === 'percentage') {
        // Percentage mode: Basic = 50% of Gross, House Rent = balance
        basicAmount = gross * 0.50;
        houseRentAmount = gross - basicAmount - totalFixed;
        basicType = 'Percentage';
        houseRentType = 'Calculated';
        basicPct = '50';
        houseRentPct = ((houseRentAmount / gross) * 100).toFixed(2);

        if (houseRentAmount < 0) {
          alert(`Warning: Gross salary (${gross}) is too low for 50% Basic + Fixed allowances (${totalFixed}).`);
        }
      } else {
        // Formula mode: Auto-balanced
        const remaining = gross - totalFixed;
        basicAmount = remaining / 1.5;
        houseRentAmount = remaining / 3;
        basicType = 'Formula';
        houseRentType = 'Formula';
        basicPct = ((basicAmount / gross) * 100).toFixed(2);
        houseRentPct = ((houseRentAmount / gross) * 100).toFixed(2);
      }

      const medicalPct = ((FIXED_MEDICAL / gross) * 100).toFixed(2);
      const transportPct = ((FIXED_TRANSPORT / gross) * 100).toFixed(2);
      const foodPct = ((FIXED_FOOD / gross) * 100).toFixed(2);

      // Create new default structure with fixed values and calculated percentages
      const baseStructure: SalaryBreakdown[] = [
        { id: 1, payrollHead: 'Basic', type: basicType, percentageFormula: basicPct, baseHead: 'Gross Salary', amount: basicAmount.toFixed(2), sequence: '1' },
        { id: 2, payrollHead: 'House Rent', type: houseRentType, percentageFormula: houseRentPct, baseHead: 'Gross Salary', amount: houseRentAmount.toFixed(2), sequence: '2' },
        { id: 3, payrollHead: 'Medical', type: 'Fixed', percentageFormula: medicalPct, baseHead: 'Gross Salary', amount: FIXED_MEDICAL.toFixed(2), sequence: '3' },
        { id: 4, payrollHead: 'Transport', type: 'Fixed', percentageFormula: transportPct, baseHead: 'Gross Salary', amount: FIXED_TRANSPORT.toFixed(2), sequence: '4' },
        { id: 5, payrollHead: 'Food', type: 'Fixed', percentageFormula: foodPct, baseHead: 'Gross Salary', amount: FIXED_FOOD.toFixed(2), sequence: '5' },
      ];

      let nextId = baseStructure.length + 1;
      let nextSeq = baseStructure.length + 1;

      // Add optional additions if enabled
      if (attendanceBonus.enabled && attendanceBonus.amount) {
        baseStructure.push({
          id: nextId++,
          payrollHead: 'Attendance Bonus',
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: parseFloat(attendanceBonus.amount).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      if (incentive.enabled && incentive.amount) {
        baseStructure.push({
          id: nextId++,
          payrollHead: 'Incentive',
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: parseFloat(incentive.amount).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      if (otherAddition.enabled && otherAddition.amount && otherAddition.label) {
        baseStructure.push({
          id: nextId++,
          payrollHead: otherAddition.label,
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: parseFloat(otherAddition.amount).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      // Add optional deductions if enabled (stored as negative amounts)
      if (providentFund.enabled && providentFund.amount) {
        baseStructure.push({
          id: nextId++,
          payrollHead: 'Provident Fund',
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: (-parseFloat(providentFund.amount)).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      if (advance.enabled && advance.amount) {
        baseStructure.push({
          id: nextId++,
          payrollHead: 'Advance',
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: (-parseFloat(advance.amount)).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      if (stampDeduction.enabled && stampDeduction.amount) {
        baseStructure.push({
          id: nextId++,
          payrollHead: 'Stamp',
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: (-parseFloat(stampDeduction.amount)).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      if (transportDeduction.enabled && transportDeduction.amount) {
        baseStructure.push({
          id: nextId++,
          payrollHead: 'Transport Deduction',
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: (-parseFloat(transportDeduction.amount)).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      if (lunchContribution.enabled && lunchContribution.amount) {
        baseStructure.push({
          id: nextId++,
          payrollHead: 'Lunch Contribution',
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: (-parseFloat(lunchContribution.amount)).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      if (ait.enabled && ait.amount) {
        baseStructure.push({
          id: nextId++,
          payrollHead: 'AIT',
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: (-parseFloat(ait.amount)).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      if (punishmentAmount.enabled && punishmentAmount.amount) {
        baseStructure.push({
          id: nextId++,
          payrollHead: 'Punishment Amount',
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: (-parseFloat(punishmentAmount.amount)).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      if (otherDeduction.enabled && otherDeduction.amount && otherDeduction.label) {
        baseStructure.push({
          id: nextId++,
          payrollHead: otherDeduction.label,
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: (-parseFloat(otherDeduction.amount)).toFixed(2),
          sequence: (nextSeq++).toString(),
        });
      }

      setSalaryBreakdown(baseStructure);
    }
  };

  const getTotalAmount = () => {
    return salaryBreakdown
      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
      .toFixed(2);
  };

  const getTotalWithAdditions = () => {
    const base = parseFloat(grossSalary || '0');
    let total = base;
    if (attendanceBonus.enabled && attendanceBonus.amount) {
      total += parseFloat(attendanceBonus.amount) || 0;
    }
    if (incentive.enabled && incentive.amount) {
      total += parseFloat(incentive.amount) || 0;
    }
    if (otherAddition.enabled && otherAddition.amount) {
      total += parseFloat(otherAddition.amount) || 0;
    }
    return total.toFixed(2);
  };

  const getTotalDeductions = () => {
    let total = 0;
    if (providentFund.enabled && providentFund.amount) {
      total += parseFloat(providentFund.amount) || 0;
    }
    if (advance.enabled && advance.amount) {
      total += parseFloat(advance.amount) || 0;
    }
    if (stampDeduction.enabled && stampDeduction.amount) {
      total += parseFloat(stampDeduction.amount) || 0;
    }
    if (transportDeduction.enabled && transportDeduction.amount) {
      total += parseFloat(transportDeduction.amount) || 0;
    }
    if (lunchContribution.enabled && lunchContribution.amount) {
      total += parseFloat(lunchContribution.amount) || 0;
    }
    if (ait.enabled && ait.amount) {
      total += parseFloat(ait.amount) || 0;
    }
    if (punishmentAmount.enabled && punishmentAmount.amount) {
      total += parseFloat(punishmentAmount.amount) || 0;
    }
    if (otherDeduction.enabled && otherDeduction.amount) {
      total += parseFloat(otherDeduction.amount) || 0;
    }
    return total.toFixed(2);
  };

  const getNetPayable = () => {
    const withAdditions = parseFloat(getTotalWithAdditions());
    const deductions = parseFloat(getTotalDeductions());
    return (withAdditions - deductions).toFixed(2);
  };

  const handleRefresh = () => {
    if (confirm('Reload data?')) {
      loadRecord();
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-60">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading salary information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-60">
        <div className="text-center">
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
          <button className="btn btn-primary mt-3" onClick={() => router.push('/employee-salary-information')}>
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Edit Employee Salary Information</h4>
          <p className="text-muted mb-0 small">Update salary record for Emp Code: {empCode}</p>
        </div>
        <Link href="/employee-salary-information" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i> Back to List
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3 fw-bold text-primary">
            <i className="fas fa-user me-2"></i>Employee Details
          </h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-medium">Emp Code <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="Browse or Write"
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Emp ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="Browse or Write"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Emp Name</label>
              <input
                type="text"
                className="form-control"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="Staff">Staff</option>
                <option value="Worker">Worker</option>
                <option value="Management">Management</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Company</label>
              <select
                className="form-select"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              >
                <option value="">Select Company</option>
                <option value="Skyview Online Ltd.">Skyview Online Ltd.</option>
                <option value="Greenmax Technologies Ltd.">Greenmax Technologies Ltd.</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Location</label>
              <select
                className="form-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Select Location</option>
                <option value="Head Office">Head Office</option>
                <option value="Corporate Office">Corporate Office</option>
                <option value="Branch Office">Branch Office</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Division</label>
              <select
                className="form-select"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
              >
                <option value="">Select Division</option>
                <option value="Accounts & Billing">Accounts & Billing</option>
                <option value="NOC">NOC</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Transmission">Transmission</option>
                <option value="Legal">Legal</option>
                <option value="Call Center & Support">Call Center & Support</option>
                <option value="Maintenance">Maintenance</option>
                <option value="General Administration">General Administration</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Department</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                <option value="Accounts & Billing">Accounts & Billing</option>
                <option value="NOC">NOC</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Transmission">Transmission</option>
                <option value="Legal">Legal</option>
                <option value="Call Center & Support">Call Center & Support</option>
                <option value="Maintenance">Maintenance</option>
                <option value="General Administration">General Administration</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Section</label>
              <select
                className="form-select"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              >
                <option value="">Select Section</option>
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Subsection</label>
              <select
                className="form-select"
                value={subsection}
                onChange={(e) => setSubsection(e.target.value)}
              >
                <option value="">Select Subsection</option>
                <option value="Subsection 1">Subsection 1</option>
                <option value="Subsection 2">Subsection 2</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Designation</label>
              <select
                className="form-select"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="">Select Designation</option>
                <option value="Manager">Manager</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Officer">Officer</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3 fw-bold text-primary">
            <i className="fas fa-money-bill-wave me-2"></i>Salary Information
          </h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-medium">S. Grade</label>
              <input
                type="text"
                className="form-control"
                placeholder="Salary Grade"
                value={sGrade}
                onChange={(e) => setSGrade(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">St. Salary</label>
              <input
                type="text"
                className="form-control"
                placeholder="Standard Salary"
                value={stSalary}
                onChange={(e) => setStSalary(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Gross Salary</label>
              <input
                type="text"
                className="form-control"
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">B Gross</label>
              <input
                type="text"
                className="form-control"
                placeholder="Basic Gross"
                value={bGross}
                onChange={(e) => setBGross(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Cash Disbursement</label>
              <select
                className="form-select"
                value={cashDisbursement}
                onChange={(e) => setCashDisbursement(e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Policy</label>
              <select
                className="form-select"
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
              >
                <option value="">Select Policy</option>
                <option value="Standard 2026">Standard 2026</option>
                <option value="Policy A">Policy A</option>
                <option value="Policy B">Policy B</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-medium">Mode</label>
              <select
                className="form-select"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="Actual">Actual</option>
                <option value="Estimated">Estimated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-primary mb-0">
              <i className="fas fa-university me-2"></i>Bank Information
            </h5>
            <button className="btn btn-outline-primary btn-sm" onClick={addBankInfoRow}>
              <i className="fas fa-plus me-1"></i>Add Row
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '15%' }}>Salary Bank</th>
                  <th style={{ width: '15%' }}>Branch Name</th>
                  <th style={{ width: '15%' }}>Account No</th>
                  <th style={{ width: '15%' }}>Salary Amount</th>
                  <th style={{ width: '12%' }}>Salary Period</th>
                  <th style={{ width: '10%' }}>Show Tax</th>
                  <th style={{ width: '8%' }}>Sequence</th>
                  <th style={{ width: '10%' }} className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bankInfos.map((bank) => (
                  <tr key={bank.id}>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={bank.salaryBank}
                        onChange={(e) => handleBankInfoChange(bank.id || 0, 'salaryBank', e.target.value)}
                      >
                        <option value="">Select Bank</option>
                        <option value="Bank A">Bank A</option>
                        <option value="Bank B">Bank B</option>
                        <option value="Bank C">Bank C</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={bank.branchName}
                        onChange={(e) => handleBankInfoChange(bank.id || 0, 'branchName', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={bank.accountNo}
                        onChange={(e) => handleBankInfoChange(bank.id || 0, 'accountNo', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={bank.salaryAmount}
                        onChange={(e) => handleBankInfoChange(bank.id || 0, 'salaryAmount', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={bank.salaryPeriod}
                        onChange={(e) => handleBankInfoChange(bank.id || 0, 'salaryPeriod', e.target.value)}
                      >
                        <option value="">Select Period</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Bi-weekly">Bi-weekly</option>
                        <option value="Weekly">Weekly</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={bank.showTax}
                        onChange={(e) => handleBankInfoChange(bank.id || 0, 'showTax', e.target.value)}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={bank.sequence}
                        readOnly
                      />
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeBankInfoRow(bank.id || 0)}
                        disabled={bankInfos.length === 1}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Optional Salary Additions */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3 fw-bold text-success">
            <i className="fas fa-plus-circle me-2"></i>Optional Salary Additions
          </h5>
          <p className="text-muted small mb-3">Select optional additions to include in the salary calculation</p>
          
          <div className="row g-3">
            {/* Attendance Bonus */}
            <div className="col-md-4">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="attendanceBonus"
                    checked={attendanceBonus.enabled}
                    onChange={(e) => setAttendanceBonus({ ...attendanceBonus, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="attendanceBonus">
                    Attendance Bonus
                  </label>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={attendanceBonus.amount}
                  onChange={(e) => setAttendanceBonus({ ...attendanceBonus, amount: e.target.value })}
                  disabled={!attendanceBonus.enabled}
                />
              </div>
            </div>

            {/* Incentive */}
            <div className="col-md-4">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="incentive"
                    checked={incentive.enabled}
                    onChange={(e) => setIncentive({ ...incentive, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="incentive">
                    Incentive
                  </label>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={incentive.amount}
                  onChange={(e) => setIncentive({ ...incentive, amount: e.target.value })}
                  disabled={!incentive.enabled}
                />
              </div>
            </div>

            {/* Other Addition */}
            <div className="col-md-4">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="otherAddition"
                    checked={otherAddition.enabled}
                    onChange={(e) => setOtherAddition({ ...otherAddition, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="otherAddition">
                    Other Addition
                  </label>
                </div>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Label (e.g., Performance Bonus)"
                  value={otherAddition.label}
                  onChange={(e) => setOtherAddition({ ...otherAddition, label: e.target.value })}
                  disabled={!otherAddition.enabled}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={otherAddition.amount}
                  onChange={(e) => setOtherAddition({ ...otherAddition, amount: e.target.value })}
                  disabled={!otherAddition.enabled}
                />
              </div>
            </div>
          </div>

          {/* Total Summary */}
          <div className="mt-3 p-3 bg-light rounded">
            <div className="row">
              <div className="col-md-6">
                <span className="text-muted">Base Gross Salary: </span>
                <span className="fw-bold">{parseFloat(grossSalary || '0').toFixed(2)}</span>
              </div>
              <div className="col-md-6 text-md-end">
                <span className="text-muted">Total with Additions: </span>
                <span className="fw-bold text-success fs-5">{getTotalWithAdditions()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Deductions */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3 fw-bold text-danger">
            <i className="fas fa-minus-circle me-2"></i>Optional Deductions
          </h5>
          <p className="text-muted small mb-3">Select optional deductions to subtract from the salary calculation</p>
          
          <div className="row g-3">
            {/* Provident Fund */}
            <div className="col-md-3">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="providentFund"
                    checked={providentFund.enabled}
                    onChange={(e) => setProvidentFund({ ...providentFund, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="providentFund">
                    Provident Fund
                  </label>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={providentFund.amount}
                  onChange={(e) => setProvidentFund({ ...providentFund, amount: e.target.value })}
                  disabled={!providentFund.enabled}
                />
              </div>
            </div>

            {/* Advance */}
            <div className="col-md-3">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="advance"
                    checked={advance.enabled}
                    onChange={(e) => setAdvance({ ...advance, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="advance">
                    Advance
                  </label>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={advance.amount}
                  onChange={(e) => setAdvance({ ...advance, amount: e.target.value })}
                  disabled={!advance.enabled}
                />
              </div>
            </div>

            {/* Stamp */}
            <div className="col-md-3">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="stampDeduction"
                    checked={stampDeduction.enabled}
                    onChange={(e) => setStampDeduction({ ...stampDeduction, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="stampDeduction">
                    Stamp
                  </label>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={stampDeduction.amount}
                  onChange={(e) => setStampDeduction({ ...stampDeduction, amount: e.target.value })}
                  disabled={!stampDeduction.enabled}
                />
              </div>
            </div>

            {/* Transport Deduction */}
            <div className="col-md-3">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="transportDeduction"
                    checked={transportDeduction.enabled}
                    onChange={(e) => setTransportDeduction({ ...transportDeduction, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="transportDeduction">
                    Transport Deduction
                  </label>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={transportDeduction.amount}
                  onChange={(e) => setTransportDeduction({ ...transportDeduction, amount: e.target.value })}
                  disabled={!transportDeduction.enabled}
                />
              </div>
            </div>

            {/* Lunch Contribution */}
            <div className="col-md-3">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="lunchContribution"
                    checked={lunchContribution.enabled}
                    onChange={(e) => setLunchContribution({ ...lunchContribution, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="lunchContribution">
                    Lunch Contribution
                  </label>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={lunchContribution.amount}
                  onChange={(e) => setLunchContribution({ ...lunchContribution, amount: e.target.value })}
                  disabled={!lunchContribution.enabled}
                />
              </div>
            </div>

            {/* AIT */}
            <div className="col-md-3">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="ait"
                    checked={ait.enabled}
                    onChange={(e) => setAit({ ...ait, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="ait">
                    AIT
                  </label>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={ait.amount}
                  onChange={(e) => setAit({ ...ait, amount: e.target.value })}
                  disabled={!ait.enabled}
                />
              </div>
            </div>

            {/* Punishment Amount */}
            <div className="col-md-3">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="punishmentAmount"
                    checked={punishmentAmount.enabled}
                    onChange={(e) => setPunishmentAmount({ ...punishmentAmount, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="punishmentAmount">
                    Punishment Amount
                  </label>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={punishmentAmount.amount}
                  onChange={(e) => setPunishmentAmount({ ...punishmentAmount, amount: e.target.value })}
                  disabled={!punishmentAmount.enabled}
                />
              </div>
            </div>

            {/* Other Deduction */}
            <div className="col-md-3">
              <div className="border rounded p-3">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="otherDeduction"
                    checked={otherDeduction.enabled}
                    onChange={(e) => setOtherDeduction({ ...otherDeduction, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="otherDeduction">
                    Other Deduction
                  </label>
                </div>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Label"
                  value={otherDeduction.label}
                  onChange={(e) => setOtherDeduction({ ...otherDeduction, label: e.target.value })}
                  disabled={!otherDeduction.enabled}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={otherDeduction.amount}
                  onChange={(e) => setOtherDeduction({ ...otherDeduction, amount: e.target.value })}
                  disabled={!otherDeduction.enabled}
                />
              </div>
            </div>
          </div>

          {/* Deductions Summary */}
          <div className="mt-3 p-3 bg-light rounded">
            <div className="row">
              <div className="col-md-4">
                <span className="text-muted">Total with Additions: </span>
                <span className="fw-bold text-success">{getTotalWithAdditions()}</span>
              </div>
              <div className="col-md-4 text-md-center">
                <span className="text-muted">Total Deductions: </span>
                <span className="fw-bold text-danger">{getTotalDeductions()}</span>
              </div>
              <div className="col-md-4 text-md-end">
                <span className="text-muted">Net Payable: </span>
                <span className="fw-bold text-primary fs-5">{getNetPayable()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '4px' }}>
            <h5 className="fw-bold mb-0" style={{ color: '#1976d2' }}>
              <i className="fas fa-calculator me-2"></i>Salary Breakdown
            </h5>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary btn-sm" onClick={addBreakdownRow}>
                <i className="fas fa-plus me-1"></i>Add Row
              </button>
              <button className="btn btn-primary btn-sm" onClick={calculateSalaryWithAdditions}>
                <i className="fas fa-calculator me-1"></i>Calculate
              </button>
            </div>
          </div>
          <div className="mb-3 d-flex align-items-center gap-2">
            <label className="form-label fw-medium mb-0">Basic Calculation:</label>
            <select
              className="form-select form-select-sm w-auto"
              value={basicMode}
              onChange={(e) => setBasicMode(e.target.value as 'formula' | 'percentage')}
            >
              <option value="formula">Formula (Auto-balanced)</option>
              <option value="percentage">Percentage (50% Fixed)</option>
            </select>
            <small className="text-muted">
              {basicMode === 'formula' ? 'Basic = (Gross - Fixed) / 1.5' : 'Basic = Gross × 50%'}
            </small>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '20%' }}>Payroll Head</th>
                  <th style={{ width: '12%' }}>Type</th>
                  <th style={{ width: '15%' }}>Percentage/Formula</th>
                  <th style={{ width: '18%' }}>Base Head</th>
                  <th style={{ width: '12%' }}>Amount</th>
                  <th style={{ width: '8%' }}>Seq</th>
                  <th style={{ width: '7%' }} className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaryBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      Click "Calculate" to generate salary breakdown based on Gross Salary
                    </td>
                  </tr>
                )}
                {salaryBreakdown.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.payrollHead}
                        onChange={(e) => handleBreakdownChange(row.id || 0, 'payrollHead', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={row.type}
                        onChange={(e) => handleBreakdownChange(row.id || 0, 'type', e.target.value)}
                      >
                        <option value="Percentage">Percentage</option>
                        <option value="Fixed">Fixed</option>
                        <option value="Formula">Formula</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.percentageFormula}
                        onChange={(e) => handleBreakdownChange(row.id || 0, 'percentageFormula', e.target.value)}
                        placeholder="e.g., 50"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.baseHead}
                        onChange={(e) => handleBreakdownChange(row.id || 0, 'baseHead', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.amount}
                        onChange={(e) => handleBreakdownChange(row.id || 0, 'amount', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.sequence}
                        readOnly
                      />
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeBreakdownRow(row.id || 0)}
                        title="Delete Row"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {salaryBreakdown.length > 0 && (
                  <tr className="table-active fw-bold">
                    <td colSpan={4} className="text-end">Total Amount:</td>
                    <td>{getTotalAmount()}</td>
                    <td colSpan={2}></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {salaryBreakdown.length > 0 && (
            <div className="mt-3 p-3 bg-light rounded">
              <div className="row align-items-center">
                <div className="col-md-2">
                  <span className="text-muted">Gross Salary: </span>
                  <span className="fw-bold">{parseFloat(grossSalary || '0').toFixed(2)}</span>
                </div>
                <div className="col-md-2 text-center">
                  <span className="text-success">+ {getTotalWithAdditions() !== parseFloat(grossSalary || '0').toFixed(2) ? (parseFloat(getTotalWithAdditions()) - parseFloat(grossSalary || '0')).toFixed(2) : '0.00'}</span>
                  <div className="small text-muted">Additions</div>
                </div>
                <div className="col-md-2 text-center">
                  <span className="text-danger">- {getTotalDeductions()}</span>
                  <div className="small text-muted">Deductions</div>
                </div>
                <div className="col-md-2 text-center">
                  <span className="text-muted">=</span>
                </div>
                <div className="col-md-4 text-md-end">
                  <span className="text-muted">Net Payable: </span>
                  <span className="fw-bold text-primary fs-4">{getNetPayable()}</span>
                </div>
              </div>
              {getTotalAmount() !== getNetPayable() && (
                <div className="mt-2 text-center text-warning small">
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  Breakdown total ({getTotalAmount()}) differs from net payable ({getNetPayable()})
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>Update
                </>
              )}
            </button>
            <button className="btn btn-outline-danger" onClick={handleDelete} disabled={saving}>
              <i className="fas fa-trash-alt me-2"></i>Delete
            </button>
            <button className="btn btn-outline-secondary" onClick={handleRefresh} disabled={saving}>
              <i className="fas fa-sync-alt me-2"></i>Refresh
            </button>
            <Link href="/employee-salary-information" className="btn btn-outline-secondary">
              <i className="fas fa-times me-2"></i>Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
