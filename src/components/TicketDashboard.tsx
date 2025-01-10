import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Ticket = {
  id: number;
  name: string;
  email: string;
  phone: string;
  issue: string;
  status: "open" | "progress" | "done";
  createdAt: string;
};

// Mock data - will be replaced with real data from backend
const mockTickets: Ticket[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    issue: "Cannot access account",
    status: "open",
    createdAt: "2024-02-20T10:00:00Z",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "098-765-4321",
    issue: "Payment failed",
    status: "progress",
    createdAt: "2024-02-19T15:30:00Z",
  },
];

const statusColors = {
  open: "bg-ticket-open text-white",
  progress: "bg-ticket-progress text-white",
  done: "bg-ticket-done text-white",
};

const statusLabels = {
  open: "Open",
  progress: "In Progress",
  done: "Completed",
};

export const TicketDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  const updateTicketStatus = (ticketId: number, newStatus: Ticket["status"]) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Ticket Dashboard</h1>
      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">
                Ticket #{ticket.id}
              </CardTitle>
              <Badge className={statusColors[ticket.status]}>
                {statusLabels[ticket.status]}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div>
                  <span className="font-semibold">From:</span> {ticket.name} (
                  {ticket.email})
                </div>
                <div>
                  <span className="font-semibold">Phone:</span> {ticket.phone}
                </div>
                <div>
                  <span className="font-semibold">Issue:</span> {ticket.issue}
                </div>
                <div className="flex gap-2 mt-4">
                  {ticket.status === "open" && (
                    <Button
                      onClick={() => updateTicketStatus(ticket.id, "progress")}
                    >
                      Accept Ticket
                    </Button>
                  )}
                  {ticket.status === "progress" && (
                    <Button
                      onClick={() => updateTicketStatus(ticket.id, "done")}
                      className="bg-ticket-done hover:bg-ticket-done/90"
                    >
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};