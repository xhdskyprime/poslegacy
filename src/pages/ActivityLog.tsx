import { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatDate } from '../utils/format';
import { Search } from 'lucide-react';
import clsx from 'clsx';

const ActivityLog = () => {
  const { activityLogs } = useStore();
  const [search, setSearch] = useState('');

  const filteredLogs = activityLogs.filter((log) =>
    log.userName.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Activity Log</h1>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Cari aktivitas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Waktu</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Aksi</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {log.userName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={clsx(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      {
                        "bg-blue-100 text-blue-800": log.action.includes('Login') || log.action.includes('Logout'),
                        "bg-green-100 text-green-800": log.action.includes('Add'),
                        "bg-yellow-100 text-yellow-800": log.action.includes('Update'),
                        "bg-red-100 text-red-800": log.action.includes('Delete') || log.action.includes('Void'),
                      }
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada aktivitas ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
