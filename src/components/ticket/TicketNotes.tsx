import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TicketNote {
  id: string;
  content: string;
  created_at: string;
}

interface TicketNotesProps {
  ticketId: string;
}

export const TicketNotes = ({ ticketId }: TicketNotesProps) => {
  const [newNote, setNewNote] = useState("");
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["ticket-notes", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_notes")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TicketNote[];
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from("ticket_notes")
        .insert([{ ticket_id: ticketId, content }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-notes", ticketId] });
      setNewNote("");
      toast.success("Note added successfully");
    },
    onError: (error) => {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote);
    }
  };

  if (isLoading) return <div>Loading notes...</div>;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={!newNote.trim()}>
          Add Note
        </Button>
      </form>
      <div className="space-y-2">
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              {new Date(note.created_at).toLocaleString()}
            </p>
            <p className="mt-1">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};