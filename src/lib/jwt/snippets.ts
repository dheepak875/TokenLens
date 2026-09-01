import { ValidationProfile } from '../types/jwt';

export function generateCodeSnippets(
  profile: ValidationProfile,
  alg: string = 'HS256'
): Record<string, string> {
  const allowedAlgs =
    profile.allowedAlgorithms.length > 0
      ? profile.allowedAlgorithms
      : [alg || 'HS256'];
  const issuer = profile.expectedIssuer || 'https://auth.example.com';
  const audience = profile.expectedAudience || 'https://api.example.com';

  const algsJson = JSON.stringify(allowedAlgs);

  // 1. Node.js (jose)
  const nodejs = `import * as jose from 'jose';

async function verifyTokenSafely(jwtString, secretOrPublicKey) {
  try {
    // 1. Convert secret key (for HMAC) or SPKI PEM key (for RSA/ECDSA)
    const key = typeof secretOrPublicKey === 'string' && "${allowedAlgs[0]}".startsWith('HS')
      ? new TextEncoder().encode(secretOrPublicKey)
      : await jose.importSPKI(secretOrPublicKey, "${allowedAlgs[0]}");

    // 2. Perform verification enforcing strict algorithm allowlist and expected claims
    const { payload, protectedHeader } = await jose.jwtVerify(jwtString, key, {
      algorithms: ${algsJson}, // ALWAYS pin accepted algorithms
      issuer: '${issuer}',     // Explicit issuer validation
      audience: '${audience}', // Explicit audience validation
      clockTolerance: ${profile.clockToleranceSeconds || 0}, // Clock skew tolerance in seconds
    });

    console.log('Token successfully verified for subject:', payload.sub);
    return payload;
  } catch (err) {
    // 3. Handle validation errors safely without swallowing exceptions
    console.error('JWT verification failed:', err.message);
    throw new Error('Unauthorized: Invalid or expired token signature');
  }
}`;

  // 2. Python (PyJWT)
  const python = `import jwt

def verify_token_safely(jwt_string: str, secret_or_public_key: str):
    try:
        # Enforce explicit algorithm allowlist, issuer, and audience
        payload = jwt.decode(
            jwt_string,
            secret_or_public_key,
            algorithms=${JSON.stringify(allowedAlgs)},  # Never accept alg: none
            issuer='${issuer}',
            audience='${audience}',
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
                "require": ["exp", "iss", "aud"]
            }
        )
        print("Token verified for subject:", payload.get("sub"))
        return payload
    except jwt.ExpiredSignatureError:
        print("Error: Token has expired")
        raise PermissionError("Token expired")
    except jwt.InvalidTokenError as e:
        print("Error: Invalid token signature or claim mismatch:", str(e))
        raise PermissionError("Unauthorized")`;

  // 3. Go (golang-jwt/jwt/v5)
  const golang = `package main

import (
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
)

func VerifyTokenSafely(tokenStr string, secret []byte) (jwt.MapClaims, error) {
	// Parse with strict options: algorithm allowlist, issuer, audience
	token, err := jwt.Parse(
		tokenStr,
		func(token *jwt.Token) (interface{}, error) {
			// Explicit algorithm check - reject alg: none and unallowed algorithms
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return secret, nil
		},
		jwt.WithValidMethods([]string{"${allowedAlgs.join('", "')}"}),
		jwt.WithIssuer("${issuer}"),
		jwt.WithAudience("${audience}"),
		jwt.WithExpirationRequired(),
	)

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("token validation failed: %w", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims format")
	}

	return claims, nil
}`;

  // 4. Java (JJWT)
  const java = `import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import javax.crypto.SecretKey;

public class JwtValidator {
    public static Claims verifyTokenSafely(String tokenStr, SecretKey secretKey) {
        try {
            // Configure parser with required claims & algorithm enforcement
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .requireIssuer("${issuer}")
                .requireAudience("${audience}")
                .build()
                .parseSignedClaims(tokenStr)
                .getPayload();

            System.out.println("Token verified for sub: " + claims.getSubject());
            return claims;
        } catch (JwtException e) {
            System.err.println("JWT Verification error: " + e.getMessage());
            throw new SecurityException("Unauthorized token", e);
        }
    }
}`;

  // 5. .NET C# (System.IdentityModel.Tokens.Jwt)
  const dotnet = `using System;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

public class TokenValidator 
{
    public static ClaimsPrincipal VerifyTokenSafely(string tokenStr, string secretKeyStr)
    {
        var handler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(secretKeyStr);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),

            ValidateIssuer = true,
            ValidIssuer = "${issuer}",

            ValidateAudience = true,
            ValidAudience = "${audience}",

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(${profile.clockToleranceSeconds || 0}),

            // Enforce explicit algorithm restrictions
            ValidAlgorithms = new[] { "${allowedAlgs.join('", "')}" }
        };

        try 
        {
            var principal = handler.ValidateToken(tokenStr, validationParameters, out SecurityToken validatedToken);
            return principal;
        } 
        catch (Exception ex)
        {
            Console.WriteLine($"JWT Validation Failed: {ex.Message}");
            throw new UnauthorizedAccessException("Invalid token signature or claim requirement", ex);
        }
    }
}`;

  return {
    'Node.js (jose)': nodejs,
    Python: python,
    Go: golang,
    Java: java,
    '.NET (C#)': dotnet,
  };
}
