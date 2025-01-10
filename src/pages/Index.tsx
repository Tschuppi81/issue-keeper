import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TicketForm } from "@/components/TicketForm";
import { TicketDashboard } from "@/components/TicketDashboard";

const Index = () => {
  const [isStaff, setIsStaff] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Ticket System</h1>
          <Button
            variant="outline"
            onClick={() => setIsStaff(!isStaff)}
            className="ml-auto"
          >
            {isStaff ? "Submit Ticket" : "Staff Dashboard"}
          </Button>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {isStaff ? <TicketDashboard /> : <TicketForm />}
      </main>
    </div>
  );
};

export default Index;