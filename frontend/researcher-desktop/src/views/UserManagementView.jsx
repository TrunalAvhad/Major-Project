import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  KeyRound,
  Filter,
  Search
} from 'lucide-react';

export const UserManagementView = () => {
  const [filterRole, setFilterRole] = useState('all');
  const [usersList, setUsersList] = useState([
    {
      id: 1,
      name: 'Dr. Marcus Vance, M.D., Ph.D.',
      email: 'vance@rad.jhmi.edu',
      role: 'researcher',
      hospital: 'Johns Hopkins Medicine',
      status: 'pending',
      date: '2026-09-17',
      fipsKey: '0x9B8A...F318',
      protocol: 'SEC-792-REQ // Level 3'
    },
    {
      id: 2,
      name: 'Dr. Elena Rostova, M.D.',
      email: 'e.rostova@med.stanford.edu',
      role: 'admin',
      hospital: 'Stanford Medicine AI Lab',
      status: 'approved',
      date: '2025-01-15',
      fipsKey: '0x8839...4029',
      protocol: 'Root Tier-1'
    },
    {
      id: 3,
      name: 'Kenji Sato',
      email: 'sato@kuhp.kyoto-u.ac.jp',
      role: 'hospital_operator',
      hospital: 'Kyoto University Hospital',
      status: 'approved',
      date: '2025-03-22',
      fipsKey: '0x7C8B...DF01',
      protocol: 'Level 4 Infrastructure'
    },
    {
      id: 4,
      name: 'Dr. Lukas Meier',
      email: 'lukas.meier@charite.de',
      role: 'researcher',
      hospital: 'Charité Berlin',
      status: 'approved',
      date: '2025-04-10',
      fipsKey: '0xEC29...990B',
      protocol: 'Level 3 Investigator'
    },
    {
      id: 5,
      name: 'Alexandre Dubois',
      email: 'dubois@curie.fr',
      role: 'researcher',
      hospital: 'Institut Curie',
      status: 'suspended',
      date: '2025-06-05',
      fipsKey: '0x12A4...00CC',
      protocol: 'Suspended (MFA Audit Failure)'
    }
  ]);

  const handleAction = (id, newStatus) => {
    setUsersList(usersList.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
  };

  const filteredUsers = usersList.filter((u) => {
    if (filterRole === 'all') return true;
    return u.role === filterRole;
  });

  return (
    <div style={{ padding: '16px 20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-purple" style={{ fontSize: '9px' }}>ADMIN CONSOLE // MODULE 1 RBAC</span>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>HIPAA §164.308 ENFORCED</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
            Consortium User Management &amp; Role Approvals
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Approve, suspend, or revoke researcher and hospital operator access under cryptographic consensus.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-healthy font-mono" style={{ fontSize: '10px' }}>
            ● Zero-Knowledge Registry Synced
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div className="card">
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>PENDING REVIEW (SEC-792)</span>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--status-warning)', marginTop: '4px' }} className="font-mono">
            {usersList.filter((u) => u.status === 'pending').length} Actionable
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Awaiting IRB verification</div>
        </div>

        <div className="card">
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>ACTIVE RESEARCHERS</span>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--brand-blue)', marginTop: '4px' }} className="font-mono">
            {usersList.filter((u) => u.role === 'researcher' && u.status === 'approved').length} Active
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Level 3 Investigators</div>
        </div>

        <div className="card">
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>HOSPITAL ENCLAVE OPERATORS</span>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--status-healthy)', marginTop: '4px' }} className="font-mono">
            {usersList.filter((u) => u.role === 'hospital_operator' && u.status === 'approved').length} Active
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>On-premise SGX stewards</div>
        </div>

        <div className="card">
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>CONSORTIUM ROOT ADMINS</span>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--status-purple)', marginTop: '4px' }} className="font-mono">
            {usersList.filter((u) => u.role === 'admin').length} Authorized
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Tier-1 Hardware Attested</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'all', label: 'All Users (5)' },
            { id: 'researcher', label: 'Researchers (3)' },
            { id: 'hospital_operator', label: 'Hospital Operators (1)' },
            { id: 'admin', label: 'Consortium Admins (1)' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setFilterRole(r.id)}
              className={`btn ${filterRole === r.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '10px', padding: '4px 8px' }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search users by name, email, NPI..."
          style={{ width: '260px', height: '30px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px', fontSize: '11px', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="fl-table">
          <thead>
            <tr>
              <th>USER NAME &amp; EMAIL</th>
              <th>ASSIGNED ROLE</th>
              <th>SPONSORING HOSPITAL</th>
              <th>HARDWARE FIPS TOKEN</th>
              <th>STATUS</th>
              <th>REGISTERED</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: '600' }}>{u.name}</div>
                  <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{u.email}</div>
                </td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-purple' : u.role === 'researcher' ? 'badge-blue' : 'badge-healthy'}`} style={{ fontSize: '9px' }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>{u.hospital}</td>
                <td>
                  <code className="font-mono" style={{ color: '#38bdf8', fontSize: '10px' }}>{u.fipsKey}</code>
                </td>
                <td>
                  <span className={`badge ${u.status === 'approved' ? 'badge-healthy' : u.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '9px' }}>
                    ● {u.status.toUpperCase()}
                  </span>
                </td>
                <td className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{u.date}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '4px' }}>
                    {u.status === 'pending' ? (
                      <>
                        <button className="btn btn-primary" style={{ fontSize: '10px', padding: '3px 8px' }} onClick={() => handleAction(u.id, 'approved')}>
                          Approve
                        </button>
                        <button className="btn btn-danger" style={{ fontSize: '10px', padding: '3px 8px' }} onClick={() => handleAction(u.id, 'rejected')}>
                          Reject
                        </button>
                      </>
                    ) : u.status === 'approved' ? (
                      <button className="btn btn-secondary" style={{ fontSize: '10px', padding: '3px 8px' }} onClick={() => handleAction(u.id, 'suspended')}>
                        Suspend
                      </button>
                    ) : (
                      <button className="btn btn-secondary" style={{ fontSize: '10px', padding: '3px 8px' }} onClick={() => handleAction(u.id, 'approved')}>
                        Reactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
