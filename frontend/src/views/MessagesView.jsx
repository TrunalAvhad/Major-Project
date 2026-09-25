import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Lock,
  Send,
  Shield,
  FileCheck,
  CheckCircle,
  Paperclip,
  Phone,
  Terminal,
  Download,
  AlertTriangle,
  Cpu
} from 'lucide-react';

export const MessagesView = () => {
  const { currentUser } = useApp();
  const [activeChannel, setActiveChannel] = useState('kyoto');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'CONSORTIUM MONITOR AGENT',
      role: 'DAEMON-v4.2',
      time: '09:15:12 UTC',
      isBot: true,
      text: '[AUTOMATED EVENT EVT-90408] Local gradients from node enc-kyoto-02 flagged during pre-aggregation sanity checks. Calculated L2-norm: 17.4428 (Threshold: 15.0000). Multi-Krum Remediation: Clipped weights to consensus median (Applied).'
    },
    {
      id: 2,
      sender: 'Kenji Sato',
      role: 'Kyoto Enclave Lead',
      time: '09:22:04 UTC',
      isBot: false,
      text: 'Checking local logs now. We had an edge GPU driver update last night on one of our NVIDIA A100 SXM4 boxes which caused a slight float precision divergence on the 3D UNet bottleneck layer. Calibrating local optimizer now.',
      sub: 'Enclave hardware temperature nominal (42°C). Model weights isolated in AMD SEV enclave.'
    },
    {
      id: 3,
      sender: 'Dr. Elena Rostova (You)',
      role: 'Lead Investigator',
      time: '09:30:18 UTC',
      isMe: true,
      text: 'Thanks Kenji. Please ensure the local clipping parameter C=1.0 is strictly maintained in your client config before Round 15 begins. We cannot afford privacy budget bleed.',
      sig: 'Signed: RSA-4096 (Stanford Med Root) • Ledger Seq #140,892'
    },
    {
      id: 4,
      sender: 'Kenji Sato',
      role: 'Kyoto Enclave Lead',
      time: '09:34:41 UTC',
      isBot: false,
      text: 'Confirmed. We re-verified the local PyTorch Docker enclave hash and tested batch size 32 with standard differential privacy Laplacian noise. Ready for Round 15 synchronization.',
      attachment: 'config-verification-sha256.json (4.2 KB)'
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'Dr. Elena Rostova (You)',
      role: 'Lead Investigator',
      time: new Date().toISOString().substring(11, 19) + ' UTC',
      isMe: true,
      text: inputText,
      sig: 'Signed: RSA-4096 (Stanford Med Root) • Ledger Seq #140,893'
    };
    setMessages([...messages, newMsg]);
    setInputText('');
  };

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '240px 1fr 280px', overflow: 'hidden' }}>
      {/* Left Channel Sidebar */}
      <div style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)' }}>AUDIT-SIGNED FEEDS</span>
            <span className="badge badge-healthy" style={{ fontSize: '8px' }}>mTLS ACTIVE</span>
          </div>

          <div style={{ padding: '8px 10px' }}>
            <input
              type="text"
              placeholder="Filter channels, sites, PIs..."
              style={{ width: '100%', height: '26px', background: 'var(--bg-nested)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0 8px', fontSize: '10px', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Consortium Channels */}
          <div style={{ padding: '6px 10px' }}>
            <div style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
              CONSORTIUM CHANNELS
            </div>
            {['# general-orchestration', '# pulmo-3d-trial-irb', '# byzantine-triage', '# hardware-enclaves'].map((ch, i) => (
              <div key={i} style={{ padding: '5px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span>{ch}</span>
                {i === 1 && <span className="badge badge-purple" style={{ fontSize: '8px' }}>IRB</span>}
                {i === 2 && <span className="pulse-dot danger" />}
              </div>
            ))}
          </div>

          {/* Direct Site Dispatch */}
          <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border-subtle)', marginTop: '6px' }}>
            <div style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
              DIRECT SITE DISPATCH (5 Connected)
            </div>
            {[
              { id: 'charite', name: 'Charité Berlin', pi: 'Dr. Lukas Meier (PI)', badge: '1', note: 'Rnd 14 ✔' },
              { id: 'kyoto', name: 'Kyoto Univ Hospital', pi: 'Kenji Sato (Admin)', badge: '1', note: 'Grad Norm' },
              { id: 'jhmi', name: 'Johns Hopkins Med', pi: 'Sarah Chen (AI Lead)', note: 'Ready Rnd 15' },
              { id: 'mayo', name: 'Mayo Clinic Rochester', pi: 'Dr. Robert Vance', note: 'PACS Synced' },
              { id: 'mgh', name: 'Mass General Brigham', pi: 'Elena Rostova / Lead', note: 'Origin' },
            ].map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveChannel(s.id)}
                style={{
                  padding: '7px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  background: activeChannel === s.id ? 'var(--bg-card)' : 'transparent',
                  borderLeft: activeChannel === s.id ? '2px solid var(--brand-blue)' : '2px solid transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ color: activeChannel === s.id ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeChannel === s.id ? '600' : '400' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{s.pi}</div>
                </div>
                {s.badge && (
                  <span className="badge badge-blue" style={{ fontSize: '8px' }}>{s.badge}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '10px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-nested)', fontSize: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>LEDGER SINK:</span>
            <span style={{ color: 'var(--status-healthy)' }}>SYNCED</span>
          </div>
          <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Dual-Signature HIPAA Enclave
          </div>
        </div>
      </div>

      {/* Middle Chat Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-canvas)' }}>
        {/* Chat Header */}
        <div style={{
          height: '46px',
          background: 'var(--bg-subcanvas)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-dot healthy" />
            <strong style={{ fontSize: '13px' }}>Kyoto Univ Hospital (enc-kyoto-02)</strong>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>UTC+9</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary" style={{ fontSize: '10px' }}>
              <Terminal size={11} />
              <span>Inspect Telemetry</span>
            </button>
            <button className="btn btn-primary" style={{ fontSize: '10px' }}>
              <Phone size={11} />
              <span>Call Secure Bridge</span>
            </button>
          </div>
        </div>

        {/* Legal Notice */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.06)',
          borderBottom: '1px solid var(--status-warning-border)',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: 'var(--text-secondary)'
        }}>
          <div>
            <strong style={{ color: 'var(--status-warning)' }}>LEGAL NOTICE:</strong> Communications in consortium channels are cryptographically signed and archived to immutable HIPAA/GDPR ledger. Do NOT transmit unencrypted PHI or raw DICOM UIDs.
          </div>
          <span className="font-mono" style={{ color: 'var(--text-muted)' }}>AUDIT ID: FL-MSG-8849</span>
        </div>

        {/* Messages Stream */}
        <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.isMe ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span style={{ fontWeight: '600', color: m.isBot ? 'var(--status-danger)' : m.isMe ? '#60a5fa' : 'var(--text-primary)' }}>
                  {m.sender}
                </span>
                <span>•</span>
                <span>{m.role}</span>
                <span>•</span>
                <span className="font-mono">{m.time}</span>
              </div>

              <div
                style={{
                  maxWidth: '75%',
                  background: m.isBot ? 'var(--status-danger-bg)' : m.isMe ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-card)',
                  border: `1px solid ${m.isBot ? 'var(--status-danger-border)' : m.isMe ? 'rgba(37, 99, 235, 0.35)' : 'var(--border-subtle)'}`,
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.4
                }}
              >
                {m.text}
                {m.sub && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {m.sub}
                  </div>
                )}
                {m.attachment && (
                  <div style={{
                    marginTop: '8px',
                    padding: '6px 8px',
                    background: 'var(--bg-nested)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <span className="font-mono" style={{ color: '#38bdf8' }}>📄 {m.attachment}</span>
                    <Download size={11} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                  </div>
                )}
                {m.sig && (
                  <div className="font-mono" style={{ fontSize: '9px', color: 'var(--status-healthy)', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '4px' }}>
                    ✔ {m.sig}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message Composer */}
        <form onSubmit={handleSendMessage} style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subcanvas)' }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Send an encrypted dispatch to Kyoto Enclave Admin... (Markdown supported)"
            rows="2"
            style={{
              width: '100%',
              background: 'var(--bg-nested)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '5px',
              padding: '8px 10px',
              color: 'var(--text-primary)',
              fontSize: '11px',
              resize: 'none',
              outline: 'none'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-secondary)' }}>
              <input type="checkbox" id="signKey" defaultChecked style={{ accentColor: 'var(--brand-blue)' }} />
              <label htmlFor="signKey" style={{ cursor: 'pointer' }}>
                Sign with Lead Investigator Key (Elena-Rostova-Priv.pem)
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                Direct Link: TLS 1.3 AES-GCM
              </span>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '11px' }}>
                <Send size={11} />
                <span>Send via mTLS</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Right Institution Node Details Drawer */}
      <div style={{
        background: 'var(--bg-nested)',
        borderLeft: '1px solid var(--border-subtle)',
        padding: '14px',
        overflowY: 'auto',
        fontSize: '11px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-secondary)' }}>INSTITUTION ENCLAVE NODE</span>
          <span className="badge badge-healthy" style={{ fontSize: '8px' }}>ACTIVE</span>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <strong style={{ fontSize: '13px', color: '#ffffff' }}>Kyoto Univ Hospital</strong>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Department of Diagnostic Radiology</div>
          <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Timezone: UTC+9 (JST) • Node: enc-kyoto-02</div>
        </div>

        {/* Hardware Specs */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
            CONFIDENTIAL HARDWARE (SEV-SNP)
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '10px' }}>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>2x NVIDIA A100 80GB SXM4</div>
            <div style={{ color: 'var(--text-muted)' }}>Driver: 535.129.03 • CUDA 12.2</div>
            <div style={{ color: 'var(--accent-teal)', marginTop: '4px' }}>AMD SEV-SNP VM Enclave (Host-Blind)</div>
          </div>
        </div>

        {/* Cohort Isolation */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>
            COHORT ISOLATION (AIR-GAPPED)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Local PACS Cohort:</span> <strong style={{ color: 'var(--text-primary)' }}>1,840 Volumes</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Modality:</span> <span>High-Res Chest CT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Raw DICOM Egress:</span> <strong style={{ color: 'var(--status-healthy)' }}>BLOCKED (0.00 KB)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>DP-Budget Used:</span> <span className="font-mono" style={{ color: 'var(--accent-teal)' }}>ε = 0.24 / 0.50</span>
            </div>
          </div>
        </div>

        {/* Stewardship */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            CONSORTIUM STEWARDSHIP
          </div>
          <div style={{ fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>
              <div style={{ fontWeight: '600' }}>Kenji Sato</div>
              <div style={{ color: 'var(--text-muted)' }}>Site Enclave Admin</div>
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>Dr. Yuki Tanaka</div>
              <div style={{ color: 'var(--text-muted)' }}>Hospital IRB Custodian</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
