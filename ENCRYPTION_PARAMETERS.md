# Comprehensive Encryption Parameters Guide

## Overview

ImageCryptoLab now supports **complete encryption control** with all essential cryptographic parameters. This guide explains each parameter and how to use them correctly.

---

## Encryption Algorithms

### 1. **AES (Advanced Encryption Standard)**
- **Key Sizes:** 128, 192, 256 bits
- **Strengths:**
  - Most secure and widely adopted
  - Recommended for high-security applications
  - Fast hardware support on modern CPUs
  - NIST standard (FIPS 197)
- **Best For:** Production environments, sensitive data
- **Performance:** Excellent

### 2. **DES (Data Encryption Standard)**
- **Key Sizes:** 56 bits (single key)
- **Strengths:**
  - Legacy support
  - Suitable for compatibility
- **Weaknesses:**
  - Weak key size (56 bits)
  - Vulnerable to brute-force attacks
  - **DEPRECATED - avoid for new implementations**
- **Best For:** Legacy systems only
- **Performance:** Fast but insecure

### 3. **Triple DES (3DES/TripleDES)**
- **Key Sizes:** 168 bits (effectively 112 bits due to meet-in-the-middle attack)
- **Strengths:**
  - Better than single DES
  - More secure than DES
  - Still widely supported
- **Weaknesses:**
  - Slower than AES
  - Smaller block size (64 bits) than AES
  - Being phased out
- **Best For:** Legacy systems requiring better security than DES
- **Performance:** Moderate

---

## Cipher Modes

### 1. **CBC (Cipher Block Chaining)** - DEFAULT ⭐
```
Block i encryption depends on: Block i-1 ciphertext
```
- **How it works:** Each plaintext block is XORed with the previous ciphertext block before encryption
- **IV Requirement:** MANDATORY
- **Properties:**
  - Each block depends on all previous blocks
  - Same plaintext produces different ciphertext (due to IV)
  - Best for general-purpose encryption
  - Requires padding
- **Use Case:** Standard choice for most applications
- **Security:** Strong when implemented correctly

### 2. **ECB (Electronic CodeBook)**
```
Block i encryption: E(K, P_i) = C_i
```
- **How it works:** Each plaintext block encrypted independently
- **IV Requirement:** NOT NEEDED
- **Properties:**
  - Deterministic (same plaintext block = same ciphertext)
  - **NOT SECURE** - patterns visible in ciphertext
  - Fast but reveals plaintext patterns
  - Requires padding
- **Use Case:** Legacy systems, never for sensitive data
- **Security:** ⚠️ WEAK - avoid unless necessary for compatibility

### 3. **CFB (Cipher Feedback)**
```
C_i = P_i XOR E(K, C_{i-1})
```
- **How it works:** Creates a stream cipher from block cipher
- **IV Requirement:** MANDATORY
- **Properties:**
  - Can encrypt data smaller than block size
  - No padding required
  - Errors propagate
  - Good for streaming data
- **Use Case:** Streaming applications, real-time communication
- **Security:** Strong, varies with feedback size

### 4. **OFB (Output Feedback)**
```
O_i = E(K, O_{i-1})
C_i = P_i XOR O_i
```
- **How it works:** Generates keystream independent of plaintext
- **IV Requirement:** MANDATORY
- **Properties:**
  - True stream cipher mode
  - No padding required
  - Errors don't propagate
  - Secure, but keystream must not be reused
- **Use Case:** Streaming data, real-time applications
- **Security:** Strong, error detection friendly

### 5. **CTR (Counter)**
```
C_i = P_i XOR E(K, nonce || counter)
```
- **How it works:** Encrypts sequential counter values
- **IV Requirement:** Used as nonce
- **Properties:**
  - True stream cipher
  - Parallelizable
  - Random access
  - No padding required
  - Errors don't propagate
  - Counter must not repeat with same key
- **Use Case:** High-performance encryption, parallel processing
- **Security:** Strong, modern, recommended for new code

---

## Padding Modes

### 1. **PKCS7** - DEFAULT ⭐
- **Method:** Add N bytes of value N to reach block size
- **Example (8-byte block, 5 bytes data):**
  ```
  Data:    01 02 03 04 05
  Padded:  01 02 03 04 05 03 03 03
  ```
- **Properties:**
  - Standard, widely supported
  - Works for block sizes 1-255
  - Secure
  - Reversible
- **Use Case:** Universal choice

### 2. **ANSI X9.23**
- **Method:** Add N bytes of value N, first byte=0
- **Example (8-byte block, 5 bytes data):**
  ```
  Data:    01 02 03 04 05
  Padded:  01 02 03 04 05 00 00 03
  ```
- **Properties:**
  - Similar to PKCS7
  - Slightly different format
  - Less common
- **Use Case:** Legacy systems, specific standards compliance

### 3. **ISO 10126**
- **Method:** Add random bytes, last byte=N (padding length)
- **Example (8-byte block, 5 bytes data):**
  ```
  Data:    01 02 03 04 05
  Padded:  01 02 03 04 05 ?? ?? 03  (? = random bytes)
  ```
- **Properties:**
  - Random padding
  - Obscures message length
  - Slower due to randomness
- **Use Case:** Maximum entropy, high security needs

### 4. **ISO 9797-1**
- **Method:** Add 0x80, then 0x00 bytes to fill
- **Example (8-byte block, 5 bytes data):**
  ```
  Data:    01 02 03 04 05
  Padded:  01 02 03 04 05 80 00 00
  ```
- **Properties:**
  - Standard padding format
  - Single 0x80 byte identifies padding start
  - Efficient
- **Use Case:** Banking, financial systems standards

### 5. **No Padding**
- **Requirement:** Data must be exact multiple of block size
- **Properties:**
  - No overhead
  - Maximum efficiency
  - Manual padding responsibility
  - Error-prone
- **Use Case:** Known block-aligned data, custom padding schemes

---

## Key Parameters

### Key Size (Bits)

| Algorithm | Supported Sizes | Recommendation | Security Level |
|-----------|-----------------|-----------------|-----------------|
| AES       | 128, 192, 256   | 256             | High           |
| DES       | 56              | NOT RECOMMENDED | Low (obsolete) |
| TripleDES | 168             | Moderate        | Medium         |

**Security Implications:**
- **128 bits:** Sufficient for most applications (≈2^128 combinations)
- **192 bits:** Extra safety margin
- **256 bits:** Maximum security, government-grade encryption
- Larger keys = exponentially harder to crack

---

## Initialization Vector (IV)

### Purpose
- Makes identical plaintexts produce different ciphertexts
- Prevents pattern detection in encrypted data
- Required for CBC, CFB, OFB, CTR modes

### Size (Bytes)
- **Default:** 16 bytes (128 bits)
- **Range:** 8-32 bytes
- **For AES:** 16 bytes (fixed block size)
- **For DES:** 8 bytes (DES block size)

### Requirements
1. **Uniqueness:** MUST be unique for every encryption with same key
2. **Randomness:** Must be cryptographically random
3. **Non-reuse:** Never reuse same IV with same key
4. **Transmission:** Can be sent in plaintext with ciphertext

### ImageCryptoLab Implementation
- Generates random IV for every encryption
- Prepends IV to ciphertext (format: `saltHex:ivHex:ciphertextData`)
- Automatically extracts IV during decryption

---

## Salt

### Purpose
- Derives unique keys from same password
- Prevents rainbow table attacks
- Makes precomputed attacks ineffective

### Size (Bytes)
- **Recommended:** 8-16 bytes
- **Default:** 8 bytes
- **Minimum:** 0 bytes (not recommended)
- **Maximum:** 32 bytes
- **Range:** 0-32 bytes (configurable)

### How Salt Works
1. Password + Salt → Key Derivation Function (PBKDF2)
2. Different salts = different keys from same password
3. Makes brute-force attacks require separate computation per salt

### Example
```
Password: "MySecret"
Salt 1: A1B2C3D4  → Key: 9F3E8D7C6B5A4938...
Salt 2: E5F6G7H8  → Key: 2D1C3B4A5E6F7G8H...
```

---

## PBKDF2 (Key Derivation)

### Purpose
- Derives strong encryption key from user password
- Slows down brute-force attacks
- Makes weak passwords more secure

### Iterations
- **Recommended:** 10,000-100,000
- **Default:** 10,000
- **Range:** 1,000-1,000,000
- **Trend:** Increase over time as computers get faster

### How Iterations Work
- Each iteration hashes the password multiple times
- More iterations = slower (both encryption and attacks)
- 10,000 iterations ≈ 10-50ms on modern hardware

### Security Trade-off
```
Iterations = 1,000    → Fast (↓), Weak (↓)
Iterations = 10,000   → Balanced (→), Good (→)
Iterations = 100,000  → Slow (↑), Strong (↑)
Iterations = 1,000,000 → Very Slow (↑↑), Very Strong (↑↑)
```

### Guidelines
- **Web applications:** 10,000-50,000
- **Desktop applications:** 100,000-500,000
- **High security:** 500,000-1,000,000
- **Offline storage:** 1,000,000+ (doesn't need speed)

---

## Output Encoding

### 1. **Base64** - DEFAULT ⭐
```
Input:  0x48 0x65 0x6C 0x6C 0x6F
Output: SGVsbG8=
```
- **Properties:**
  - Text-safe representation
  - ~33% size overhead
  - Can be copied/pasted
  - URL-safe variant available
- **Use Case:** Standard encryption output, storage
- **Supported Characters:** A-Z, a-z, 0-9, +, /, =

### 2. **Hex (Hexadecimal)**
```
Input:  0x48 0x65 0x6C 0x6C 0x6F
Output: 48656C6C6F
```
- **Properties:**
  - Text-safe representation
  - 100% size overhead (2 chars per byte)
  - Easy to read and debug
  - All uppercase/lowercase
- **Use Case:** Debugging, technical inspection
- **Supported Characters:** 0-9, A-F

### 3. **Base32**
```
Input:  0x48 0x65 0x6C 0x6C 0x6F
Output: JBSWY3DPEBLW64TMMQ======
```
- **Properties:**
  - Text-safe representation
  - ~60% size overhead
  - Case-insensitive
  - Fewer confusing characters (no 0/O, 1/I/L)
- **Use Case:** Manual entry, telephonic transmission
- **Supported Characters:** A-Z, 2-7, =

---

## Complete Encryption Workflow

### Encryption Process
1. **Input:** Select image file
2. **Select Parameters:**
   - Algorithm (AES/DES/TripleDES)
   - Key Size (128/192/256)
   - Cipher Mode (CBC/ECB/CFB/OFB/CTR)
   - Padding (PKCS7/ANSI X9.23/ISO 10126/ISO 9797-1/None)
   - IV Size (8-32 bytes)
   - Salt Size (0-32 bytes)
   - PBKDF2 Iterations (1,000-1,000,000)
   - Output Format (Base64/Hex/Base32)
3. **Enter Passphrase:** Strong password/passphrase
4. **Encrypt:** 
   - Generate random salt and IV
   - Derive key using PBKDF2
   - Encrypt data with selected cipher
5. **Output:** `saltHex:ivHex:ciphertextData` (with metadata)

### Decryption Process
1. **Input:** Paste ciphertext
2. **Match Exact Parameters:**
   - Algorithm (MUST match encryption)
   - Key Size (MUST match)
   - Cipher Mode (MUST match)
   - Padding (MUST match)
   - PBKDF2 Iterations (MUST match)
3. **Enter Passphrase:** Same passphrase used for encryption
4. **Decrypt:**
   - Parse: salt, IV, ciphertext
   - Derive key using PBKDF2 with same salt
   - Decrypt with same cipher configuration
5. **Output:** Original file data

---

## Parameter Combinations Guide

### High Security (Recommended)
```
Algorithm:      AES
Key Size:       256 bits
Mode:           CBC or CTR
Padding:        PKCS7
IV Size:        16 bytes
Salt Size:      16 bytes
Iterations:     100,000
Output Format:  Base64
```
**Use Case:** Sensitive personal data, financial records, medical information
**Performance:** ~50-100ms for typical image
**Security:** ✅ Excellent

### Balanced (Recommended for Most)
```
Algorithm:      AES
Key Size:       256 bits
Mode:           CBC
Padding:        PKCS7
IV Size:        16 bytes
Salt Size:      8 bytes
Iterations:     10,000
Output Format:  Base64
```
**Use Case:** General documents, photos, personal files
**Performance:** ~10-20ms for typical image
**Security:** ✅ Good

### Legacy System Compatibility
```
Algorithm:      TripleDES
Key Size:       168 bits
Mode:           CBC
Padding:        PKCS7
IV Size:        8 bytes
Salt Size:      8 bytes
Iterations:     1,000
Output Format:  Hex
```
**Use Case:** Compatibility with older systems
**Performance:** Fast
**Security:** ⚠️ Weak - only use if necessary

### Streaming/Real-time
```
Algorithm:      AES
Key Size:       256 bits
Mode:           CTR
Padding:        None
IV Size:        16 bytes
Salt Size:      16 bytes
Iterations:     50,000
Output Format:  Base64
```
**Use Case:** Real-time data, streaming applications
**Performance:** Excellent, parallelizable
**Security:** ✅ Excellent

---

## Important Security Notes

### ⚠️ Critical Requirements for Decryption

**ALL parameters must EXACTLY match encryption:**
1. ✅ Algorithm (AES/DES/TripleDES)
2. ✅ Key Size (128/192/256)
3. ✅ Cipher Mode (CBC/ECB/CFB/OFB/CTR)
4. ✅ Padding Mode (PKCS7/ANSI/ISO/None)
5. ✅ PBKDF2 Iterations (exact number)
6. ✅ Passphrase (exact password)

**Even ONE parameter difference = DECRYPTION FAILURE**

### Best Practices

1. **Save Encryption Parameters**
   ```
   {
     "algorithm": "AES",
     "keySize": 256,
     "mode": "CBC",
     "padding": "PKCS7",
     "iterations": 10000,
     "timestamp": "2026-01-12T10:30:00Z",
     "file": "mydata.encrypted"
   }
   ```

2. **Use Strong Passphrases**
   - ❌ Weak: `password123`, `abc123`, `123456`
   - ✅ Strong: `MyP@ssw0rd!2024$Secure`, `Tr0pic@lHummingbird$2024`
   - Minimum: 12+ characters, mixed case, numbers, symbols

3. **Store Securely**
   - Keep ciphertext and parameters in separate locations
   - Use password managers for passphrases
   - Back up encryption metadata separately

4. **Monitor Updates**
   - Larger iterations = slower but more secure
   - Update as attacks improve
   - Use 100,000+ iterations for new encryption

5. **Test Before Production**
   - Always test encryption/decryption cycle
   - Verify same parameters work
   - Test with actual data sizes

---

## Technical Details

### EVP Format (OpenSSL Compatible)
```
Structure: salt (16 chars hex) : iv (16 chars hex) : ciphertext (Base64)

Example:
A1B2C3D4E5F6G7H8:I1J2K3L4M5N6O7P8:U2FsdGVkX1...

Components:
- Salt:       8 bytes (16 hex characters)
- IV:         16 bytes (32 hex characters) for AES
- Ciphertext: Variable length Base64
```

### Block Sizes
| Algorithm | Block Size | Comment |
|-----------|-----------|---------|
| AES       | 16 bytes  | Fixed, always 16 |
| DES       | 8 bytes   | Legacy, smaller |
| TripleDES | 8 bytes   | Legacy, same as DES |

### Key Derivation (PBKDF2)
```
PBKDF2-HMAC-SHA256(password, salt, iterations, keyLength)

For AES-256:
keyLength = 32 bytes (256 bits)

For AES-128:
keyLength = 16 bytes (128 bits)
```

---

## Troubleshooting

### "Decryption failed - check passphrase"
**Possible causes:**
1. ❌ Wrong passphrase
2. ❌ Wrong algorithm selected
3. ❌ Wrong key size
4. ❌ Wrong cipher mode
5. ❌ Wrong padding
6. ❌ Wrong iterations value

**Solution:** Verify ALL parameters match encryption settings

### "Invalid ciphertext format"
**Possible causes:**
1. ❌ Corrupted ciphertext
2. ❌ Wrong encoding format (Base64 vs Hex)
3. ❌ Missing salt or IV separator

**Solution:** Check ciphertext integrity, verify format

### Decryption produces garbage
**Possible causes:**
1. ❌ Wrong passphrase (decrypts but wrong result)
2. ❌ Corrupted data
3. ❌ Parameter mismatch

**Solution:** Verify passphrase, check parameters again

---

## Examples

### Example 1: Encrypt Image with AES-256
```
File: photo.jpg (2.5 MB)
Parameters:
- Algorithm: AES
- Key Size: 256
- Mode: CBC
- Padding: PKCS7
- IV Size: 16
- Salt Size: 8
- Iterations: 10000
- Passphrase: "MySecurePhoto2024!"

Result:
Output: A1B2C3D4E5F6G7H8:I1J2K3L4M5N6O7P8:U2FsdGVkX1FkVmF...
Metadata: Saved automatically
```

### Example 2: Decrypt with Matching Parameters
```
Ciphertext: A1B2C3D4E5F6G7H8:I1J2K3L4M5N6O7P8:U2FsdGVkX1FkVmF...
Parameters:
- Algorithm: AES (MUST match)
- Key Size: 256 (MUST match)
- Mode: CBC (MUST match)
- Padding: PKCS7 (MUST match)
- Iterations: 10000 (MUST match)
- Passphrase: "MySecurePhoto2024!" (MUST match)

Result:
Success! Original photo.jpg recovered
```

---

## References

- **NIST FIPS 197:** AES Specification
- **NIST SP 800-132:** PBKDF2 Specification
- **RFC 5652:** Cryptographic Message Syntax
- **OpenSSL EVP:** OpenSSL Key Derivation

---

**Version:** 1.0  
**Last Updated:** January 12, 2026  
**Status:** Production Ready ✅
