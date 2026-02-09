import React, { useState } from 'react';
import { ValidationPanel } from '../validation';

export const ValidationDemoPage: React.FC = () => {
  const [protocolId, setProtocolId] = useState('8fbd9dff-c0fc-4130-a60e-1d53b3fe9236');
  const [currentSection, setCurrentSection] = useState('1');

  const handleNavigateToSection = (sectionNumber: string) => {
    setCurrentSection(sectionNumber);
    // Scroll to section or switch tab
    const element = document.getElementById(`section-${sectionNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert(`Navigating to Section ${sectionNumber}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Protocol Validation Demo
          </h1>
          <p className="text-gray-600">
            Test the validation engine with real protocol data
          </p>
          
          {/* Protocol ID Selector */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Test Protocol:
            </label>
            <select
              value={protocolId}
              onChange={(e) => setProtocolId(e.target.value)}
              className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="8fbd9dff-c0fc-4130-a60e-1d53b3fe9236">
                TEST-VAL-001 (Minimal Protocol - 5 errors)
              </option>
              <option value="2418f636-0559-4959-af87-10d377e1d4e5">
                TEST-VAL-002 (Partial Protocol - 5 warnings)
              </option>
              <option value="87e4e51f-c568-45f2-9f41-e003fff16cff">
                TEST-2026-001 (Phase 3 Protocol)
              </option>
            </select>
          </div>
        </div>

        {/* Validation Panel */}
        <ValidationPanel
          protocolId={protocolId}
          onNavigateToSection={handleNavigateToSection}
        />

        {/* Mock Protocol Sections */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Protocol Sections
          </h2>
          <p className="text-gray-600 mb-4">
            Current Section: <span className="font-bold">Section {currentSection}</span>
          </p>
          
          <div className="space-y-4">
            {[
              { num: '1', title: 'Protocol Summary' },
              { num: '2', title: 'Introduction' },
              { num: '3', title: 'Trial Objectives and Estimands' },
              { num: '4', title: 'Trial Design' },
              { num: '5', title: 'Trial Population' },
              { num: '6', title: 'Trial Intervention' },
              { num: '7', title: 'Discontinuation' },
              { num: '8', title: 'Trial Assessments' },
              { num: '9', title: 'Adverse Events' },
              { num: '10', title: 'Statistical Considerations' },
              { num: '11', title: 'Trial Oversight' },
              { num: '12', title: 'Appendices' },
              { num: '13', title: 'Glossary' },
              { num: '14', title: 'References' }
            ].map((section) => (
              <div
                key={section.num}
                id={`section-${section.num}`}
                className={`p-4 border-2 rounded-lg transition-all ${
                  currentSection === section.num
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className="font-bold text-gray-900">
                  Section {section.num}: {section.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Section content would go here...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
