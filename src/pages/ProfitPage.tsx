import React from 'react';
import { ProfitCalendar } from '../components/ProfitCalendar/ProfitCalendar';
import { PageContainer } from '../components/Layout/PageContainer';

export function ProfitPage() {
  return (
    <PageContainer>
      <ProfitCalendar />
    </PageContainer>
  );
}
