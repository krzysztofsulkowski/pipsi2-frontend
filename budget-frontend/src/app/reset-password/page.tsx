"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ShowUrlData() {
  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  return (
    <div>
      <h1>Strona Resetowania Hasła</h1>
      
      
      {token ? (
        <p><strong>Token:</strong> {token}</p>
      ) : (
        <p style={{ color: 'red' }}><strong>Token:</strong> BRAK</p>
      )}
      
      {email ? (
        <p><strong>Email:</strong> {email}</p>
      ) : (
        <p style={{ color: 'red' }}><strong>Email:</strong> BRAK</p>
      )}
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Wczytywanie parametrów...</div>}>
      <ShowUrlData />
    </Suspense>
  );
}