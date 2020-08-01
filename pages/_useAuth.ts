import { useEffect, useState } from 'react'
import { Secret } from './_types'

export enum VerifyRequestStatus {
  loading,
  idle,
  verifing,
  verified,
  failed,
}

type VerifyState = {
  status: VerifyRequestStatus
}

type Session = {
  secret: string
}

export class SaveSessionError extends Error {
  message = 'Error on try to save the session.'
}

export class SessionParserError extends Error {
  message = 'Saved session is broken'
}

export function saveSession(session: Session): Session {
  try {
    window.localStorage.setItem('session', JSON.stringify(session))
    return session
  } catch {
    throw new SaveSessionError()
  }
}

function getSession(): Session | undefined {
  try {
    const serializedSession = window.localStorage.getItem('session')
    if (!serializedSession) return undefined
    return JSON.parse(serializedSession)
  } catch (error) {
    throw new SessionParserError()
  }
}

export function removeSession() {
  window.localStorage.removeItem('session')
}

function verifyAuthRequest(secret: Secret) {
  return fetch(`/api/auth/verify`, {
    headers: {
      authorization: secret,
      'Content-Type': 'application/json',
    },
  })
}

export default function useAuth() {
  const [verifyState, setVerifyState] = useState<VerifyState>({
    status: VerifyRequestStatus.loading,
  })

  useEffect(() => {
    const currentSession = getSession()

    setVerifyState({
      status: currentSession
        ? VerifyRequestStatus.verified
        : VerifyRequestStatus.idle,
    })
  }, [])

  const verify = async (secret: Secret) => {
    if (verifyState.status === VerifyRequestStatus.verifing) {
      return
    }

    setVerifyState({
      status: VerifyRequestStatus.verifing,
    })

    const response = await verifyAuthRequest(secret)

    if (response.status === 204) {
      saveSession({ secret })
      setVerifyState({
        status: VerifyRequestStatus.verified,
      })
    } else {
      setVerifyState({
        status: VerifyRequestStatus.failed,
      })
    }
  }

  const isLoading = verifyState.status === VerifyRequestStatus.loading
  const isVerifying = verifyState.status === VerifyRequestStatus.verifing
  const isVerified = verifyState.status === VerifyRequestStatus.verified
  const verificationFailed = verifyState.status === VerifyRequestStatus.failed

  return {
    verify,
    verifyState,
    isVerifying,
    isVerified,
    isLoading,
    verificationFailed,
  }
}
