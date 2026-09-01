import React, { useState, useEffect, useMemo } from 'react';
import {
  ParsedToken,
  ValidationProfile,
  VerificationInput,
  VerificationResult,
} from '../lib/types/jwt';
import { parseToken } from '../lib/jwt/parser';
import { verifyTokenSignature } from '../lib/jwt/verifier';
import { generateSecurityReport } from '../lib/jwt/validator';
import { TokenInputPanel } from '../components/workbench/TokenInputPanel';
import { ValidationProfilePanel } from '../components/workbench/ValidationProfilePanel';
import { TokenSegmentBar } from '../components/workbench/TokenSegmentBar';
import { JsonInspector } from '../components/workbench/JsonInspector';
import { ClaimTable } from '../components/workbench/ClaimTable';
import { ClaimTimeline } from '../components/workbench/ClaimTimeline';
import { VerificationPanel } from '../components/workbench/VerificationPanel';
import { SecurityReportPanel } from '../components/workbench/SecurityReportPanel';
import { ExplainPanel } from '../components/workbench/ExplainPanel';
import { generateTestToken, generateKeyPair } from '../lib/jwt/generator';

interface WorkbenchPageProps {
  initialToken?: string;
  initialProfile?: ValidationProfile;
}

export const WorkbenchPage: React.FC<WorkbenchPageProps> = ({
  initialToken = '',
  initialProfile,
}) => {
  const [token, setToken] = useState(initialToken);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [rightTab, setRightTab] = useState<'report' | 'verify' | 'explain'>(
    'report'
  );

  const [profile, setProfile] = useState<ValidationProfile>(() => {
    return (
      initialProfile || {
        allowedAlgorithms: [],
        expectedIssuer: '',
        expectedAudience: '',
        requiredClaims: [],
        clockToleranceSeconds: 0,
        currentDifferenceSeconds: 0,
        nowOverrideTimestamp: null,
        redactSensitive: true,
      }
    );
  });

  const [verificationInput, setVerificationInput] = useState<VerificationInput>({
    mode: 'none',
    hmacSecret: '',
    pemPublicKey: '',
    jwkJson: '',
    jwksJson: '',
    jwksUrl: '',
    selectedKid: '',
  });

  const [verificationResult, setVerificationResult] =
    useState<VerificationResult>({
      status: 'not_attempted',
      algorithm: null,
      keyUsed: null,
      errorMessage: null,
      details: null,
    });

  // Parse token locally whenever raw string changes
  const parsedToken: ParsedToken = useMemo(() => {
    return parseToken(token);
  }, [token]);

  // Run signature verification when triggered or input changes
  const runVerification = React.useCallback(async () => {
    const res = await verifyTokenSignature(
      parsedToken,
      verificationInput,
      profile
    );
    setVerificationResult(res);
  }, [parsedToken, verificationInput, profile]);

  useEffect(() => {
    if (verificationInput.mode !== 'none') {
      runVerification();
    } else {
      setVerificationResult({
        status: 'not_attempted',
        algorithm: null,
        keyUsed: null,
        errorMessage: null,
        details: null,
      });
    }
  }, [runVerification, verificationInput.mode]);

  // Generate security report deterministically
  const securityReport = useMemo(() => {
    return generateSecurityReport(parsedToken, verificationResult, profile);
  }, [parsedToken, verificationResult, profile]);

  const handleUpdateProfile = (updated: Partial<ValidationProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateVerificationInput = (
    updated: Partial<VerificationInput>
  ) => {
    setVerificationInput((prev) => ({ ...prev, ...updated }));
  };

  // Safe example token loader
  const handleLoadExample = async (
    exampleType: 'hs256' | 'rs256' | 'expired' | 'jwe'
  ) => {
    if (exampleType === 'hs256') {
      const secret = 'dev-test-secret-key-tokenlens-32bytes!';
      const res = await generateTestToken({
        algorithm: 'HS256',
        claims: {
          iss: 'https://auth.example.com',
          sub: 'usr_dev_12345',
          aud: 'https://api.example.com',
          scope: 'read:profile write:data',
          roles: ['developer', 'admin'],
        },
        secretOrPrivateKey: secret,
        expirationPresetSeconds: 3600,
      });
      setToken(res.token);
      setVerificationInput({
        mode: 'hmac',
        hmacSecret: secret,
        pemPublicKey: '',
        jwkJson: '',
        jwksJson: '',
        jwksUrl: '',
        selectedKid: '',
      });
      setProfile((prev) => ({
        ...prev,
        allowedAlgorithms: ['HS256'],
        expectedIssuer: 'https://auth.example.com',
        expectedAudience: 'https://api.example.com',
      }));
    } else if (exampleType === 'rs256') {
      const pair = await generateKeyPair('RS256');
      const res = await generateTestToken({
        algorithm: 'RS256',
        claims: {
          iss: 'https://id.example.org',
          sub: 'usr_rsa_9988',
          aud: 'https://app.example.org',
        },
        secretOrPrivateKey: pair.privateKeyPem,
        expirationPresetSeconds: 7200,
      });
      setToken(res.token);
      setVerificationInput({
        mode: 'pem',
        hmacSecret: '',
        pemPublicKey: pair.publicKeyPem,
        jwkJson: '',
        jwksJson: '',
        jwksUrl: '',
        selectedKid: '',
      });
      setProfile((prev) => ({
        ...prev,
        allowedAlgorithms: ['RS256'],
        expectedIssuer: 'https://id.example.org',
        expectedAudience: 'https://app.example.org',
      }));
    } else if (exampleType === 'expired') {
      const secret = 'dev-expired-token-secret-key-32b!';
      const nowSec = Math.floor(Date.now() / 1000);
      const res = await generateTestToken({
        algorithm: 'HS256',
        claims: {
          iss: 'https://auth.example.com',
          sub: 'usr_expired_1',
          iat: nowSec - 7200,
          exp: nowSec - 1800, // Expired 30 mins ago
        },
        secretOrPrivateKey: secret,
      });
      setToken(res.token);
      setVerificationInput({
        mode: 'hmac',
        hmacSecret: secret,
        pemPublicKey: '',
        jwkJson: '',
        jwksJson: '',
        jwksUrl: '',
        selectedKid: '',
      });
      setProfile((prev) => ({
        ...prev,
        allowedAlgorithms: ['HS256'],
      }));
    } else if (exampleType === 'jwe') {
      // Safe mock JWE 5-segment token example
      const sampleJwe =
        'eyJhbGciOiJSU0EtT0FFUC0yNTYiLCJlbmMiOiJBMjU2R0NNIn0.MockEncryptedKeySegmentBase64UrlHere.MockIvData123.MockCiphertextContentForEncryptedJwePayloadClaims.MockAuthTagValue99';
      setToken(sampleJwe);
      setVerificationInput((prev) => ({ ...prev, mode: 'none' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Section: Token Input & Segment Navigation */}
      <div className="space-y-4">
        <TokenInputPanel
          token={token}
          onChangeToken={setToken}
          parsedToken={parsedToken}
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onLoadExample={handleLoadExample}
        />

        <TokenSegmentBar
          parsedToken={parsedToken}
          activeSegment={activeSegment}
          onSelectSegment={setActiveSegment}
        />
      </div>

      {/* Main 2-Column Grid: Left 7 cols (Decoded Data & Claims), Right 5 cols (Security Audit, Verification & Policy) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: JSON Inspector, Claim Timeline & Standard Claims Table (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <JsonInspector parsedToken={parsedToken} profile={profile} />

          <ClaimTimeline parsedToken={parsedToken} profile={profile} />

          <ClaimTable parsedToken={parsedToken} profile={profile} />
        </div>

        {/* RIGHT COLUMN: Verification & Security Report Tabs + Validation Policy (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tab Navigation Header */}
          <div className="flex rounded-xl bg-[var(--card-bg-elevated)] p-1 border border-[var(--card-border)] text-xs font-semibold">
            <button
              onClick={() => setRightTab('report')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                rightTab === 'report'
                  ? 'bg-[var(--card-border)] text-[var(--accent)] font-bold shadow-xs border border-[var(--card-hover-border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Security Audit ({securityReport.warningCount + securityReport.reviewCount})
            </button>
            <button
              onClick={() => setRightTab('verify')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                rightTab === 'verify'
                  ? 'bg-[var(--card-border)] text-[var(--accent)] font-bold shadow-xs border border-[var(--card-hover-border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Verification
            </button>
            <button
              onClick={() => setRightTab('explain')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                rightTab === 'explain'
                  ? 'bg-[var(--card-border)] text-[var(--accent)] font-bold shadow-xs border border-[var(--card-hover-border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Explain
            </button>
          </div>

          {/* Active Tab Panel */}
          {rightTab === 'report' && (
            <SecurityReportPanel
              parsedToken={parsedToken}
              report={securityReport}
              profile={profile}
            />
          )}

          {rightTab === 'verify' && (
            <VerificationPanel
              parsedToken={parsedToken}
              verificationInput={verificationInput}
              onChangeInput={handleUpdateVerificationInput}
              verificationResult={verificationResult}
              profile={profile}
              onRunVerify={runVerification}
            />
          )}

          {rightTab === 'explain' && (
            <ExplainPanel report={securityReport} />
          )}

          {/* Validation Profile & Policy Configuration */}
          <ValidationProfilePanel
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        </div>
      </div>
    </div>
  );
};

