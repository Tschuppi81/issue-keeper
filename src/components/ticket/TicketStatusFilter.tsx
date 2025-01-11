import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type TicketStatus = "all" | "open" | "in progress" | "done" | "closed";

interface TicketStatusFilterProps {
  value: TicketStatus;
  onChange: (value: TicketStatus) => void;
}

export const TicketStatusFilter = ({ value, onChange }: TicketStatusFilterProps) => {
  return (
    <RadioGroup
      defaultValue={value}
      onValueChange={(value) => onChange(value as TicketStatus)}
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
        <RadioGroupItem value="in progress" id="in-progress" />
        <Label htmlFor="in-progress">In Progress</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="done" id="done" />
        <Label htmlFor="done">Completed</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="closed" id="closed" />
        <Label htmlFor="closed">Closed</Label>
      </div>
    </RadioGroup>
  );
};