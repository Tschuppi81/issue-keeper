import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Ticket = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  issue: string;
  status: "open" | "progress" | "done";
  created_at: string;
  duplicate_of: string | null;
};

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
        <RadioGroup
          defaultValue="all"
          onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">All Tickets</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="open" id="open" />
            <Label htmlFor="open">Open</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="progress" id="progress" />
            <Label htmlFor="progress">In Progress</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="done" id="done" />
            <Label htmlFor="done">Completed</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid gap-4">
        {filteredTickets.map((ticket) => {
          const duplicateTicket = getDuplicateTicket(ticket.duplicate_of);
          
          return (
            <Card key={ticket.id} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  Ticket #{ticket.id.slice(0, 8)}
                </CardTitle>
                <div className="flex gap-2">
                  {ticket.duplicate_of && (
                    <Badge variant="secondary">
                      Duplicate of #{ticket.duplicate_of.slice(0, 8)}
                    </Badge>
                  )}
                  <Badge className={statusColors[ticket.status]}>
                    {statusLabels[ticket.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div>
                    <span className="font-semibold">From:</span> {ticket.name} (
                    {ticket.email})
                  </div>
                  {ticket.phone && (
                    <div>
                      <span className="font-semibold">Phone:</span> {ticket.phone}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Issue:</span> {ticket.issue}
                  </div>
                  <div>
                    <span className="font-semibold">Created:</span>{" "}
                    {new Date(ticket.created_at).toLocaleString()}
                  </div>
                  {duplicateTicket && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="font-semibold mb-2">Original Ticket:</p>
                      <p>{duplicateTicket.issue}</p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    {!ticket.duplicate_of && (
                      <Select
                        onValueChange={(duplicateOfId) => {
                          markAsDuplicateMutation.mutate({
                            ticketId: ticket.id,
                            duplicateOfId,
                          });
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Mark as duplicate of..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tickets
                            .filter((t) => t.id !== ticket.id && !t.duplicate_of)
                            .map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                #{t.id.slice(0, 8)} - {t.issue.slice(0, 30)}...
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    {ticket.status === "open" && !ticket.duplicate_of && (
                      <Button
                        onClick={() => 
                          updateTicketMutation.mutate({
                            ticketId: ticket.id,
                            newStatus: "progress"
                          })
                        }
                      >
                        Accept Ticket
                      </Button>
                    )}
                    {ticket.status === "progress" && !ticket.duplicate_of && (
                      <Button
                        onClick={() => 
                          updateTicketMutation.mutate({
                            ticketId: ticket.id,
                            newStatus: "done"
                          })
                        }
                        className="bg-ticket-done hover:bg-ticket-done/90"
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};