import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useRentvestingModel } from '../../hooks/useRentvestingModel';
import RentvestingInputs from './RentvestingInputs';
import RentvestingResults from './RentvestingResults';

export default function RentvestingCalculator() {
  const [inputs, setInputs] = useState({
    salary: 120000,
    savings: 150000,
    propertyPrice: 800000,
    state: 'NSW', // New State Selector
    interestRate: 6.0,
    loanTermYears: 30, // Drives chart duration
    capitalGrowth: 5.0,
    rentalYield: 4.5,
    stampDuty: 0,
    lmi: 0,
    weeklyRent: 650,
    // Detailed Inputs
    annualStrata: 3000,
    annualRates: 2000,
    annualMaintenance: 1500,
    annualInsurance: 1200,
    propertyManagementRate: 6.0, // % of gross rent
    annualDepreciation: 5000, // Paper loss
    
    includeCGTDiscount: true,
    sensitivityInterest: 0,
    sensitivityGrowth: 0,
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    // Handle string values for the state dropdown, numbers for everything else
    const parsedValue = type === 'text' || name === 'state' ? value : parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSliderChange = (name, value) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const { projections, finalYear, winner, difference, finalStampDuty, finalLMI } = useRentvestingModel(inputs);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-20 font-sans text-[#0a192f] animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 bg-[#9e1b32]/10 rounded-full px-4 py-1.5 mb-4 border border-[#9e1b32]/20">
          <Sparkles className="w-4 h-4 text-[#9e1b32]" />
          <span className="text-sm font-bold text-[#9e1b32]">Tax-Adjusted Engine</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#0a192f] via-[#1e2f4b] to-[#9e1b32] bg-clip-text text-transparent pb-2">
          The Rentvesting Validator
        </h1>
        <p className="text-[#64748b] mt-3 text-lg max-w-3xl lg:mx-0 mx-auto">
          We factor in Australian tax brackets, state-based stamp duty, negative gearing, and CGT discounts to reveal your true net wealth projection.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <RentvestingInputs 
          inputs={inputs} 
          handleInputChange={handleInputChange} 
          handleSliderChange={handleSliderChange} 
          finalStampDuty={finalStampDuty} 
          finalLMI={finalLMI} 
        />
        <RentvestingResults 
          inputs={inputs}
          projections={projections} 
          finalYear={finalYear} 
          winner={winner} 
          difference={difference} 
        />
      </div>
    </div>
  );
}