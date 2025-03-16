
import React from 'react';
import MainLayout from '@/components/MainLayout';

const Events = () => {
  return (
    <MainLayout>
      <section className="py-8">
        <h1 className="text-3xl font-medium mb-6">Upcoming Events</h1>
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <p className="text-muted-foreground">Events near you will appear here.</p>
        </div>
      </section>
    </MainLayout>
  );
};

export default Events;
