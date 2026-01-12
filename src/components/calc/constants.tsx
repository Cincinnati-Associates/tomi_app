import React from 'react';

export const DEFAULT_HOME_PRICE = 650000;
export const MIN_HOME_PRICE = 250000;
export const MAX_HOME_PRICE = 3000000;
export const HOME_PRICE_STEP = 10000;

export const DEFAULT_DOWN_PAYMENT_PERCENT = 20;
export const MIN_DOWN_PAYMENT_PERCENT = 0;
export const MAX_DOWN_PAYMENT_PERCENT = 50;
export const DOWN_PAYMENT_STEP = 1;

export const DEFAULT_INTEREST_RATE = 6.5;
export const MIN_INTEREST_RATE = 3.0;
export const MAX_INTEREST_RATE = 12.0;
export const INTEREST_RATE_STEP = 0.1;

export const DEFAULT_CO_OWNERS = 2;
export const MIN_CO_OWNERS = 1;
export const MAX_CO_OWNERS = 5;
export const CO_OWNERS_STEP = 1;

export const LOAN_TERM_YEARS = 30;

export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const PercentageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.5l-1.04-1.04a1.5 1.5 0 00-2.12 0L9.75 19.5m0-2.25l2.12-2.12a1.5 1.5 0 012.12 0L16.5 17.25m-6.75-6.75h.008v.008H9.75v-.008zm3.75 0h.008v.008h-.008v-.008z" />
  </svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.458M12 12.75a3 3 0 100-6 3 3 0 000 6zm-4.247 3.37A4.992 4.992 0 0112 15.75c1.393 0 2.67.527 3.648 1.372M12 12.75L12 15.75m0 0L12 18.75m0-3L14.25 15.75M12 15.75L9.75 15.75M3.75 15.75L3.75 18.75m0-3L6 15.75M20.25 15.75L20.25 18.75m0-3L18 15.75" />
  </svg>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-6.293a1 1 0 00-1.414-1.414L7.05 12.536A1 1 0 008.464 13.95l.707-.707a1 1 0 00-1.414-1.414L6.343 13.243a1 1 0 001.414 1.414l1.414-1.414zM10 2.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5zm0 12.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5zM3.05 4.464a.5.5 0 01.707 0l1.414 1.414a.5.5 0 01-.707.707L3.05 5.172a.5.5 0 010-.707zm12.472 9.024a.5.5 0 01.707 0l1.414 1.414a.5.5 0 01-.707.707l-1.414-1.414a.5.5 0 010-.707zM2.5 10a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm12.5 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zM4.464 15.536a.5.5 0 010-.707l1.414-1.414a.5.5 0 01.707.707l-1.414 1.414a.5.5 0 01-.707 0zm9.024-12.472a.5.5 0 010-.707l1.414-1.414a.5.5 0 01.707.707l-1.414 1.414a.5.5 0 01-.707 0z" clipRule="evenodd" />
  </svg>
);

export const DollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.219 12.768 11 12 11c-.768 0-1.536.219-2.121.727l-.879.659M7.5 14.25l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 10.219 12.768 10 12 10c-.768 0-1.536.219-2.121.727l-.879.659m0-3.376l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 8.219 12.768 8 12 8c-.768 0-1.536.219-2.121.727L7.5 9.375" />
  </svg>
);
