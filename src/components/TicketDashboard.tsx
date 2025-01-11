import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TicketStatusFilter } from "./ticket/TicketStatusFilter";
import { TicketCard } from "./ticket/TicketCard";

type Ticket = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  issue: string;
  status: "open" | "in progress" | "done" | "closed";
  created_at: string;
  duplicate_of: string | null;
};

const fetchTickets = async () => {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Ticket[];
};

export const TicketDashboard = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | Ticket["status"]>("all");
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets,
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, newStatus }: { ticketId: string; newStatus: Ticket["status"] }) => {
      const { error } = await supabase
        .from("tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket status updated successfully");
    },
    onError: (error) => {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket status");
    },
  });

  const markAsDuplicateMutation = useMutation({
    mutationFn: async ({ ticketId, duplicateOfId }: { ticketId: string; duplicateOfId: string }) => {
      const { error } = await supabase
        .from("tickets")
        .update({ duplicate_of: duplicateOfId })
        .eq("id", ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket marked as duplicate");
    },
    onError: (error) => {
      console.error("Error marking ticket as duplicate:", error);
      toast.error("Failed to mark ticket as duplicate");
    },
  });

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading tickets...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-6">Error loading tickets: {error.message}</div>;
  }

  const filteredTickets = tickets.filter(
    (ticket) => statusFilter === "all" || ticket.status === statusFilter
  );

  const getDuplicateTicket = (duplicateId: string | null) => {
    if (!duplicateId) return null;
    return tickets.find((t) => t.id === duplicateId);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Ticket Dashboard</h1>
      
      <div className="mb-6">
        <TicketStatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            allTickets={tickets}
            onUpdateStatus={(ticketId, newStatus) =>
              updateTicketMutation.mutate({ ticketId, newStatus })
            }
            onMarkDuplicate={(ticketId, duplicateOfId) =>
              markAsDuplicateMutation.mutate({ ticketId, duplicateOfId })
            }
            duplicateTicket={getDuplicateTicket(ticket.duplicate_of)}
          />
        ))}
      </div>
    </div>
  );
};