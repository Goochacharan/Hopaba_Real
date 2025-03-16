
import React from 'react';
import MainLayout from '@/components/MainLayout';

const MyList = () => {
  return (
    <MainLayout>
      <section className="py-8">
        <h1 className="text-3xl font-medium mb-6">My List</h1>
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <p className="text-muted-foreground">Your saved locations will appear here.</p>
        </div>
      </section>
    </MainLayout>
  );
};

export default MyList;
