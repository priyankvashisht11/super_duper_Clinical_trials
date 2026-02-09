import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Protocol {
  id: string;
  sponsorProtocolIdentifier: string;
  fullTitle: string;
  shortTitle?: string;
  protocolVersion: string;
  protocolStatus?: string;
  trialPhase?: string;
  indication?: string;
  completenessPercentage?: number;
  updatedAt: string;
}

export const ProtocolListPage: React.FC = () => {
  const navigate = useNavigate();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/protocols');
      if (!response.ok) {
        throw new Error('Failed to load protocols');
      }
      const data = await response.json();
      setProtocols(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    // For now, navigate to first protocol or show create dialog
    navigate('/protocols/new');
  };

  const handleOpenProtocol = (id: string) => {
    navigate(`/protocols/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading protocols...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Protocols</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Protocols
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your clinical trial protocols</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <span className="text-2xl">+</span>
                <span>Create New Protocol</span>
              </span>
            </button>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-blue-600">{protocols.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Protocols</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-green-600">
                {protocols.filter(p => (p.completenessPercentage || 0) >= 90).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Ready for Review</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-yellow-600">
                {protocols.filter(p => (p.completenessPercentage || 0) >= 40 && (p.completenessPercentage || 0) < 90).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">In Progress</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold text-gray-600">
                {protocols.filter(p => (p.completenessPercentage || 0) < 40).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Draft</div>
            </div>
          </div>
        </div>

        {/* Protocols Grid */}
        {protocols.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <div className="text-8xl mb-6">📋</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No Protocols Yet</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Get started by creating your first clinical trial protocol
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Create Your First Protocol
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {protocols.map((protocol) => {
              const completeness = protocol.completenessPercentage || 0;
              const getStatusColor = () => {
                if (completeness >= 90) return 'from-green-500 to-emerald-500';
                if (completeness >= 70) return 'from-blue-500 to-cyan-500';
                if (completeness >= 40) return 'from-yellow-500 to-orange-500';
                return 'from-gray-400 to-gray-500';
              };
              
              return (
                <div
                  key={protocol.id}
                  onClick={() => handleOpenProtocol(protocol.id)}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 hover:-translate-y-1"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {protocol.sponsorProtocolIdentifier}
                    </span>
                    {protocol.protocolStatus && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {protocol.protocolStatus}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {protocol.shortTitle || protocol.fullTitle}
                  </h3>

                  {/* Details */}
                  <div className="space-y-2 mb-5">
                    {protocol.trialPhase && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔬</span>
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Phase:</span> {protocol.trialPhase}
                        </p>
                      </div>
                    )}
                    {protocol.indication && (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏥</span>
                        <p className="text-sm text-gray-700 line-clamp-1">
                          <span className="font-semibold">Indication:</span> {protocol.indication}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📄</span>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Version:</span> {protocol.protocolVersion}
                      </p>
                    </div>
                  </div>

                  {/* Completeness Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">Completeness</span>
                      <span className={`text-lg font-bold bg-gradient-to-r ${getStatusColor()} bg-clip-text text-transparent`}>
                        {completeness}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all bg-gradient-to-r ${getStatusColor()} shadow-lg`}
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span>Updated {new Date(protocol.updatedAt).toLocaleDateString()}</span>
                    <span className="text-blue-600 font-semibold group-hover:text-purple-600">Open →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
