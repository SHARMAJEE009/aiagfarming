"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface DeleteFieldButtonProps {
  fieldId: string;
  fieldName: string;
}

export function DeleteFieldButton({ fieldId, fieldName }: DeleteFieldButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the field "${fieldName}"? This action cannot be undone and will delete all associated season and spray records.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/fields/${fieldId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Refresh the page data smoothly
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Failed to delete field: ${data.error || "Unknown error"}`);
        setIsDeleting(false);
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred while deleting the field.");
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      size="sm" 
      variant="ghost" 
      onClick={handleDelete}
      loading={isDeleting}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
