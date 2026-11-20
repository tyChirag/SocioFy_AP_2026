import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  Check,
  X,
  Trash2,
  Loader2,
  AlertCircle,
  Building,
  GraduationCap,
} from 'lucide-react';
import Avatar from '../common/Avatar';
import {
  fetchIncomingRequests,
  fetchSentRequests,
  fetchMyConnections,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelSentRequest,
  removeConnection,
} from '../../Services/connectionServices';

/**
 * ConnectionsManager Component
 * Tabbed panel providing full management of:
 * 1. My Connections (accepted peers)
 * 2. Incoming Requests (pending approval)
 * 3. Sent Requests (pending target response)
 */
const ConnectionsManager = ({ onDataChange }) => {
  const [activeTab, setActiveTab] = useState('connections'); // 'connections' | 'incoming' | 'sent'
  const [connections, setConnections] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [conns, inc, sent] = await Promise.all([
        fetchMyConnections().catch(() => []),
        fetchIncomingRequests().catch(() => []),
        fetchSentRequests().catch(() => []),
      ]);
      setConnections(conns);
      setIncomingRequests(inc);
      setSentRequests(sent);
    } catch (err) {
      console.error('Failed to load connection data:', err);
      setError(err.message || 'Failed to load connections.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (reqId) => {
    setActionId(reqId);
    try {
      await acceptConnectionRequest(reqId);
      await loadData();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert(err.message || 'Failed to accept request.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (reqId) => {
    setActionId(reqId);
    try {
      await rejectConnectionRequest(reqId);
      await loadData();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert(err.message || 'Failed to decline request.');
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (connId) => {
    setActionId(connId);
    try {
      await cancelSentRequest(connId);
      await loadData();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert(err.message || 'Failed to cancel request.');
    } finally {
      setActionId(null);
    }
  };

  const handleRemove = async (connId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    setActionId(connId);
    try {
      await removeConnection(connId);
      await loadData();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert(err.message || 'Failed to remove connection.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('connections')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'connections'
              ? 'bg-[#17233B] text-white'
              : 'text-[#667085] hover:bg-[#F8F9FC] hover:text-[#17233B]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>My Connections</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {connections.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer relative ${
            activeTab === 'incoming'
              ? 'bg-[#17233B] text-white'
              : 'text-[#667085] hover:bg-[#F8F9FC] hover:text-[#17233B]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Incoming Requests</span>
          {incomingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px]">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'sent'
              ? 'bg-[#17233B] text-white'
              : 'text-[#667085] hover:bg-[#F8F9FC] hover:text-[#17233B]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Sent Requests</span>
          <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700 text-[10px]">
            {sentRequests.length}
          </span>
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-4">
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#667085]">
            <Loader2 className="w-6 h-6 animate-spin text-[#5277D9]" />
            <p className="text-xs font-medium">Loading connections...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: My Connections */}
        {!isLoading && !error && activeTab === 'connections' && (
          <div>
            {connections.length === 0 ? (
              <div className="py-10 text-center text-[#667085]">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#17233B]">No connections yet</h4>
                <p className="text-xs mt-1">
                  Connect with students in Explore to build your campus network!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {connections.map(({ connectionId, student }) => (
                  <div
                    key={connectionId}
                    className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F8F9FC] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Link to={`/profile/${student.id}`} className="shrink-0">
                        <Avatar
                          src={student.profileImage}
                          initials={student.fullName.slice(0, 2).toUpperCase()}
                          size="sm"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/profile/${student.id}`}
                          className="text-xs font-bold text-[#17233B] hover:text-[#5277D9] truncate block"
                        >
                          {student.fullName}
                        </Link>
                        <p className="text-[11px] text-[#667085] truncate">
                          {student.collegeName}
                        </p>
                        <p className="text-[10px] text-[#667085] truncate">
                          {student.department}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={actionId === connectionId}
                      onClick={() => handleRemove(connectionId)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Remove connection"
                    >
                      {actionId === connectionId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Requests */}
        {!isLoading && !error && activeTab === 'incoming' && (
          <div>
            {incomingRequests.length === 0 ? (
              <div className="py-10 text-center text-[#667085]">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#17233B]">No pending incoming requests</h4>
                <p className="text-xs mt-1">
                  When other students send you a connection request, they'll show up here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Link to={`/profile/${req.sender.id}`} className="shrink-0">
                        <Avatar
                          src={req.sender.profileImage}
                          initials={req.sender.fullName.slice(0, 2).toUpperCase()}
                          size="md"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/profile/${req.sender.id}`}
                          className="text-xs font-bold text-[#17233B] hover:text-[#5277D9] truncate block"
                        >
                          {req.sender.fullName}
                        </Link>
                        <p className="text-[11px] text-[#667085] truncate">
                          {req.sender.collegeName} • {req.sender.department}
                        </p>
                        {req.sender.bio && (
                          <p className="text-[11px] text-[#475467] line-clamp-1 mt-0.5">
                            "{req.sender.bio}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        disabled={actionId === req.id}
                        onClick={() => handleAccept(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {actionId === req.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Accept</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionId === req.id}
                        onClick={() => handleReject(req.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#475467] text-xs font-semibold flex items-center transition-all cursor-pointer"
                        title="Decline request"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Sent Requests */}
        {!isLoading && !error && activeTab === 'sent' && (
          <div>
            {sentRequests.length === 0 ? (
              <div className="py-10 text-center text-[#667085]">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#17233B]">No pending sent requests</h4>
                <p className="text-xs mt-1">
                  Connection requests you send to other students will be listed here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Link to={`/profile/${req.receiver.id}`} className="shrink-0">
                        <Avatar
                          src={req.receiver.profileImage}
                          initials={req.receiver.fullName.slice(0, 2).toUpperCase()}
                          size="sm"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/profile/${req.receiver.id}`}
                          className="text-xs font-bold text-[#17233B] hover:text-[#5277D9] truncate block"
                        >
                          {req.receiver.fullName}
                        </Link>
                        <p className="text-[11px] text-[#667085] truncate">
                          {req.receiver.collegeName} • {req.receiver.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 hidden sm:inline-block">
                        Pending
                      </span>
                      <button
                        type="button"
                        disabled={actionId === req.id}
                        onClick={() => handleCancel(req.id)}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                      >
                        {actionId === req.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Cancel Request'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsManager;
