'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { employeeSalaryInformationService } from '@/services/employee-salary-information.service';
import { BankInfo, SalaryBreakdown } from '@/types/employee-salary-information';

export default function NewEmployeeSalaryInformationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
  const [stamp, setStamp] = useState({ enabled: false, amount: '' });
  const [transportDeduction, setTransportDeduction] = useState({ enabled: false, amount: '' });
  const [lunchContribution, setLunchContribution] = useState({ enabled: false, amount: '' });
  const [ait, setAit] = useState({ enabled: false, amount: '' });
  const [punishmentAmount, setPunishmentAmount] = useState({ enabled: false, amount: '' });
  const [otherDeduction, setOtherDeduction] = useState({ enabled: false, label: '', amount: '' });

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

  const [salaryBreakdown, setSalaryBreakdown] = useState<SalaryBreakdown[]>([]);
  const [basicMode, setBasicMode] = useState<'formula' | 'percentage'>('formula');

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

  // Salary Breakdown Functions
  const handleBreakdownChange = (id: number, field: keyof SalaryBreakdown, value: string) => {
    setSalaryBreakdown((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // Auto-set percentage when Payroll Head changes
          if (field === 'payrollHead' && updated.type === 'Percentage') {
            const headPercentages: Record<string, string> = {
              'Basic': '50',
              'House Rent': '35',
              'Medical': '5',
              'Transport': '5',
              'Food': '5',
              'Stamp': '0',
            };
            if (headPercentages[value]) {
              updated.percentageFormula = headPercentages[value];
            }
          }
          
          return updated;
        }
        return item;
      })
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
        type: 'Percentage',
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

  const recalculateWithFixed = useCallback((gross: number, currentBreakdown: SalaryBreakdown[]) => {
    console.log('recalculateWithFixed called with gross:', gross, 'breakdown:', currentBreakdown);
    
    // Default percentages for each Payroll Head
    const defaultPercentages: Record<string, number> = {
      'Basic': 50,
      'House Rent': 35,
      'Medical': 5,
      'Transport': 5,
      'Food': 5,
      'Stamp': 0,
    };
    
    // Check if Basic uses Formula type
    const basicRow = currentBreakdown.find(row => row.payrollHead === 'Basic');
    const isBasicFormula = basicRow && basicRow.type === 'Formula';
    
    // Step 1: Calculate Medical, Transport, Food first (they are inputs to Basic formula)
    let medicalAmount = 0;
    let transportAmount = 0;
    let foodAmount = 0;
    
    const firstPassBreakdown = currentBreakdown.map((row) => {
      if (row.payrollHead === 'Basic' || row.payrollHead === 'House Rent' || row.payrollHead === 'Stamp') {
        // Skip for now - will calculate after Basic is determined
        return { ...row, amount: '' };
      }
      
      if (row.payrollHead === 'Medical' || row.payrollHead === 'Transport' || row.payrollHead === 'Food') {
        let amount = 0;
        if (row.type === 'Fixed') {
          amount = parseFloat(row.amount) || 0;
        } else {
          // Percentage of Gross
          const pct = parseFloat(row.percentageFormula) || defaultPercentages[row.payrollHead] || 0;
          amount = gross * (pct / 100);
        }
        
        if (row.payrollHead === 'Medical') medicalAmount = amount;
        if (row.payrollHead === 'Transport') transportAmount = amount;
        if (row.payrollHead === 'Food') foodAmount = amount;
        
        return {
          ...row,
          amount: amount.toFixed(2),
          percentageFormula: row.type === 'Fixed' ? row.percentageFormula : (parseFloat(row.percentageFormula) || defaultPercentages[row.payrollHead] || 0).toString(),
        };
      }
      
      return { ...row };
    });
    
    console.log('Step 1 - Medical:', medicalAmount, 'Transport:', transportAmount, 'Food:', foodAmount);

    // Step 2: Calculate Basic
    let basicAmount = 0;
    let remainingAfterBasic = 0;
    
    if (basicRow) {
      if (basicRow.type === 'Formula') {
        // Formula: Basic = (Gross - Medical - Transport - Food) / 1.5
        basicAmount = (gross - medicalAmount - transportAmount - foodAmount) / 1.5;
        console.log('Formula Basic:', basicAmount);
      } else if (basicRow.type === 'Fixed') {
        basicAmount = parseFloat(basicRow.amount) || 0;
      } else {
        // Percentage of Gross
        const pct = parseFloat(basicRow.percentageFormula) || defaultPercentages['Basic'] || 0;
        basicAmount = gross * (pct / 100);
      }
      
      remainingAfterBasic = gross - medicalAmount - transportAmount - foodAmount - basicAmount;
      console.log('Remaining after Basic:', remainingAfterBasic);
      
      // Update Basic row
      const basicIndex = firstPassBreakdown.findIndex(row => row.payrollHead === 'Basic');
      if (basicIndex >= 0) {
        firstPassBreakdown[basicIndex] = {
          ...firstPassBreakdown[basicIndex],
          amount: basicAmount.toFixed(2),
          percentageFormula: basicRow.type === 'Formula' ? 'Formula' : (parseFloat(basicRow.percentageFormula) || defaultPercentages['Basic'] || 0).toString(),
        };
      }
    }

    // Step 3: When Basic is Formula, House Rent = Basic / 2
    const finalBreakdown = firstPassBreakdown.map((row) => {
      if (row.payrollHead === 'House Rent') {
        if (row.type === 'Fixed') {
          return { ...row, amount: (parseFloat(row.amount) || 0).toFixed(2) };
        } else if (isBasicFormula) {
          // When Basic is Formula, House Rent = Basic / 2
          const amount = basicAmount / 2;
          return {
            ...row,
            amount: amount.toFixed(2),
            percentageFormula: 'Basic/2',
          };
        } else {
          // Normal percentage of Gross
          const pct = parseFloat(row.percentageFormula) || defaultPercentages['House Rent'] || 0;
          const amount = gross * (pct / 100);
          return {
            ...row,
            amount: amount.toFixed(2),
            percentageFormula: pct.toString(),
          };
        }
      } else if (row.payrollHead === 'Stamp') {
        if (row.type === 'Fixed') {
          return { ...row, amount: (parseFloat(row.amount) || 0).toFixed(2) };
        } else if (isBasicFormula) {
          // Stamp is 0 when Basic is Formula
          return {
            ...row,
            amount: '0.00',
            percentageFormula: '0',
          };
        } else {
          // Normal percentage of Gross
          const pct = parseFloat(row.percentageFormula) || defaultPercentages['Stamp'] || 0;
          const amount = gross * (pct / 100);
          return {
            ...row,
            amount: amount.toFixed(2),
            percentageFormula: pct.toString(),
          };
        }
      }
      return row;
    });

    console.log('Final breakdown:', finalBreakdown);
    setSalaryBreakdown(finalBreakdown);
  }, [setSalaryBreakdown]);

  const calculateSalaryStructure = useCallback(() => {
    const gross = parseFloat(grossSalary);
    console.log('Calculate clicked, gross salary:', gross);
    if (isNaN(gross) || gross <= 0) {
      alert('Please enter a valid Gross Salary');
      return;
    }

    // If no existing breakdown, create default structure
    if (salaryBreakdown.length === 0) {
      console.log('Creating new breakdown...');
      const targetStructure = [
        { head: 'Basic', pct: 50 },
        { head: 'House Rent', pct: 35 },
        { head: 'Medical', pct: 5 },
        { head: 'Food', pct: 10 },
      ];

      const newBreakdown: SalaryBreakdown[] = targetStructure.map((item, index) => ({
        id: index + 1,
        payrollHead: item.head,
        type: 'Percentage',
        percentageFormula: item.pct.toString(),
        baseHead: 'Gross Salary',
        amount: (gross * (item.pct / 100)).toFixed(2),
        sequence: (index + 1).toString(),
      }));

      setSalaryBreakdown(newBreakdown);
    } else {
      console.log('Recalculating with fixed amounts...', salaryBreakdown);
      // Recalculate with Fixed amounts preserved
      recalculateWithFixed(gross, salaryBreakdown);
    }
  }, [grossSalary, salaryBreakdown, recalculateWithFixed]);

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
    if (stamp.enabled && stamp.amount) {
      total += parseFloat(stamp.amount) || 0;
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

        // Validate that House Rent is positive
        if (houseRentAmount < 0) {
          alert(`Warning: Gross salary (${gross}) is too low for 50% Basic + Fixed allowances (${totalFixed}). House Rent would be negative.`);
        }
      } else {
        // Formula mode: Auto-balanced (Basic = remaining / 1.5)
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

      if (stamp.enabled && stamp.amount) {
        baseStructure.push({
          id: nextId++,
          payrollHead: 'Stamp',
          type: 'Fixed',
          percentageFormula: '',
          baseHead: 'Gross Salary',
          amount: (-parseFloat(stamp.amount)).toFixed(2),
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

  const handleSave = async () => {
    if (!empCode.trim()) {
      alert('Emp Code is required');
      return;
    }

    setLoading(true);
    try {
      await employeeSalaryInformationService.create({
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
      console.error('Failed to save:', err);
      alert('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (confirm('Clear all fields?')) {
      setEmpCode('');
      setEmpId('');
      setEmpName('');
      setCategory('');
      setCompany('');
      setLocation('');
      setDivision('');
      setDepartment('');
      setSection('');
      setSubsection('');
      setDesignation('');
      setSGrade('');
      setStSalary('');
      setGrossSalary('');
      setBGross('');
      setCashDisbursement('No');
      setPolicy('');
      setMode('Actual');
      setBankInfos([
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
      setSalaryBreakdown([]);
      setAttendanceBonus({ enabled: false, amount: '' });
      setIncentive({ enabled: false, amount: '' });
      setOtherAddition({ enabled: false, label: '', amount: '' });
      setProvidentFund({ enabled: false, amount: '' });
      setAdvance({ enabled: false, amount: '' });
      setStamp({ enabled: false, amount: '' });
      setTransportDeduction({ enabled: false, amount: '' });
      setLunchContribution({ enabled: false, amount: '' });
      setAit({ enabled: false, amount: '' });
      setPunishmentAmount({ enabled: false, amount: '' });
      setOtherDeduction({ enabled: false, label: '', amount: '' });
    }
  };

  return (
    <div className="fade-in">
      <div className="top-bar mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">Add Employee Salary Information</h4>
          <p className="text-muted mb-0 small">Create new salary record</p>
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
                    id="stamp"
                    checked={stamp.enabled}
                    onChange={(e) => setStamp({ ...stamp, enabled: e.target.checked })}
                  />
                  <label className="form-check-label fw-medium" htmlFor="stamp">
                    Stamp
                  </label>
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={stamp.amount}
                  onChange={(e) => setStamp({ ...stamp, amount: e.target.value })}
                  disabled={!stamp.enabled}
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
                  <th style={{ width: '15%' }}>Type</th>
                  <th style={{ width: '15%' }}>Percentage/Formula</th>
                  <th style={{ width: '20%' }}>Base Head</th>
                  <th style={{ width: '15%' }}>Amount</th>
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
                      <select
                        className="form-select form-select-sm"
                        value={row.payrollHead}
                        onChange={(e) => handleBreakdownChange(row.id || 0, 'payrollHead', e.target.value)}
                      >
                        <option value="">Select Head</option>
                        <option value="Basic">Basic</option>
                        <option value="House Rent">House Rent</option>
                        <option value="Medical">Medical</option>
                        <option value="Transport">Transport</option>
                        <option value="Food">Food</option>
                        <option value="Stamp">Stamp</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={row.type}
                        onChange={(e) => handleBreakdownChange(row.id || 0, 'type', e.target.value)}
                      >
                        <option value="Percentage">Percentage</option>
                        <option value="Formula">Formula</option>
                        <option value="Fixed">Fixed</option>
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
                      <select
                        className="form-select form-select-sm"
                        value={row.baseHead}
                        onChange={(e) => handleBreakdownChange(row.id || 0, 'baseHead', e.target.value)}
                      >
                        <option value="Gross Salary">Gross Salary</option>
                        <option value="Basic">Basic</option>
                        <option value="Medical">Medical</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={row.amount}
                        readOnly={row.type !== 'Fixed'}
                        onChange={(e) => {
                          if (row.type === 'Fixed') {
                            handleBreakdownChange(row.id || 0, 'amount', e.target.value);
                          }
                        }}
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
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-success" onClick={calculateSalaryWithAdditions}>
              <i className="fas fa-calculator me-2"></i>Calculate
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>Save
                </>
              )}
            </button>
            <button className="btn btn-info text-white" disabled={!empCode || loading}>
              <i className="fas fa-edit me-2"></i>Update
            </button>
            <button className="btn btn-danger" disabled={!empCode || loading}>
              <i className="fas fa-trash me-2"></i>Delete
            </button>
            <button className="btn btn-outline-secondary" onClick={handleRefresh} disabled={loading}>
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
