import React, { useEffect, useState } from 'react';
import type { ValidationReport } from '../../types/validation.types';
import { useValidation } from '../../hooks/useValidation';
import { ValidationBadge } from './ValidationBadge';
import { ValidationIssueCard } from './ValidationIssueCard';
import { SectionStatusGrid } from './SectionStatusGrid';

interface ValidationPanelProps {
  protocolId: string;
  onNavigateToSection?: (sectionNumber: string) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  protocolId,
  onNavigateToSection
}) => {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'sections'>('overview');
  const { validateProtocol, getLatestValidation, loading, error } = useValidation();

  useEffect(() => {
    loadLatestValidation();
  }, [protocolId]);

  const loadLatestValidation = async () => {
    const latest = await getLatestValidation(protocolId);
    setReport(latest);
  };

  const handleValidate = async () => {
    const result = await validateProtocol(protocolId);
    if (result) {
      setReport(result);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Running validation...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Protocol Validation</h2>
            {report && (
              <p className="text-sm text-gray-500 mt-1">
                Last validated: {new Date(report.validationDate).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={handleValidate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Validating...' : 'Validate Now'}
          </button>
        </div>

        {/* Status Summary */}
        {report && (
          <div className="mt-4 flex items-center gap-6">
            <ValidationBadge
              status={report.overallStatus}
              errorCount={report.totalErrors}
              warningCount={report.totalWarnings}
              size="lg"
            />
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-600">Completeness:</span>
                <span className="ml-2 font-bold text-gray-900">
                  {report.completenessScore}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Errors:</span>
                <span className="ml-2 font-bold text-red-600">
                  {report.totalErrors}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Warnings:</span>
                <span className="ml-2 font-bold text-yellow-600">
                  {report.totalWarnings}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!report ? (
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-4">
            No validation results yet. Click "Validate Now" to check protocol compliance.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'issues', label: `Issues (${report?.issues?.length || 0})` },
                { id: 'sections', label: 'Sections' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-gray-900">
                      {report.completenessScore}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Completeness</div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${report.completenessScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">
                      {report.totalErrors}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Blocking Errors</div>
                    {report.totalErrors > 0 && (
                      <p className="text-xs text-red-600 mt-2">
                        Must be fixed before finalization
                      </p>
                    )}
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {report.totalWarnings}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Warnings</div>
                    {report.totalWarnings > 0 && (
                      <p className="text-xs text-yellow-600 mt-2">
                        Recommended improvements
                      </p>
                    )}
                  </div>
                </div>

                {report?.issues && report.issues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Recent Issues
                    </h3>
                    {report.issues.slice(0, 3).map((issue, index) => (
                      <ValidationIssueCard
                        key={index}
                        issue={issue}
                        onNavigate={onNavigateToSection}
                      />
                    ))}
                    {report?.issues && report.issues.length > 3 && (
                      <button
                        onClick={() => setActiveTab('issues')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-2"
                      >
                        View all {report.issues.length} issues →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'issues' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    All Validation Issues ({report?.issues?.length || 0})
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Resolve blocking errors before submitting protocol for review
                  </p>
                </div>

                {!report?.issues || report.issues.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-5xl">✅</span>
                    <p className="text-lg font-semibold text-gray-900 mt-4">
                      No issues found!
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Your protocol meets all validation requirements
                    </p>
                  </div>
                ) : (
                  report.issues.map((issue, index) => (
                    <ValidationIssueCard
                      key={index}
                      issue={issue}
                      onNavigate={onNavigateToSection}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'sections' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Section Status</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Click on a section to navigate and resolve issues
                  </p>
                </div>
                {report?.sectionStatus && (
                  <SectionStatusGrid
                    sections={report.sectionStatus}
                    onSectionClick={onNavigateToSection}
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
