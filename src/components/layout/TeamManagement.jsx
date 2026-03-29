import { useState, useCallback, useMemo, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api/client';

// ═══ Extracted Styles (P4) ═══
const S_TITLE = { fontSize: '16px', fontWeight: 600, marginBottom: '16px' };
const S_MEMBER_ROW = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 0', borderBottom: `1px solid ${S.colors.borderFaint}`,
  gap: '12px', flexWrap: 'wrap',
};
const S_MEMBER_INFO = { display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 };
const S_AVATAR = (color) => ({
  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
  background: color, color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, fontSize: '14px',
});
const S_MEMBER_NAME = { fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const S_MEMBER_EMAIL = { fontSize: '12px', color: S.colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const S_INVITE_FORM = {
  padding: '16px', borderRadius: S.radius.md,
  background: S.colors.bgInput, border: `1px solid ${S.colors.border}`,
  marginTop: '16px',
};
const S_FORM_ROW = { display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' };
const S_SELECT = {
  ...styles.input(false), fontSize: '14px', minHeight: '42px',
  appearance: 'none', cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
  paddingRight: '32px',
};
const S_PENDING_HEADER = {
  fontSize: '14px', fontWeight: 600, color: S.colors.textSecondary,
  marginTop: '20px', marginBottom: '10px',
};
const S_PENDING_ROW = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 14px', borderRadius: S.radius.md,
  background: S.colors.bgInput, marginBottom: '8px',
  gap: '12px', flexWrap: 'wrap',
};
const S_EMPTY = {
  padding: '24px', textAlign: 'center', color: S.colors.textMuted,
  fontSize: '13px',
};

// ═══ Role Config (P4) ═══
const ROLE_CONFIG = {
  admin: { label: 'Administrator', color: S.colors.primary },
  buero: { label: 'Büro', color: S.colors.success },
  monteur: { label: 'Monteur', color: S.colors.warning },
};

const getRoleConfig = (role) => ROLE_CONFIG[role] || { label: role, color: S.colors.textMuted };

export const TeamManagement = memo(function TeamManagement() {
  const { user } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('monteur');
  const [sending, setSending] = useState(false);
  const [sentInvites, setSentInvites] = useState([]);
  const [error, setError] = useState('');

  // Current team members — for now show just the logged-in user
  // Full team list will come from GET /api/organization/members in Phase 4 server-side
  const members = useMemo(() => [
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isCurrent: true,
    },
  ], [user]);

  const handleToggleInviteForm = useCallback(() => {
    setShowInviteForm(prev => !prev);
    setError('');
    setInviteEmail('');
    setInviteRole('monteur');
  }, []);

  const handleSendInvite = useCallback(async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      setError('Bitte E-Mail-Adresse eingeben.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ungültige E-Mail-Adresse.');
      return;
    }
    if (members.some(m => m.email === email) || sentInvites.some(i => i.email === email)) {
      setError('Diese E-Mail wurde bereits eingeladen.');
      return;
    }

    setSending(true);
    setError('');
    try {
      await apiFetch('/api/activity', {
        method: 'POST',
        body: JSON.stringify({
          action: 'team.invite',
          entityType: 'invitation',
          details: { email, role: inviteRole },
        }),
      });
    } catch (e) {
      // API may not be ready — still record locally
      console.warn('[TeamManagement] Invite API not available, recorded locally:', e.message);
    }

    setSentInvites(prev => [...prev, {
      id: 'inv-' + Date.now(),
      email,
      role: inviteRole,
      sentAt: new Date().toISOString(),
      status: 'pending',
    }]);
    setInviteEmail('');
    setInviteRole('monteur');
    setShowInviteForm(false);
    setSending(false);
  }, [inviteEmail, inviteRole, members, sentInvites]);

  const handleRevokeInvite = useCallback((id) => {
    setSentInvites(prev => prev.filter(i => i.id !== id));
  }, []);

  return (
    <div style={{ ...styles.card, marginTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ ...S_TITLE, marginBottom: 0 }}>Team</h3>
        <button onClick={handleToggleInviteForm} style={styles.btn('primary', 'sm')}>
          {showInviteForm ? 'Abbrechen' : 'Einladen'}
        </button>
      </div>

      {/* ═══ Invite Form ═══ */}
      {showInviteForm && (
        <div style={S_INVITE_FORM}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Neues Mitglied einladen</div>
          {error && <div style={{ ...styles.fieldError, marginBottom: '10px' }}>{error}</div>}
          <div style={S_FORM_ROW}>
            <div style={{ flex: 2, minWidth: '180px' }}>
              <input
                value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setError(''); }}
                placeholder="E-Mail-Adresse"
                type="email"
                style={{ ...styles.input(!!error), fontSize: '14px', minHeight: '42px' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                style={S_SELECT}
              >
                <option value="admin">Administrator</option>
                <option value="buero">Büro</option>
                <option value="monteur">Monteur</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSendInvite}
            disabled={sending}
            style={{ ...styles.btn('primary'), width: '100%', opacity: sending ? 0.6 : 1 }}
          >
            {sending ? 'Wird gesendet...' : 'Einladung senden'}
          </button>
        </div>
      )}

      {/* ═══ Member List ═══ */}
      <div>
        {members.map(member => {
          const cfg = getRoleConfig(member.role);
          const initials = member.name.split(' ').map(w => w[0]).join('').toUpperCase();
          return (
            <div key={member.id} style={S_MEMBER_ROW}>
              <div style={S_MEMBER_INFO}>
                <div style={S_AVATAR(cfg.color)}>{initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={S_MEMBER_NAME}>
                    {member.name}
                    {member.isCurrent && <span style={{ fontSize: '11px', color: S.colors.textMuted, fontWeight: 400, marginLeft: '6px' }}>(Du)</span>}
                  </div>
                  <div style={S_MEMBER_EMAIL}>{member.email}</div>
                </div>
              </div>
              <span style={styles.badge(cfg.color)}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* ═══ Pending Invitations ═══ */}
      {sentInvites.length > 0 && (
        <>
          <div style={S_PENDING_HEADER}>Ausstehende Einladungen</div>
          {sentInvites.map(inv => {
            const cfg = getRoleConfig(inv.role);
            return (
              <div key={inv.id} style={S_PENDING_ROW}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inv.email}
                  </div>
                  <div style={{ fontSize: '11px', color: S.colors.textMuted }}>
                    Eingeladen am {new Date(inv.sentAt).toLocaleDateString('de-DE')}
                  </div>
                </div>
                <span style={styles.badge(cfg.color)}>{cfg.label}</span>
                <button
                  onClick={() => handleRevokeInvite(inv.id)}
                  style={{ ...styles.btn('ghost', 'sm'), color: S.colors.danger, fontSize: '12px' }}
                >
                  Widerrufen
                </button>
              </div>
            );
          })}
        </>
      )}

      {members.length <= 1 && sentInvites.length === 0 && !showInviteForm && (
        <div style={S_EMPTY}>
          Noch keine weiteren Teammitglieder. Lade Kollegen ein, um gemeinsam zu arbeiten.
        </div>
      )}
    </div>
  );
});

TeamManagement.displayName = 'TeamManagement';
