import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketNotes } from "./TicketNotes";

interface Ticket {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  issue: string;
  status: "open" | "in progress" | "done" | "closed";
  created_at: string;
  duplicate_of: string | null;
}

interface TicketCardProps {
  ticket: Ticket;
  allTickets: Ticket[];
  onUpdateStatus: (ticketId: string, newStatus: Ticket["status"]) => void;
  onMarkDuplicate: (ticketId: string, duplicateOfId: string) => void;
  duplicateTicket?: Ticket | null;
}

const statusColors = {
  open: "bg-ticket-open text-white",
  "in progress": "bg-ticket-progress text-white",
  done: "bg-ticket-done text-white",
  closed: "bg-gray-500 text-white",
};

const statusLabels = {
  open: "Open",
  "in progress": "In Progress",
  done: "Completed",
  closed: "Closed",
};

export const TicketCard = ({
  ticket,
  allTickets,
  onUpdateStatus,
  onMarkDuplicate,
  duplicateTicket,
}: TicketCardProps) => {
  return (
    <Card className="w-full">
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
            <span className="font-semibold">From:</span> {ticket.name} ({ticket.email})
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
              <>
                <Select
                  onValueChange={(duplicateOfId) => {
                    onMarkDuplicate(ticket.id, duplicateOfId);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Mark as duplicate of..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allTickets
                      .filter((t) => t.id !== ticket.id && !t.duplicate_of)
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          #{t.id.slice(0, 8)} - {t.issue.slice(0, 30)}...
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {ticket.status === "open" && (
                  <Button
                    onClick={() => onUpdateStatus(ticket.id, "in progress")}
                  >
                    Accept Ticket
                  </Button>
                )}
                {ticket.status === "in progress" && (
                  <Button
                    onClick={() => onUpdateStatus(ticket.id, "done")}
                    className="bg-ticket-done hover:bg-ticket-done/90"
                  >
                    Mark as Complete
                  </Button>
                )}
                {(ticket.status === "done" || ticket.status === "in progress") && (
                  <Button
                    onClick={() => onUpdateStatus(ticket.id, "closed")}
                    variant="destructive"
                  >
                    Close Ticket
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Notes</h3>
            <TicketNotes ticketId={ticket.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};