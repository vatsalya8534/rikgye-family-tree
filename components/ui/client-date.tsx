"use client";

import { useState, useEffect } from "react";

interface ClientDateProps {
  date?: string | Date | null;
}

function ClientDate({ date }: ClientDateProps) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    if (date) {
      setFormatted(new Date(date).toLocaleString());
    }
  }, [date]);

  return <>{formatted || "-"}</>;
}

export default ClientDate;